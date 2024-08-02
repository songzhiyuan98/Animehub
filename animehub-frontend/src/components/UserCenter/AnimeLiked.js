import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Typography, Avatar, Box, LinearProgress, Grid } from "@mui/material";
import axiosInstance from "../../utils/axiosInstance";

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
          border: "1px solid #ddd",
          borderRadius: "16px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          padding: 2,
          mt: 3,
        }}
      >
        <Grid container spacing={2}>
          {likedAnimes.map((anime) => (
            <Grid item xs={12} sm={6} md={3} key={anime.mal_id}>
              <Box
                onClick={() => handleCardClick(anime.mal_id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "16px",
                  transition: "transform 0.3s ease-in-out",
                  marginRight: 2,
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
                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                  {truncatedSynopsisForTitle(anime.title_japanese)}
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
