import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

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
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "8px",
        ml: depth * 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Avatar src={avatar} alt={username}>
          {!avatar && username[0].toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" sx={{ ml: 1 }}>
          {username}
        </Typography>
      </Box>
      <Typography variant="body1">{comment.content}</Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
        {formatDate(comment.createdAt)}
      </Typography>
      {currentUser && depth < 3 && (
        <Button
          size="small"
          onClick={() => setShowReplyForm(!showReplyForm)}
          sx={{ mt: 1 }}
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
  );
};

export default Comment;
