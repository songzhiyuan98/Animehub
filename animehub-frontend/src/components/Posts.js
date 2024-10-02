import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Container,
  CircularProgress,
} from "@mui/material";
import PostEditor from "./PostEditor";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  ThumbUp,
  ChatBubbleOutline,
  AccessTime,
  Add,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
const BASE_URL = "http://localhost:3000";

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 获取帖子
  const fetchPosts = async (pageToFetch = page, shouldReset = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/posts?page=${pageToFetch}&limit=10`
      );
      if (response.data && Array.isArray(response.data.posts)) {
        const newPosts = response.data.posts;
        setPosts((prevPosts) =>
          shouldReset ? newPosts : [...prevPosts, ...newPosts]
        );
        setHasMore(response.data.hasMore);
        setPage(response.data.currentPage + 1);
      } else {
        console.log("返回的数据格式不正确");
        setHasMore(false);
      }
    } catch (error) {
      console.error("获取帖子失败:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化帖子
  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  // 处理帖子提交
  const handleSubmitPost = async (formData) => {
    try {
      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Server response:", response.data);
      setIsEditorOpen(false);
      fetchPosts(1, true);
    } catch (error) {
      console.error("发布帖子失败:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    }
  };

  // 处理帖子点击
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // 截断文本
  const truncateText = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ""; // 如果没有日期字符串，返回空字符串
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(t("locale"), options);
  };

  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false}>
        <Box sx={{ padding: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 4,
                  height: 40,
                  backgroundColor: "#ed6000",
                  marginRight: 2,
                }}
              />
              <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                {t("postArea")}
              </Typography>
            </Box>
            <Button
              onClick={() => setIsEditorOpen(true)}
              variant="contained"
              startIcon={<Add />}
              sx={{
                backgroundColor: "#ed6000",
                "&:hover": {
                  backgroundColor: "#ff7f50",
                },
                borderRadius: 20,
                padding: "10px 20px",
              }}
            >
              {t("publishNewPost")}
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            {posts.map((post) => (
              <Box
                key={post._id}
                onClick={() => handlePostClick(post._id)}
                sx={{
                  marginBottom: 2,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
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
                <Grid container spacing={2}>
                  <Grid item xs={12} md={9}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        src={
                          post.author?.avatar
                            ? `${BASE_URL}${post.author.avatar}`
                            : undefined
                        }
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="subtitle1" color="text.secondary">
                        {post.author?.nickname || t("anonymousUser")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 2 }}
                      >
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      {truncateText(
                        t("postPreview", { preview: post.previewText }),
                        150
                      )}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      {post.category && (
                        <Chip
                          label={post.category}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                      >
                        {t("readTime", { minutes: post.readTime })}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 2 }}
                      >
                        {post.likes?.length || 0}
                      </Typography>
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <ChatBubbleOutline fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {post.comments?.length || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    {post.coverImage && (
                      <Avatar
                        src={`${BASE_URL}${post.coverImage}`}
                        variant="rounded"
                        sx={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
        {hasMore && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 4 }}>
            <Button
              onClick={() => fetchPosts()}
              disabled={isLoading}
              variant="contained"
              sx={{
                backgroundColor: "#ed6000",
                color: "white",
                borderRadius: "20px",
                padding: "10px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#ff7f50",
                  boxShadow: "0 6px 8px rgba(0,0,0,0.15)",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                  color: "#666",
                },
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isLoading ? t("loading") : t("loadMorePosts")}
            </Button>
          </Box>
        )}
      </Container>

      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        fullWidth
        maxWidth="lg"
        aria-labelledby="post-editor-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
            padding: 3,
          },
        }}
      >
        <PostEditor
          onSubmit={handleSubmitPost}
          onClose={() => setIsEditorOpen(false)}
        />
      </Dialog>
    </Box>
  );
};

export default Post;
