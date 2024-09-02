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
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: "16px",
                padding: 3,
                mb: 2,
                display: "flex",
                alignItems: "flex-start",
                width: "100%", // 确保每个通知卡片占满宽度
                boxSizing: "border-box", // 确保padding不会增加宽度
                "@supports (-webkit-backdrop-filter: none) or (backdrop-filter: none)":
                  {
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  },
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                },
              }}
              onClick={() => handleCardClick(notification)}
            >
              <Avatar
                alt={notification.sender.nickname}
                src={`${BASE_URL}${notification.sender.avatar}`}
                sx={{ width: 50, height: 50, mr: 2, flexShrink: 0 }} // 防止头像缩小
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {" "}
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  fontWeight="bold"
                  sx={{ wordBreak: "break-word" }}
                >
                  {notification.sender.nickname}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ wordBreak: "break-word" }}
                >
                  {notification.type === "reply"
                    ? "回复了你的评论"
                    : "评论了你的收藏"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, wordBreak: "break-word" }}
                >
                  {truncateText(notification.commentId.content, 50)}{" "}
                  {/* 限制内容字数为50 */}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {new Date(notification.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="caption"
                  color={notification.read ? "text.secondary" : "error"} // 未读消息用红色标识
                  sx={{ marginRight: 1 }}
                >
                  {notification.read ? "已读" : "未读"}
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="notification type"
                  sx={{ flexShrink: 0 }}
                >
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
