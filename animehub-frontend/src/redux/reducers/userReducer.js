//src/redux/redcuers/userReducers.js

const initialState = {
  user: null,
  isLoggedIn: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload, //payload包含用户文档，除了密码
        isLoggedIn: true,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isLoggedIn: false,
      };
    case "UPDATE_USER":
      console.log("Updated user:", action.payload); // 检查是否有新的 avatar 信息
      return {
        ...state,
        user: { ...state.user, ...action.payload }, // 更新用户信息，保留已有信息并合并新的更改
      };
    default:
      return state;
  }
};

export default userReducer;
