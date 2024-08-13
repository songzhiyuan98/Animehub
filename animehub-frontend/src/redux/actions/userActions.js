//src/redux/actions/userActions.js

//login action用于用户登录，payload包含用户信息
export const login = (user) => {
  localStorage.setItem("username", user.username); //json形式用户文档储存本地
  return {
    type: "LOGIN",
    payload: user, //后端返回的用户文档
  };
};

//update action用户用户资料更新，payload包含新的用户信息
export const updateUser = (user) => {
  return {
    type: "UPDATE_USER",
    payload: user, //后端返回的更新用户文档
  };
};

//logout action用于用户登出
export const logout = () => {
  console.log("logout action dispatched");
  localStorage.removeItem("username");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return {
    type: "LOGOUT",
  };
};

// 新增 action
export const setTokenExpired = (expired) => ({
  type: "SET_TOKEN_EXPIRED",
  payload: expired,
});
