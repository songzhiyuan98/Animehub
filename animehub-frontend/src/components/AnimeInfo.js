import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axiosInstance";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LoginPromptDialog from "./LoginPromptDialog";
import Comment from "./Comment";
import "../style.css";
import {
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  CircularProgress,
  Avatar,
  TextField,
  Grid,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import io from "socket.io-client";
import FullSynopsisDialog from "./FullSynopsisDialog";

const AnimeInfo = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userId = user ? user._id : null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const location = useLocation();
  const [isSynopsisDialogOpen, setIsSynopsisDialogOpen] = useState(false);
  const navigate = useNavigate();

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
          }, 2000); // 2秒后移除高亮效果，刚好是两次闪烁的时间
        }
      }, 1000); // 延迟500ms以确保元素已渲染
    }
  }, [location]);

  //监听动漫id变化获取动漫详情
  const fetchAnimeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/anime/${id}`
      );
      setAnime(response.data.data);
    } catch (error) {
      console.error("Error fetching anime details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    setIsCommentsLoading(true);
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/anime/${id}/comments`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    if (isLoggedIn && userId) {
      try {
        const response = await axiosInstance.get(
          `http://localhost:3000/api/favorites/check/${userId}/${id}`
        );
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    }
  }, [isLoggedIn, userId, id]);

  useEffect(() => {
    fetchAnimeDetails();
    fetchComments();
    checkFavoriteStatus();
  }, [fetchAnimeDetails, fetchComments, checkFavoriteStatus]);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("WebSocket connected");
      socket.emit("join", id);
    });

    socket.on("disconnect", () => console.log("WebSocket disconnected"));

    socket.on("newComment", (data) => {
      if (data.animeId === id) {
        console.log("Received new comment:", data);
        setComments((prevComments) => [data.comment, ...prevComments]);
      }
    });

    socket.on("newReply", (data) => {
      if (data.animeId === id) {
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

    return () => socket.disconnect();
  }, [id]);

  //处理添加评论函数，修改过还未验证，修改了不保存结果到newComment，通过websocket监听来实时更新
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axiosInstance.post(
        `http://localhost:3000/api/anime/${id}/comments`,
        {
          content: newComment,
        }
      );
      setNewComment(""); // 清空评论输入框
      // 移除了手动更新 comments 的逻辑，现在由 WebSocket 处理
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!content.trim()) return;
    try {
      const response = await axiosInstance.post(
        `http://localhost:3000/api/comments/${parentId}/reply`,
        {
          content: content,
        }
      );
      // 立即更新本地状态
      setComments((prevComments) =>
        updateReplies(prevComments, parentId, response.data)
      );
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  // 保留 updateReplies 函数，以备需要本地更新时使用
  const updateReplies = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment._id === parentId) {
        const replies = comment.replies || [];

        // 检查新回复是否已经存在
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

  //处理动漫播放按钮点击事件
  const handlePlayButton = (mal_id) => {
    navigate(`/anime-video/${mal_id}`);
  };

  //处理弹窗跳出
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  //处理关闭弹窗
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  //处理收藏按钮点击事件函数
  const handleFavoriteToggle = () => {
    console.log("Toggling favorite for anime:", id);
    if (isFavorite) {
      axiosInstance
        .post(`http://localhost:3000/api/favorites/remove`, {
          userId: userId,
          animeId: id,
        })
        .then((response) => {
          console.log("Favorite removed:", response.data);
          setIsFavorite(false);
        })
        .catch((error) => console.error("Error removing favorite: ", error));
    } else {
      axiosInstance
        .post(`http://localhost:3000/api/favorites/add`, {
          userId: userId,
          animeId: id,
        })
        .then((response) => {
          console.log("Favorite added:", response.data);
          setIsFavorite(true);
        })
        .catch((error) => console.error("Error adding favorite: ", error));
    }
  };

  const truncatedSynopsis = (text, maxLength = 350) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleOpenSynopsisDialog = () => {
    setIsSynopsisDialogOpen(true);
  };

  const handleCloseSynopsisDialog = () => {
    setIsSynopsisDialogOpen(false);
  };

  //加载动画
  if (loading) {
    return (
      <Box
        sx={{ width: "100%", backgroundColor: "#F2F2F2", minHeight: "100vh" }}
      >
        <LinearProgress />
      </Box>
    );
  }

  //动漫id不存在找不到动漫显示
  if (!anime) {
    return (
      <Box
        sx={{
          backgroundColor: "#F2F2F2",
          minHeight: "100vh",
          color: "#333333",
        }}
      >
        <Container maxWidth={false} sx={{ marginTop: 2 }}>
          <Typography>{t("animeNotFound")}</Typography>
        </Container>
      </Box>
    );
  }

  //主要页面具体实现渲染
  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            {anime.title_japanese}
          </Typography>
          <Box
            sx={{
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              height: "50vh",
              padding: 2,
              mt: 3,
              display: "flex",
              position: "relative",
            }}
          >
            {/* 左侧部分 */}
            <Box
              sx={{
                width: "50%",
                padding: 2,
                display: "flex",
                alignItems: "center",
                borderRight: "1px solid #ccc",
              }}
            >
              {/* 封面图片 */}
              <Box
                sx={{
                  width: "35%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 1,
                  backgroundColor: "#F2F2F2",
                  borderRadius: "16px",
                }}
              >
                <Avatar
                  alt={anime.title}
                  src={anime.images.jpg.large_image_url}
                  variant="square"
                  sx={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </Box>

              {/* 内容信息 */}
              <Box
                sx={{
                  width: "60%",
                  padding: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {anime.title_japanese}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {t("yearStatus", {
                    year: anime.aired.prop.from.year,
                    status: anime.status,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("animeDetails", {
                    type: anime.type,
                    episodes: anime.episodes,
                    genres: anime.genres.map((genre) => genre.name).join(" | "),
                  })}
                </Typography>
              </Box>
            </Box>

            {/* 右侧部分 */}
            <Box sx={{ width: "50%", padding: 2 }}>
              <Box
                sx={{
                  height: "50%",
                  borderBottom: "1px solid #ccc",
                  padding: 2,
                  position: "relative",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {t("synopsis")}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {truncatedSynopsis(anime.synopsis)}
                  </Typography>
                </Box>
                <Button
                  color="primary"
                  sx={{ position: "absolute", right: 0, bottom: 10 }}
                  onClick={handleOpenSynopsisDialog}
                >
                  {t("viewMore")}
                </Button>
              </Box>
              <Box sx={{ height: "50%", padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("statistics")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("liked", { count: anime.favorites })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("scoreAnime", { score: anime.score })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("scoredByAnime", { count: anime.scored_by })}
                </Typography>
              </Box>
            </Box>
            <IconButton
              sx={{
                position: "absolute",
                right: 140,
                bottom: -30,
                backgroundColor: isFavorite ? "#ed6000" : "#ed6000",
                borderRadius: "50%",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                color: "#fff",
                width: 72,
                height: 72,
                "&:hover": {
                  transform: "scale(1.2)",
                  backgroundColor: "#FFA07A",
                },
              }}
              onClick={() => {
                if (isLoggedIn) {
                  handleFavoriteToggle();
                } else {
                  handleOpenDialog();
                }
              }}
            >
              {isFavorite ? (
                <FavoriteIcon sx={{ fontSize: 36 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 36 }} />
              )}
            </IconButton>
            <IconButton
              onClick={() => handlePlayButton(anime.mal_id)}
              sx={{
                position: "absolute",
                right: 40,
                bottom: -30,
                backgroundColor: "#ed6000",
                borderRadius: "50%",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                color: "#fff",
                width: 72,
                height: 72,
                "&:hover": {
                  transform: "scale(1.2)",
                  backgroundColor: "#FFA07A",
                },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 评论部分 */}
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            {t("commentsZone")}
          </Typography>
          <Box
            sx={{
              minHeight: "20vh",
              mt: 3,
              display: "flex",
              flexDirection: "column",
              position: "relative",
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
      </Container>
      <LoginPromptDialog open={isDialogOpen} handleClose={handleCloseDialog} />
      <FullSynopsisDialog
        open={isSynopsisDialogOpen}
        handleClose={handleCloseSynopsisDialog}
        synopsis={anime?.synopsis}
      />
    </Box>
  );
};

export default AnimeInfo;
