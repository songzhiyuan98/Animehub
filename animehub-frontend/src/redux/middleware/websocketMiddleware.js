// src/redux/middleware/websocketMiddleware.js
import io from "socket.io-client";
import { addNotification } from "../actions/notificationActions";

const BACKEND_URL = process.env.REACT_APP_WS_URL;

const websocketMiddleware = () => {
  let socket = null;

  return (store) => (next) => (action) => {
    switch (action.type) {
      case "WS_CONNECT":
        if (socket !== null) {
          socket.close();
        }

        // 连接到 WebSocket 服务器
        socket = io(BACKEND_URL);

        // 连接成功后加入用户的"房间"
        socket.on("connect", () => {
          const userId = store.getState().user.user._id;
          socket.emit("join", userId);
        });

        // 监听新通知
        socket.on("newNotification", (notification) => {
          console.log("Redux Received new notification:", notification);
          store.dispatch(addNotification(notification));
        });

        break;
      case "WS_DISCONNECT":
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        break;
      default:
        return next(action);
    }

    return next(action);
  };
};

export default websocketMiddleware;
