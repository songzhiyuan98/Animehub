import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoVideos = async () => {
      try {
        const response = await axios.get(
          `https://api.jikan.moe/v4/anime/${id}/videos`
        ); //从外部api根据动漫id获取相关视频资料
        console.log("API response:", response.data); // 添加这行来查看完整的响应

        const promoVideos = response.data.data.promo || []; //获取pv视频
        const musicVideos = response.data.data.music_videos || []; //获取op视频

        // 合并 promo 和 music videos
        const allVideos = [
          ...promoVideos.map((video) => ({
            ...video,
            type: "promo",
          })),
          ...musicVideos.map((video) => ({
            ...video,
            type: "music",
          })),
        ]; //统一储存在allVideos数组里，具备属性类型和标题还有其他属性

        if (allVideos.length > 0) {
          setVideos(allVideos); //如果视频数组存在，执行一下逻辑
          setCurrentVideo(allVideos[0]);
          setLoading(false);
        } else {
          console.log("No videos found"); //如果视频数组为空，执行一下逻辑
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

  //获取youtube语言代码，根据当前语言设置，后续可能更新
  const getYouTubeLanguageCode = (language) => {
    switch (language) {
      case "zh":
        return "zh-Hans";
      case "en":
        return "en";
      // 添加其他语言的情况
      default:
        return "en"; // 默认使用英语
    }
  };

  const getVideoTypeLabel = (video) => {
    if (video.type === "promo") {
      return t("trailer");
    } else if (video.type === "music") {
      const match = video.title.match(/(OP|ED)\s*(\d+)?/i);
      if (match) {
        const type = match[1].toUpperCase();
        const number = match[2] || "";
        return `${type}${number}`;
      }
      return t("musicVideo");
    }
    return t("unknownType");
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
            {t("pvOpEdSelection")}
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
                    style={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                    src={`${
                      currentVideo.type === "promo"
                        ? currentVideo.trailer.embed_url
                        : currentVideo.video.embed_url
                    }?autoplay=1&mute=0&loop=1&playlist=${
                      currentVideo.type === "promo"
                        ? currentVideo.trailer.youtube_id
                        : currentVideo.video.youtube_id
                    }&rel=0&modestbranding=1&controls=1&cc_load_policy=1&cc_lang_pref=${getYouTubeLanguageCode(
                      currentLanguage
                    )}&hl=${getYouTubeLanguageCode(currentLanguage)}`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </>
              )}
            </Box>
            <Box
              sx={{
                width: "35%",
                maxHeight: "600px",
                overflow: "auto",
                marginLeft: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t("videoList")}
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
                    <ListItemText
                      primary={video.title}
                      secondary={
                        video.type === "promo"
                          ? t("trailer")
                          : `${getVideoTypeLabel(video)} - ${
                              video.meta?.author || ""
                            }`
                      }
                    />
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
