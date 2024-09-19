// 导入必要的模块和函数
import axios from "axios"; // 导入axios库用于HTTP请求
import { logout, setTokenExpired } from "../redux/actions/userActions"; // 从userActions导入登出和设置token过期的动作
import store from "../redux/store"; // 导入Redux store用于状态管理
import { clearNotifications } from "../redux/actions/notificationActions"; // 导入清除通知的动作

// 创建一个axios实例，设置基础URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 60000, // 增加超时时间到60秒
  maxContentLength: Infinity, // 取消客户端的内容长度限制
  maxBodyLength: Infinity, // 添加这行
  headers: {
    'Content-Type': 'application/json',
  }
});

// 定义token管理器，用于处理accessToken和refreshToken
const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"), // 获取accessToken
  getRefreshToken: () => localStorage.getItem("refreshToken"), // 获取refreshToken
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken); // 设置accessToken
    localStorage.setItem("refreshToken", refreshToken); // 设置refreshToken
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken"); // 清除accessToken
    localStorage.removeItem("refreshToken"); // 清除refreshToken
  },
};

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; // 在请求头中添加token
    }
    return config;
  },
  (error) => {
    console.error("请求拦截器错误:", error); // 记录请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response, // 对于成功的响应，直接返回
  async (error) => {
    const originalRequest = error.config; // 获取原始请求配置
    console.log(
      "响应拦截器捕获到错误:",
      error.response?.status
    );

    // 处理401和403错误（未授权或禁止访问）
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // 标记这个请求已经尝试过刷新令牌
      console.log("Token可能已过期，尝试刷新");

      try {
        // 尝试刷新令牌
        const { newAccessToken, newRefreshToken } = await refreshAccessToken();
        if (newAccessToken && newRefreshToken) {
          console.log("Token刷新成功");
          tokenManager.setTokens(newAccessToken, newRefreshToken);
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`; // 更新axios实例的默认头部
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`; // 更新原始请求的头部
          return axiosInstance(originalRequest); // 重试原始请求
        } else {
          throw new Error("刷新token失败");
        }
      } catch (refreshError) {
        console.error("刷新token过程中出错:", refreshError);
        store.dispatch(setTokenExpired(true)); // 设置token过期状态
        setTimeout(() => {
          console.log("由于刷新token失败，执行登出操作");
          tokenManager.clearTokens(); // 清除所有令牌
          store.dispatch(logout()); // 延迟执行登出操作
          store.dispatch(clearNotifications()); // 清除消息列表缓存
        }, 1000);
        return Promise.reject(refreshError);
      }
    }

    // 如果不是401或403错误，或者刷新失败，返回错误
    return Promise.reject(error);
  }
);

// 刷新访问令牌的函数
const refreshAccessToken = async () => {
  const refreshToken = tokenManager.getRefreshToken();
  console.log("刷新token", refreshToken);
  try {
    const response = await axios.post("http://localhost:3000/api/token", {
      token: refreshToken,
    });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;
    tokenManager.setTokens(newAccessToken, newRefreshToken);
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error("刷新访问令牌时出错:", error);
    tokenManager.clearTokens(); // 清除无效的令牌
    return { newAccessToken: null, newRefreshToken: null };
  }
};

export default axiosInstance; // 导出配置的axios实例
