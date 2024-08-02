import React, { useState, useEffect, useCallback } from "react"; //useState声明状态变量，useEffect在组件渲染后执行副作用操作，useCallback返回一个记忆化的回调函数
import { useNavigate } from "react-router-dom"; //导航钩子
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
} from "@mui/material";
import { styled } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState(""); //状态变量searchTerm，保存搜索框内容，初始化值为空字符串
  const [recommendations, setRecommendations] = useState([]); //状态变量recommendation，保存日推动漫信息，初始化为空数组
  const [currentAnimePage, setCurrentAnimePage] = useState(0);
  const [currentAnimeTotalPages, setCurrentAnimeTotalPages] = useState(1);
  const [loadingAnime, setLoadingAnime] = useState(false); //加载动画动漫日推
  const [posts, setPosts] = useState([]); //状态变量posts，保存帖子信息，初始化为空数组
  const [currentPage, setCurrentPage] = useState(1); //状态变量当前页面，初始化为1
  const [totalPages, setTotalPages] = useState(1); //状态变量总页面，初始化为1
  const [loading, setLoading] = useState(false); //状态变量加载状态，初始化为false
  const [canScroll, setCanScroll] = useState(true); // 是否可以滚动加载更多

  //在组件挂载时，执行日推和获取帖子两个函数
  useEffect(() => {
    fetchPosts(currentPage);
  }, []); //依赖性空数组[]表示这个effect只在组件挂载和卸载时执行一次

  const navigate = useNavigate();
  //处理动漫卡片点击事件
  const handleCardClick = (mal_id) => {
    navigate(`/anime/${mal_id}`);
  };

  // 获取日推动漫函数
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

  // 处理翻页功能
  const handleNextPage = () => {
    if (currentAnimePage < currentAnimeTotalPages - 1) {
      setCurrentAnimePage((prevPage) => prevPage + 1);
    } else {
      setCurrentAnimePage(0);
    }
  };

  //获取帖子函数，记忆化的回调函数
  const fetchPosts = useCallback(async (page) => {
    setLoading(true); //将加载状态变量设置为true
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/api/posts?page=${page}&limit=10"
      ); //向后端分页获取帖子路由发送请求获取数据，页面页page函数，limit默认为10
      const data = response.data; //储存响应数据到到data，数组数据包含posts（帖子信息），totalPages，currentPage
      setPosts((prevPosts) => {
        //检查新的帖子是否已经在当前post里，避免重复添加，防御性编程确保datapost是一个数组，否则返回空数组
        const newPosts = Array.isArray(data.posts)
          ? data.posts.filter(
              (post) => !prevPosts.some((p) => p._id === post._id)
            )
          : [];
        return [...prevPosts, ...newPosts];
      });
      setTotalPages(data.totalPages); //更新状态变量totalPage
      setCurrentPage(data.currentPage); //更新状态变量currentPage

      //如果帖子数量不足1页，禁用滚动加载
      if (data.totalPages === 1) {
        setCanScroll(false);
      }
    } catch (error) {
      console.error("Error fetching posts: " + error); //控制台打印错误消息
    } finally {
      setLoading(false); //无论获取成功与否，都将加载状态设置为false
    }
  }, []); //依赖为空数组，表示函数在组件的生命周期内不会改变

  //定义一个滚动事件处理函数，当检测页面滚动到接近底部，调用fetchPost函数加载帖子
  const handleScroll = useCallback(() => {
    //判断当前页面距离页面底部不足500像素，而且loading状态为false，当前页面小于总页面
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !loading &&
      currentPage < totalPages
    ) {
      const nextPage = currentPage + 1; //定义一个变量储存更新后的当前页面，防止异步函数潜在问题
      setCurrentPage(nextPage); //更新当前页面状态变量
      fetchPosts(nextPage); //调用fetchPost，参数为下一页，加载新帖子
    }
  }, [loading, currentPage, totalPages, fetchPosts]);

  //useEffect在handleScroll被调用时创建
  useEffect(() => {
    //根据canScroll状态函数决定是否添加滚动监视器
    if (canScroll) {
      window.addEventListener("scroll", handleScroll); //创建一个滚动监听器，一旦滚动，调用handleScroll函数判断是否加载更多帖子
      return () => window.removeEventListener("scroll", handleScroll); //再添加新的useEffect前卸载滚动监听器
    }
  }, [handleScroll]);

  //函数限制字数
  const truncatedSynopsisForTitle = (text) => {
    return text.length > 15 ? text.substring(0, 18) + "..." : text;
  };

  //更新搜索框的输入值
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  //处理搜索提交事件，逻辑还没写
  const handleSearchSubmit = async (event) => {
    event.preventDefault(); //防止浏览器默认提交
    //处理搜索逻辑，代写
  };

  // 定义截断文本的函数
  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  //如果在加载状态，渲染加载组件
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
          <Typography variant="h4" gutterBottom>
            热门日推
          </Typography>
          <Box
            sx={{
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              padding: 1,
              display: "flex",
              position: "relative",
            }}
          >
            {recommendations.map((anime) => (
              <Box
                key={anime.mal_id}
                onClick={() => handleCardClick(anime.mal_id)}
                sx={{
                  cursor: "pointer",
                  padding: 1,
                  marginRight: 2,
                  borderRadius: "16px",
                  transition: "transform 0.3s ease-in-out", // 添加过渡效果
                  "&:hover": {
                    transform: "scale(1.2)", // 悬停时放大5%
                  },
                }}
              >
                <Avatar
                  alt={anime.title_japanese}
                  src={anime.images.jpg.large_image_url}
                  variant="square"
                  sx={{ width: 189, height: 252, borderRadius: "8px" }}
                />
                <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                  {truncatedSynopsisForTitle(anime.title_japanese)}
                </Typography>
              </Box>
            ))}
            <IconButton
              onClick={handleNextPage}
              disabled={loading}
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
              <NavigateNextIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 新鲜帖子 */}
        <Box sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            新鲜帖子
          </Typography>
          <Box
            sx={{
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: "16px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              padding: 2,
              position: "relative",
            }}
          >
            {posts.map((post) => (
              <Box
                key={post._id}
                sx={{
                  marginBottom: 2,
                  display: "flex",
                  flexDirection: "row",
                  padding: 1,
                  borderRadius: "16px",
                }}
              >
                {post.image && (
                  <Avatar
                    src={`http://localhost:3000${post.image}`}
                    variant="square"
                    sx={{
                      width: 180,
                      height: 230,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" component="div">
                    {post.title}
                  </Typography>
                  <Typography variant="body1">
                    {truncateText(post.content, 250)}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Posted by {post.userId.username}
                  </Typography>
                </CardContent>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
