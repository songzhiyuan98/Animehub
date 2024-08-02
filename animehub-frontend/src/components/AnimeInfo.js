import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LoginPromptDialog from "./LoginPromptDialog";
import { useNavigate } from "react-router-dom"; //导航钩子
import {
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Avatar,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const AnimeInfo = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const userId = user ? user._id : null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `http://localhost:3000/api/anime/${id}`
        );
        setAnime(response.data.data);
        console.log(userId);
        console.log(typeof userId);
        console.log(id);
        console.log(typeof id);
      } catch (error) {
        console.error("Error fetching anime details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeDetails();
  }, [id]);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
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
    };

    const checkFavoriteStatus = async () => {
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
    };

    fetchAnimeDetails();
    checkFavoriteStatus();
  }, [id, userId, isLoggedIn]);

  const navigate = useNavigate();
  //处理动漫播放按钮点击事件
  const handlePlayButton = (mal_id) => {
    navigate(`/anime-video/${mal_id}`);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

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

  const truncatedSynopsis = (text) => {
    return text.length > 300 ? text.substring(0, 300) + "..." : text;
  };

  if (loading) {
    return (
      <Box
        sx={{ width: "100%", backgroundColor: "#F2F2F2", minHeight: "100vh" }}
      >
        <LinearProgress />
      </Box>
    );
  }

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
          <Typography>找不到该动漫</Typography>
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
                  {`Year: ${anime.aired.prop.from.year} | Status: ${anime.status}`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {`Type: ${anime.type} | Episodes: ${
                    anime.episodes
                  } | ${anime.genres.map((genre) => genre.name).join(" | ")}`}
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
                  简介
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {truncatedSynopsis(anime.synopsis)}
                  </Typography>
                </Box>
                <Button
                  color="primary"
                  sx={{ position: "absolute", right: 0, bottom: 0 }}
                >
                  查看更多
                </Button>
              </Box>
              <Box sx={{ height: "50%", padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                  统计数据
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Liked: ${anime.favorites}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Score: ${anime.score}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Scored by: ${anime.scored_by}`}
                </Typography>
              </Box>
            </Box>
            <IconButton
              sx={{
                position: "absolute",
                right: 140,
                bottom: -30,
                backgroundColor: isFavorite ? "#ff6f61" : "#ed6000",
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
                console.log("Favorite button clicked");
                if (isLoggedIn) {
                  console.log(
                    "User is logged in, calling handleFavoriteToggle"
                  );
                  handleFavoriteToggle();
                } else {
                  console.log("User is not logged in, opening dialog");
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
      </Container>
      <LoginPromptDialog open={isDialogOpen} handleClose={handleCloseDialog} />
    </Box>
  );
};

export default AnimeInfo;
