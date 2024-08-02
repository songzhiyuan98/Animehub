import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Avatar, // 为 AnimeCard 组件添加
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilterDialog from "./FilterDialog";

// AnimeCard 组件定义
const AnimeCard = ({ anime, onCardClick }) => {
  return (
    <Grid item xs={12} sm={6} md={2}>
      {/* 卡片容器 */}
      <Box
        onClick={() => onCardClick(anime.mal_id)}
        sx={{
          cursor: "pointer", // 鼠标悬停时显示为可点击状态
          borderRadius: "16px", // 设置卡片圆角
          transition: "transform 0.3s ease-in-out", // 添加变换动画效果
          padding: 2, // 内边距
          "&:hover": {
            transform: "scale(1.1)", // 鼠标悬停时放大卡片
          },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* 图片容器 */}
        <Box
          sx={{
            width: "100%",
            paddingTop: "133%", // 4:3 宽高比
            position: "relative",
          }}
        >
          {/* 动漫封面图片 */}
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
        {/* 动漫标题 */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            mt: 2,
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis", // 标题过长时显示省略号
          }}
        >
          {anime.title_japanese}
        </Typography>
      </Box>
    </Grid>
  );
};

// 主页面组件
const Index = () => {
  // 状态变量定义
  const [animes, setAnimes] = useState([]); // 存储动漫列表
  const [page, setPage] = useState(1); // 当前页码
  const [loading, setLoading] = useState(false); // 加载状态
  const [genres, setGenres] = useState([]); // 存储所有类型
  const [openFilter, setOpenFilter] = useState(false); // 控制过滤器对话框的开启状态
  // 修改初始 filters 状态
  const [filters, setFilters] = useState({
    query: "",
    genres: [],
    sort: "score", // 默认按人气排序
  });
  const navigate = useNavigate(); // 用于页面导航

  // 处理卡片点击事件
  const handleCardClick = (mal_id) => {
    navigate(`/anime/${mal_id}`); // 导航到动漫详情页
  };

  // 修改 useEffect 钩子
  useEffect(() => {
    const fetchAnimes = async () => {
      setLoading(true);
      try {
        const result = await axios.get("https://api.jikan.moe/v4/anime", {
          params: {
            q: filters.query,
            page: page,
            genres:
              filters.genres.length > 0 ? filters.genres.join(",") : undefined,
            order_by: filters.sort || "popularity", // 如果没有选择排序，默认按人气排序
            sort: "desc",
            limit: 20, // 每页显示的数量
          },
        });
        if (page === 1) {
          setAnimes(result.data.data);
        } else {
          setAnimes((prevAnimes) => [...prevAnimes, ...result.data.data]);
        }
      } catch (error) {
        console.error("Error fetching anime data:", error);
      }
      setLoading(false);
    };

    // 移除条件，总是获取动漫列表
    fetchAnimes();
  }, [filters, page]);

  // 获取所有类型
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          "https://api.jikan.moe/v4/genres/anime"
        );
        setGenres(response.data.data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // 修改 handleApplyFilters 函数
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setAnimes([]);
  };

  // 加载更多动漫
  const loadMore = () => {
    setPage(page + 1);
  };

  // 翻译查询
  const translateQuery = async (query) => {
    try {
      const response = await axios.get(
        "https://api.mymemory.translated.net/get",
        {
          params: {
            q: query,
            langpair: "zh|en",
          },
        }
      );
      return response.data.responseData.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return query; // 如果翻译失败，返回原始查询
    }
  };

  // 渲染 UI
  return (
    <Box
      sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}
    >
      <Container maxWidth={false} sx={{ marginTop: 2 }}>
        {/* 页面标题 */}
        <Typography variant="h4" gutterBottom>
          动漫索引
        </Typography>

        {/* 过滤器按钮 */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenFilter(true)}
          sx={{ mb: 3 }}
        >
          过滤选项
        </Button>

        {/* 过滤器对话框 */}
        <FilterDialog
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          genres={genres}
          onApply={handleApplyFilters}
          initialFilters={filters}
          translateQuery={translateQuery}
        />

        {/* 动漫列表容器 */}
        <Box
          sx={{
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            padding: 2,
            mt: 3,
          }}
        >
          <Grid container spacing={2}>
            {/* 渲染动漫卡片 */}
            {animes.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                onCardClick={handleCardClick}
              />
            ))}
          </Grid>
        </Box>

        {/* 加载指示器 */}
        {loading && (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        )}
        {/* 加载更多按钮 */}
        {!loading && animes.length > 0 && (
          <Button
            onClick={loadMore}
            variant="contained"
            color="primary"
            sx={{ display: "block", margin: "20px auto" }}
          >
            加载更多
          </Button>
        )}
      </Container>
    </Box>
  );
};

export default Index;
