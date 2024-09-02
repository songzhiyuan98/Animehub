import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Reply } from "lucide-react"; // 引入图标

const BASE_URL = "http://localhost:3000";

const Comment = ({ comment, onReply, currentUser, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsLoading(true);
    await onReply(comment._id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
    setIsLoading(false);
  };

  const getUserInfo = (user) => ({
    username: user?.nickname || "Anonymous",
    avatar: user?.avatar ? `${BASE_URL}${user.avatar}` : undefined,
  });

  const { username, avatar } = getUserInfo(comment.userId);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  return (
    <Box
      id={comment._id}
      sx={{
        backgroundColor:
          depth === 0 ? "rgba(255, 255, 255, 0.6)" : "transparent", // 顶级评论有背景，子评论透明背景
        borderRadius: depth === 0 ? "16px" : "16px", // 顶级评论有圆角，子评论没有
        padding: depth === 0 ? 3 : 2, // 顶级评论有较大padding，子评论较小
        mb: depth === 0 ? 2 : 0,
        display: "flex",
        alignItems: "flex-start",
        width: "100%",
        boxSizing: "border-box",
        ml: depth * 2,
        boxShadow: depth === 0 ? "0px 4px 8px rgba(0, 0, 0, 0.1)" : "none", // 顶级评论有阴影，子评论无阴影
      }}
    >
      <Avatar
        alt={username}
        src={avatar}
        sx={{ width: 50, height: 50, mr: 2, flexShrink: 0 }} // 保持头像大小一致
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          color="text.primary"
          fontWeight="bold"
          sx={{ wordBreak: "break-word" }}
        >
          {username}
        </Typography>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ wordBreak: "break-word" }}
        >
          {comment.content}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {formatDate(comment.createdAt)}
        </Typography>
        {currentUser && depth < 3 && (
          <Button
            size="small"
            onClick={() => setShowReplyForm(!showReplyForm)}
            sx={{ mt: 1 }}
            startIcon={<Reply size={16} />}
          >
            {showReplyForm ? "收起" : "回复"}
          </Button>
        )}
        {showReplyForm && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
            />
            <Button onClick={handleReply} sx={{ mt: 1 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "提交回复"}
            </Button>
          </Box>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                onReply={onReply}
                currentUser={currentUser}
                depth={depth + 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Comment;
