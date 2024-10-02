import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  Container,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ChatBubbleOutline, AccessTime } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";
import Comment from "./Comment";
import { ThumbsUp } from "lucide-react";
import LoginPromptDialog from "./LoginPromptDialog"; // 导入 LoginPromptDialog 组件
import "./PostDetail.css"; // 创建这个文件来存放文章内容的样式
import io from "socket.io-client";
import "../style.css"; // 确保路径正确
import { useTranslation } from "react-i18next";
const BASE_URL = "http://localhost:3000";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [processedContent, setProcessedContent] = useState("");
  const [socket, setSocket] = useState(null);
  const location = useLocation();
  const { t } = useTranslation();
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
      newSocket.emit("join", id);
    });

    newSocket.on("disconnect", () => console.log("WebSocket disconnected"));

    newSocket.on("newComment", (data) => {
      if (data.postId === id) {
        console.log("Received new comment:", data);
        setComments((prevComments) => [data.comment, ...prevComments]);
      }
    });

    newSocket.on("newReply", (data) => {
      if (data.postId === id) {
        console.log("Received new reply:", data);
        setComments((prevComments) => {
          const updatedComments = updateReplies(
            prevComments,
            data.parentCommentId,
            data.reply
          );
          console.log("Updated comments with new reply:", updatedComments);
          return updatedComments;
        });
      }
    });

    return () => newSocket.disconnect();
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}`);
        setPost(response.data);
        setIsLiked(response.data.likes.includes(user?._id));
        setLikeCount(response.data.likes.length);
      } catch (error) {
        console.error("获取帖子详情失败:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  useEffect(() => {
    const fetchComments = async () => {
      setIsCommentsLoading(true);
      try {
        const response = await axiosInstance.get(`/posts/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error("获取评论失败:", error);
      } finally {
        setIsCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    const fetchSimilarPosts = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}/similar`);
        setSimilarPosts(response.data);
      } catch (error) {
        console.error("获取相似帖子失败:", error);
      }
    };
    if (post) {
      fetchSimilarPosts();
    }
  }, [id, post]);

  useEffect(() => {
    const processContent = (content) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      // 处理图片
      doc.querySelectorAll("img").forEach((img) => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      });

      // 处理视频
      doc.querySelectorAll("iframe").forEach((iframe) => {
        const wrapper = doc.createElement("div");
        wrapper.className = "video-container";
        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      });

      return doc.body.innerHTML;
    };

    if (post) {
      setProcessedContent(processContent(post.content));
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axiosInstance.post(`/posts/${id}/comments`, {
        content: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("添加评论失败:", error);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!content.trim()) return;
    try {
      const response = await axiosInstance.post(`/comments/${parentId}/reply`, {
        content,
      });
      // 不需要手动更新评论，因为们使用 WebSocket 来实时更新
    } catch (error) {
      console.error("回复评论失败:", error);
    }
  };

  const updateReplies = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment._id === parentId) {
        const replies = comment.replies || [];
        const replyExists = replies.some((reply) => reply._id === newReply._id);
        return {
          ...comment,
          replies: replyExists ? replies : [...replies, newReply],
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateReplies(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  const handleLike = async () => {
    console.log("handleLike 被调用");
    if (!isLoggedIn) {
      console.log("用户未登录");
      setLoginPromptOpen(true); // 打开登录提示对话框
      return;
    }
    try {
      console.log("发送点赞请求");
      const response = await axiosInstance.post(`/posts/${id}/like`);
      console.log("点赞响应:", response.data);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likes);
    } catch (error) {
      console.error("点赞失败:", error);
    }
  };

  const handleLoginPromptClose = () => {
    setLoginPromptOpen(false);
  };

  useEffect(() => {
    // 当组件挂载或 location 改变时，滚动到页面顶部
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const commentId = queryParams.get("commentId");

    if (commentId) {
      setTimeout(() => {
        const commentElement = document.getElementById(commentId);
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          commentElement.classList.add("highlight");

          // 移除高亮效果
          setTimeout(() => {
            commentElement.classList.remove("highlight");
          }, 2000); // 2秒后移除高亮效果
        }
      }, 1000); // 延迟1秒以确保元素已渲染
    }
  }, [location]);

  if (loading) {
    return (
      <Box
        sx={{ width: "100%", backgroundColor: "#F2F2F2", minHeight: "100vh" }}
      >
        <LinearProgress />
      </Box>
    );
  }

  const SimilarPostItem = ({ post }) => {
    return (
      <Box
        component={Link}
        to={`/post/${post._id}`}
        sx={{
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          color: "inherit",
          padding: 1.5,
          borderRadius: "12px",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#f0f0f0",
            transform: "translateY(-3px)",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#333",
          }}
        >
          {post.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {post.author?.nickname}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AccessTime
              sx={{ fontSize: 14, mr: 0.5, color: "rgba(0, 0, 0, 0.6)" }}
            />
            <Typography variant="caption" color="text.secondary">
              {post.readTime
                ? t("readTime", { minutes: post.readTime })
                : t("unknownReadTime")}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  if (!post) {
    return (
      <Box
        sx={{
          backgroundColor: "#F2F2F2",
          minHeight: "100vh",
          color: "#333333",
        }}
      >
        <Container maxWidth={false} sx={{ marginTop: 2 }}>
          <Typography>{t("postNotExist")}</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Box sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            {/* 左侧文章内容 */}
            <Grid item xs={12} md={9}>
              <Card
                sx={{
                  overflow: "hidden", // 隐藏溢出的内容
                  borderRadius: "16px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardContent sx={{ padding: 4 }}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "#333",
                      mb: 3,
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px solid #eaeaea",
                    }}
                  >
                    <Avatar
                      src={
                        post.author?.avatar
                          ? `${BASE_URL}${post.author.avatar}`
                          : undefined
                      }
                      sx={{ mr: 2, width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {post.author?.nickname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("publishedAt", {
                          date: new Date(post.createdAt).toLocaleString(),
                        })}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ ml: "auto", display: "flex", alignItems: "center" }}
                    >
                      <Tooltip
                        title={isLiked ? t("unlikeTooltip") : t("likeTooltip")}
                      >
                        <IconButton
                          onClick={handleLike}
                          color={isLiked ? "primary" : "default"}
                        >
                          <ThumbsUp />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {likeCount}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      <div
                        className="post-content"
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                      />
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 3 }}
                  >
                    {post.tags &&
                      post.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          variant="outlined"
                          sx={{
                            borderRadius: "16px",
                            backgroundColor: "#f0f0f0",
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                            },
                          }}
                        />
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 右侧作者信息和帖子统计 */}
            <Grid item xs={12} md={3} sx={{ top: 20, alignSelf: "flex-start" }}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  mb: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("authorInfo")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={
                        post.author?.avatar
                          ? `${BASE_URL}${post.author.avatar}`
                          : undefined
                      }
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {post.author?.nickname}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("authorBio")}
                      </Typography>
                    </Box>
                  </Box>
                  {/* 这里可以添加关注作者的按钮等 */}
                </CardContent>
              </Card>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("postStats")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ThumbsUp size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {t("likes", { count: likeCount })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ChatBubbleOutline sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {t("comments", { count: comments.length })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime sx={{ fontSize: 20 }} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {post.readTime
                        ? t("readTime", { minutes: post.readTime })
                        : t("unknownReadTime")}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  mt: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("similarPosts")}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {similarPosts.map((similarPost) => (
                      <SimilarPostItem
                        key={similarPost._id}
                        post={similarPost}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 评论区 */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              {t("commentsZone")}
            </Typography>
            <Box
              sx={{
                minHeight: "20vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isLoggedIn ? (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("writeYourComment")}
                  />
                  <Button onClick={handleAddComment} sx={{ mt: 1 }}>
                    {t("postComment")}
                  </Button>
                </Box>
              ) : null}
              {isCommentsLoading ? (
                <CircularProgress />
              ) : (
                comments.map((comment) => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    onReply={handleReply}
                    currentUser={user}
                    depth={0}
                  />
                ))
              )}
              {!isLoggedIn && (
                <Box sx={{ textAlign: "center", mt: "auto" }}>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {t("loginToComment")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
      {/* 登录提示对话框 */}
      <LoginPromptDialog
        open={loginPromptOpen}
        handleClose={handleLoginPromptClose}
      />
    </Box>
  );
};

export default PostDetail;
