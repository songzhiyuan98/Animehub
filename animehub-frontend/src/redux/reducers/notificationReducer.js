// src/redux/reducers/notificationReducer.js

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      console.log(action.payload);
      return {
        ...state,
        notifications: action.payload,
      };
    case "ADD_NOTIFICATION":
      console.log("Reducer received ADD_NOTIFICATION action:", action.payload);
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case "CLEAR_NOTIFICATIONS":
      console.log("已清理通知缓存redux");
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    case "SET_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.payload,
      };
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification._id !== action.payload
        ),
        unreadCount: state.notifications.find(
          (n) => n._id === action.payload && !n.read
        )
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    default:
      return state;
  }
};

export default notificationReducer;
