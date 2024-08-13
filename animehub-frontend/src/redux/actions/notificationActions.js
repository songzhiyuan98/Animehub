import axiosInstance from "../../utils/axiosInstance";

// src/redux/actions/websocketActions.js
export const connectWebSocket = () => ({ type: "WS_CONNECT" });
export const disconnectWebSocket = () => ({ type: "WS_DISCONNECT" });

// src/redux/actions/notificationActions.js

export const addNotification = (notification) => ({
  type: "ADD_NOTIFICATION",
  payload: notification,
});

export const markNotificationAsRead = (notificationId) => {
  return async (dispatch) => {
    try {
      await axiosInstance.put(
        `http://localhost:3000/api/notifications/${notificationId}/read`
      );
      dispatch({
        type: "MARK_NOTIFICATION_READ",
        payload: notificationId,
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };
};

export const setNotifications = (notifications) => ({
  type: "SET_NOTIFICATIONS",
  payload: notifications,
});

export const clearNotifications = () => ({
  type: "CLEAR_NOTIFICATIONS",
});

export const fetchNotifications = () => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/notifications`
      );
      dispatch(setNotifications(response.data));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };
};

export const fetchUnreadCount = () => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/notifications/unread-count`
      );
      dispatch({
        type: "SET_UNREAD_COUNT",
        payload: response.data.count,
      });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };
};

export const deleteNotification = (notificationId) => {
  return async (dispatch) => {
    try {
      await axiosInstance.delete(
        `http://localhost:3000/api/notifications/${notificationId}`
      );
      dispatch({
        type: "DELETE_NOTIFICATION",
        payload: notificationId,
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };
};
