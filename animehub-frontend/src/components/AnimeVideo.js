import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const AnimeVideo = () => {
  const { id } = useParams(); //从请求路径获取动漫id
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [videos, setVideos] = useState([]); //从该动漫id获取的所有视频信息数组
  const [currentVideo, setCurrentVideo] = useState(null); //当前播放的视频信息
  const [loading, setLoading] = useState(true); //设置加载状态

  useEffect(() => {
    const fetchPromoVideos = async () => {
      try {
        const response = await axios.get(
          `https://api.jikan.moe/v4/anime/${id}/videos`
        ); //从外部api根据动漫id获取相关视频资料
        console.log("API response:", response.data); // 添加这行来查看完整的响应

        //确保数组promo预告片存在
        if (
          response.data &&
          response.data.data &&
          response.data.data.promo &&
          response.data.data.promo.length > 0
        ) {
          setVideos(response.data.data.promo); //储存视频信息数组
          setCurrentVideo(response.data.data.promo[0]); //储存第一个视频为默认当前视频
          setLoading(false); //设置加载状态为false
        } else {
          console.log("No promo videos found");
          setVideos([]);
          setCurrentVideo(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching videos: ", error); //错误响应，获取视频信息失败
      }
    };
    fetchPromoVideos(); //调用获取函数
  }, [id]); //钩子监控动漫id变化

  //处理视频切换事件
  const handleVideoClick = (video) => {
    setCurrentVideo(video); //更新当前播放视频状态
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
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false} sx={{ marginTop: 0 }}>
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            预告片PV
          </Typography>
          <Box
            sx={{
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              height: "70vh",
              padding: 2,
              mt: 3,
              display: "flex",
              position: "relative",
            }}
          >
            {/* Left Box - Current Video */}
            <Box sx={{ width: "60%", marginRight: 2 }}>
              {currentVideo && (
                <>
                  <Typography variant="h5" gutterBottom>
                    {currentVideo.title}
                  </Typography>
                  <iframe
                    width="100%"
                    height="90%"
                    margin="1"
                    src={`${currentVideo.trailer.embed_url}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.trailer.youtube_id}&rel=0&modestbranding=1&controls=1&cc_load_policy=1&cc_lang_pref=zh-Hans&hl=zh-Hans`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </>
              )}
            </Box>
            {/* Right Box - Video List */}
            <Box
              sx={{
                width: "35%",
                maxHeight: "600px",
                overflow: "auto",
                marginLeft: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Video List
              </Typography>
              <List>
                {videos.map((video, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleVideoClick(video)}
                    selected={
                      currentVideo && currentVideo.title === video.title
                    }
                  >
                    <ListItemText primary={video.title} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AnimeVideo;
