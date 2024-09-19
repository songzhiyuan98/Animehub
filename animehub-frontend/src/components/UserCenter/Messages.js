import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, IconButton, Badge } from "@mui/material";
import { MessageSquare, Reply, Bookmark } from "lucide-react";
import { markNotificationAsRead } from "../../redux/actions/notificationActions"; // 导入标记已读的 action

const Messages = () => {
  const notifications = useSelector(
    (state) => state.notifications.notifications
  );
  const dispatch = useDispatch();
  const BASE_URL = "http://localhost:3000";
  const navigate = useNavigate();

  const handleCardClick = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }
    if (notification.contentType === "anime") {
      console.log("message组件传递的评论id");
      console.log(notification.commentId);
      navigate(
        `/anime/${notification.contentId}?commentId=${notification.commentId._id}`
      );
    } else if (notification.contentType === "post") {
      navigate(
        `/post/${notification.contentId}?commentId=${notification.commentId}`
      );
    }
  };
  // 限制显示内容的字数
  const truncateText = (text, maxLength) => {
    if (!text) return ""; // 处理空文本
    if (text.length <= maxLength) return text; // 如果内容没有超出限制，直接返回
    return text.substring(0, maxLength) + "..."; // 超出限制时添加省略号
  };

  const getIcon = (type) => {
    switch (type) {
      case "comment":
        return <MessageSquare size={20} />;
      case "reply":
        return <Reply size={20} />;
      default:
        return <Bookmark size={20} />;
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Typography variant="h4" gutterBottom>
        消息中心
      </Typography>
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexDirection: "column", // 确保内容垂直排列
          width: "100%", // 确保宽度为100%
        }}
      >
        {notifications.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 10 }}>
            没有新消息
          </Typography>
        ) : (
          notifications.map((notification) => (
            <Box
              key={notification._id}
              onClick={() => handleCardClick(notification)}
              sx={{
                marginBottom: 2,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease-out",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(237, 96, 0, 0.05)",
                  transform: "translateY(-4px) scale(1.02)",
                  boxShadow: "0 8px 16px rgba(237, 96, 0, 0.2)",
                  border: "1px solid #ed6000",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Avatar
                  alt={notification.sender.nickname}
                  src={`${BASE_URL}${notification.sender.avatar}`}
                  sx={{ width: 50, height: 50, mr: 2 }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ wordBreak: "break-word" }}>
                    {notification.sender.nickname}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {notification.type === "reply" ? "回复了你的评论" : "评论了你的收藏"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: "break-word" }}>
                    {truncateText(notification.commentId.content, 50)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", ml: 2 }}>
                <Typography
                  variant="caption"
                  color={notification.read ? "text.secondary" : "error"}
                  sx={{ mb: 1 }}
                >
                  {notification.read ? "已读" : "未读"}
                </Typography>
                <IconButton edge="end" aria-label="notification type">
                  {getIcon(notification.type)}
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Messages;
