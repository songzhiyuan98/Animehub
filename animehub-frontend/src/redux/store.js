// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit"; //configureStore 是 Redux Toolkit 提供的简化 store 配置的方法
import userReducer from "./reducers/userReducer"; //userReducer 是管理用户状态的 reducer
import notificationReducer from "./reducers/notificationReducer";
import websocketMiddleware from "./middleware/websocketMiddleware";

const store = configureStore({
  reducer: {
    user: userReducer, //userReducer将作为store中的一个reducer（函数）
    notifications: notificationReducer, //新增通知
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(websocketMiddleware()),
});

export default store;
