//axios拦截器
import axios from "axios";
import { logout } from "../redux/actions/userActions"; // 导入 logout action
import store from "../redux/store"; // 导入 Redux store

//axios实例
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
});

let accessToken = localStorage.getItem("accessToken"); //从本地获取jwt令牌
let refreshToken = localStorage.getItem("refreshToken"); //从本地获取刷新令牌

//请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken"); // 动态获取最新的 accessToken
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; //如果jwt存在，发送请求头
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); //如果返回错误消息，验证失败，返回reject promise，等待响应拦截器
  }
);

//响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const { newAccessToken, newRefreshToken } = await refreshAccessToken();
      if (newAccessToken && newRefreshToken) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        localStorage.setItem("refreshToken", newRefreshToken); // 更新存储的刷新令牌
        refreshToken = newRefreshToken; // 更新内存中的刷新令牌
        return axiosInstance(originalRequest);
      } else {
        store.dispatch(logout()); // 如果刷新令牌无效，注销用户
      }
    } else if (!error.response) {
      // 处理没有响应的错误情况
      console.error("Network error or server is not reachable");
    }

    return Promise.reject(error);
  }
);

//处理刷新令牌
const refreshAccessToken = async () => {
  try {
    const response = await axios.post("http://localhost:3000/api/token", {
      refreshToken,
    });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken); // 更新本地存储的刷新令牌
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { newAccessToken: null, newRefreshToken: null };
  }
};

export default axiosInstance;
