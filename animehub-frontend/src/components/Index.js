import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Avatar,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilterDialog from "./FilterDialog";
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

const Index = () => {
  //动漫播放状态预定义
  const ANIME_STATUSES = [
    { value: "", label: "全部" },
    { value: "airing", label: "连载中" },
    { value: "complete", label: "已完结" },
    { value: "upcoming", label: "即将播出" },
  ];
  //视频类型预定义
  const ANIME_TYPES = [
    { value: "", label: "全部" },
    { value: "tv", label: "TV" },
    { value: "movie", label: "电影" },
    { value: "ova", label: "OVA" },
    { value: "special", label: "特别篇" },
    { value: "ona", label: "ONA（网络动画）" },
    { value: "tv_special", label: "电视特别篇" },
  ];
  //视频评级预定义
  const ANIME_RATINGS = [
    { value: "", label: "全部" },
    { value: "g", label: "普遍级" },
    { value: "pg", label: "建议父母指导" },
    { value: "pg13", label: "13岁以上" },
    { value: "r17", label: "限制级（17岁以上）" },
    { value: "r", label: "限制级（成人限定）" },
    { value: "rx", label: "成人专用" },
    // ... 其他评级
  ];
  //排序方式自定义
  const ANIME_ORDER_BY = [
    { value: "end_date", label: "结束日期" },
    { value: "start_date", label: "开始日期" },
    { value: "score", label: "评分" },
    { value: "popularity", label: "人气" },
    { value: "rank", label: "排名" },
    { value: "mal_id", label: "动漫ID" },
    { value: "title", label: "标题" },
    { value: "episodes", label: "集数" },
    { value: "scored_by", label: "评分人数" },
    // ... 其他排序选项
  ];
  //预定义成人内容开关
  const ANIME_SFW = [
    { value: true, label: "限制成人内容" },
    { value: false, label: "放开限制" },
  ];
  //升序降序
  const SORT_DIRECTIONS = [
    { value: "desc", label: "降序" },
    { value: "asc", label: "升序" },
  ];
  const ANIME_GENRES = [
    { value: 1, label: "动作" },
    { value: 2, label: "冒险" },
    { value: 4, label: "喜剧" },
    { value: 8, label: "剧情" },
    { value: 10, label: "奇幻" },
    { value: 22, label: "恋爱" },
    { value: 24, label: "科幻" },
    { value: 36, label: "日常" },
    { value: 30, label: "运动" },
    { value: 7, label: "悬疑" },
    { value: 37, label: "超自然" },
    { value: 23, label: "校园" },
    { value: 35, label: "后宫" },
    { value: 12, label: "成人" },
    { value: 62, label: "异世界" },
    { value: 19, label: "音乐" },
    { value: 38, label: "军事" },
    { value: 40, label: "心理" },
    { value: 29, label: "太空" },
    { value: 11, label: "游戏" },
    { value: 31, label: "超能力" },
  ];
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
    type: "",
    status: "",
    rating: "",
    order_by: "end_date",
    sort: "desc",
    page: 1,
    limit: 24,
    sfw: true, // 默认过滤成人内容
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
      console.log("Genres before API call:", filters.genres);
      try {
        const result = await axios.get("https://api.jikan.moe/v4/anime", {
          params: {
            q: filters.query,
            page: page,
            limit: filters.limit,
            type: filters.type,
            status: filters.status,
            rating: filters.rating,
            genres: filters.genres.join(","),
            order_by: filters.order_by,
            sort: filters.sort,
            sfw: filters.sfw,
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
        const [genresResponse] = await Promise.all([
          axios.get("https://api.jikan.moe/v4/genres/anime"),
        ]);
        setGenres(genresResponse.data.data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
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

  //函数限制字数
  const truncatedSynopsisForTitle = (text) => {
    if (!text) return ""; // 如果 text 是 null 或 undefined，返回空字符串
    return text.length > 10 ? text.substring(0, 14) + "..." : text;
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
      <Container maxWidth={false}>
        <Box sx={{ padding: 3 }}>
          {/* 页面标题 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {/* 页面标题 */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 4,
                  height: 40, // 你可以根据需要调整高度
                  backgroundColor: "#ed6000",
                  marginRight: 2,
                }}
              />
              <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                动漫星球
              </Typography>
            </Box>

            {/* 过滤器按钮 */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenFilter(true)}
              sx={{
                height: "50px", // 调整高度以匹配标题
                fontSize: "1.2rem", // 增大字体大小
                padding: "10px 20px", // 增加内边距
                borderRadius: "25px", // 圆角边框
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // 添加阴影效果
                transition: "all 0.3s ease", // 添加过渡效果
                "&:hover": {
                  transform: "translateY(-2px)", // 鼠标悬停时轻微上移
                  boxShadow: "0 6px 8px rgba(0,0,0,0.15)", // 鼠标悬停时增强阴影
                },
              }}
            >
              过滤选项
            </Button>
          </Box>
          {/* 过滤器对话框 */}
          <FilterDialog
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            genres={ANIME_GENRES}
            types={ANIME_TYPES}
            statuses={ANIME_STATUSES}
            ratings={ANIME_RATINGS}
            orderBy={ANIME_ORDER_BY}
            sortDirections={SORT_DIRECTIONS}
            sfws={ANIME_SFW}
            onApply={handleApplyFilters}
            initialFilters={filters}
            translateQuery={translateQuery}
          />
          {/* 动漫列表容器 */}
          <Box
            sx={{
              mt: 3,
            }}
          >
            <Grid container spacing={2}>
              {/* 渲染动漫卡片 */}
              {animes.map((anime) => (
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
                        alt={anime.title}
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
                      {truncatedSynopsisForTitle(anime.title_japanese || anime.title || "")}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          {/* 加载更多按钮和加载指示器 */}
          <Box
            sx={{
              mt: 4,
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: "primary.main",
                    animation: "pulse 1.5s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": {
                        opacity: 1,
                        transform: "scale(0.8)",
                      },
                      "50%": {
                        opacity: 0.5,
                        transform: "scale(1)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "scale(0.8)",
                      },
                    },
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mt: 2,
                    color: "text.secondary",
                    animation: "fadeInOut 1.5s ease-in-out infinite",
                    "@keyframes fadeInOut": {
                      "0%": { opacity: 0.5 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.5 },
                    },
                  }}
                >
                  正在加载更多精彩内容...
                </Typography>
              </Box>
            ) : (
              animes.length > 0 && (
                <Button
                  onClick={loadMore}
                  variant="outlined"
                  color="primary"
                  sx={{
                    padding: "10px 30px",
                    fontSize: "1.1rem",
                    borderRadius: "25px",
                    borderWidth: "2px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  加载更多
                </Button>
              )
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Index;
