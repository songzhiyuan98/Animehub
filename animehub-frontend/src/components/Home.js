import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../utils/axiosInstance";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  IconButton,
  CardMedia,
  CardActions,
  Avatar,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { ThumbUp, ChatBubbleOutline, AccessTime } from "@mui/icons-material";

const Home = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [currentAnimePage, setCurrentAnimePage] = useState(0);
  const [currentAnimeTotalPages, setCurrentAnimeTotalPages] = useState(1);
  const [loadingAnime, setLoadingAnime] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [canScroll, setCanScroll] = useState(true);
  const BASE_URL = "http://localhost:3000";

  useEffect(() => {
    fetchPosts(currentPage);
  }, []);

  const navigate = useNavigate();

  const handleCardClick = (mal_id) => {
    navigate(`/anime/${mal_id}`);
  };

  const fetchDailyRecommendations = async (page) => {
    setLoadingAnime(true);
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/daily-recommendations?page=${page}`
      );
      const { recommendations, totalrecommendationPages } = response.data;
      setRecommendations(recommendations);
      setCurrentAnimePage(page);
      setCurrentAnimeTotalPages(totalrecommendationPages);
    } catch (error) {
      console.error("Error fetching recommendations: " + error);
    } finally {
      setLoadingAnime(false);
    }
  };

  useEffect(() => {
    fetchDailyRecommendations(currentAnimePage);
  }, [currentAnimePage]);

  const handleNextPage = () => {
    if (currentAnimePage < currentAnimeTotalPages - 1) {
      setCurrentAnimePage((prevPage) => prevPage + 1);
    } else {
      setCurrentAnimePage(0);
    }
  };

  const fetchPosts = useCallback(async (page) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/api/posts?page=${page}&limit=10"
      );
      const data = response.data;
      setPosts((prevPosts) => {
        const newPosts = Array.isArray(data.posts)
          ? data.posts.filter(
              (post) => !prevPosts.some((p) => p._id === post._id)
            )
          : [];
        return [...prevPosts, ...newPosts];
      });
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);

      if (data.totalPages === 1) {
        setCanScroll(false);
      }
    } catch (error) {
      console.error("Error fetching posts: " + error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !loading &&
      currentPage < totalPages
    ) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [loading, currentPage, totalPages, fetchPosts]);

  useEffect(() => {
    if (canScroll) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const truncatedSynopsisForTitle = (text) => {
    return text.length > 10 ? text.substring(0, 14) + "..." : text;
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
  };

  const truncateText = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""; // 如果没有日期字符串，返回空字符串
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(t("locale"), options);
  };

  if (loadingAnime) {
    return (
      <Box
        sx={{ width: "100%", backgroundColor: "#F2F2F2", minHeight: "100vh" }}
      >
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false}>
        {/* 热门日推 */}
        <Box sx={{ padding: 3 }}>
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
              {t("dailyRecommendations")}
            </Typography>
          </Box>
          <Box
            sx={{
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "16px",
              position: "relative",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              padding: 2,
              mt: 3,
            }}
          >
            <Grid container spacing={1}>
              {recommendations.map((anime) => (
                <Grid item xs={12} sm={6} md={2} key={anime.mal_id}>
                  <Box
                    onClick={() => handleCardClick(anime.mal_id)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "16px",
                      transition: "transform 0.3s ease-in-out",
                      padding: 2,
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      overflow: "hidden",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        paddingTop: "133%",
                        position: "relative",
                      }}
                    >
                      <Avatar
                        alt={anime.title_japanese}
                        src={anime.images.jpg.large_image_url}
                        variant="square"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                      {truncatedSynopsisForTitle(anime.title_japanese)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <IconButton
              onClick={handleNextPage}
              disabled={loading}
              sx={{
                position: "absolute",
                right: 40,
                bottom: -40,
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
              <NavigateNextIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 新鲜帖子 */}
        <Box sx={{ padding: 3 }}>
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
              {t("hotPosts")}
            </Typography>
          </Box>
          <Box sx={{ padding: 0, mt: 3, position: "relative" }}>
            {posts.map((post) => (
              <Box
                key={post._id}
                onClick={() => navigate(`/post/${post._id}`)}
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
                      {truncateText(post.previewText, 150)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      {post.category && (
                        <Chip
                          label={t(post.category)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
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
                        src={`http://localhost:3000${post.coverImage}`}
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
      </Container>
    </Box>
  );
};

export default Home;
