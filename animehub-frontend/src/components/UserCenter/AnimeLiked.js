import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Typography, Avatar, Box, LinearProgress, Grid } from "@mui/material";
import axiosInstance from "../../utils/axiosInstance";
import { keyframes } from "@mui/system";

// 定义关键帧动画
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const borderAnimation = keyframes`
  0% { background-position: 0 0, 100% 0, 100% 100%, 0 100%; }
  100% { background-position: 100% 0, 100% 100%, 0 100%, 0 0; }
`;

const AnimeLiked = () => {
  const user = useSelector((state) => state.user.user);
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user._id) {
      setLoading(true);
      fetchLikedAnimes();
    }
  }, [user]);

  const fetchLikedAnimes = async () => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:3000/api/favorites/${user._id}`
      );
      setLikedAnimes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching favorite animes: ", error);
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleCardClick = (mal_id) => {
    navigate(`/anime/${mal_id}`);
  };

  const truncatedSynopsisForTitle = (title) => {
    return title.length > 18 ? title.substring(0, 18) + "..." : title;
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

  return (
    <Box sx={{ padding: 3, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        动漫收藏
      </Typography>
      <Box
        sx={{
          mt: 3,
        }}
      >
        <Grid container spacing={2}>
          {likedAnimes.map((anime) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={anime.mal_id}>
              <Box
                onClick={() => handleCardClick(anime.mal_id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "16px",
                  transition: "all 0.3s ease-out",
                  padding: 1,
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
                    opacity: 0,
                    transition: "opacity 0.3s ease-out",
                    zIndex: 1,
                  },
                  "&:hover": {
                    transform: "translateY(-8px) scale(1.05)",
                    boxShadow: "0 12px 20px rgba(237, 96, 0, 0.2)",
                    "&::before": {
                      opacity: 0.6,
                      animation: `${gradientShift} 3s ease infinite`,
                    },
                    "& .MuiTypography-root": {
                      transform: "scale(1.05)",
                      transition: "transform 0.3s ease-out",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(90deg, #ed6000 50%, transparent 50%), linear-gradient(90deg, #ed6000 50%, transparent 50%), linear-gradient(0deg, #ed6000 50%, transparent 50%), linear-gradient(0deg, #ed6000 50%, transparent 50%)",
                      backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
                      backgroundSize: "15px 2px, 15px 2px, 2px 15px, 2px 15px",
                      backgroundPosition: "0 0, 100% 100%, 0 100%, 100% 0",
                      animation: `${borderAnimation} 1s infinite linear`,
                      zIndex: 2,
                      pointerEvents: "none",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "133%",
                    position: "relative",
                    zIndex: 3,
                  }}
                >
                  <Avatar
                    alt={anime.title_japanese}
                    src={anime.image_url}
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
                <Typography 
                  variant="subtitle2" 
                  align="center" 
                  sx={{ 
                    mt: 1,
                    mb: 0.5,
                    zIndex: 3, 
                    position: "relative",
                    fontSize: "0.8rem",
                    lineHeight: 1.2,
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {anime.title_japanese}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AnimeLiked;
