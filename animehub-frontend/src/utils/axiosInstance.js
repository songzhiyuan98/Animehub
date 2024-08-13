import axios from "axios"; // 导入axios库
import { logout, setTokenExpired } from "../redux/actions/userActions"; // 从userActions导入logout和setTokenExpired动作
import store from "../redux/store"; // 导入Redux store

// 创建一个axios实例，设置基础URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
});

const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error); // 记录请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response, // 对于成功的响应，直接返回
  async (error) => {
    const originalRequest = error.config; // 获取原始请求配置
    console.log(
      "Response interceptor caught an error:",
      error.response?.status
    );

    // 处理401和403错误
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 标记这个请求已经尝试过刷新令牌
      console.log("Token might be expired, attempting to refresh");

      try {
        // 尝试刷新令牌
        const { newAccessToken, newRefreshToken } = await refreshAccessToken();
        if (newAccessToken && newRefreshToken) {
          console.log("Token refreshed successfully");
          tokenManager.setTokens(newAccessToken, newRefreshToken);
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`; // 更新axios实例的默认头部
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`; // 更新原始请求的头部
          return axiosInstance(originalRequest); // 重试原始请求
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
        store.dispatch(setTokenExpired(true)); // 设置token过期状态
        setTimeout(() => {
          console.log("Logging out due to refresh token failure");
          tokenManager.clearTokens(); // 清除所有令牌
          store.dispatch(logout()); // 延迟执行登出操作
        }, 1000);
        return Promise.reject(refreshError);
      }
    }

    // 如果不是401或403错误，或者刷新失败，返回错误
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  const refreshToken = tokenManager.getRefreshToken();
  console.log("refresh token", refreshToken);
  try {
    const response = await axios.post("http://localhost:3000/api/token", {
      token: refreshToken,
    });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;
    tokenManager.setTokens(newAccessToken, newRefreshToken);
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    tokenManager.clearTokens(); // 清除无效的令牌
    return { newAccessToken: null, newRefreshToken: null };
  }
};

export default axiosInstance; // 导出配置好的axios实例
