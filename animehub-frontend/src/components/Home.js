import React, { useState, useEffect, useCallback } from 'react'; //useState声明状态变量，useEffect在组件渲染后执行副作用操作，useCallback返回一个记忆化的回调函数
import axiosInstance from '../utils/axiosInstance';
import { AppBar, Toolbar, Typography, Container, Button, Box, TextField, Card, CardContent, CardMedia, CardActions } from '@mui/material';
import { styled } from '@mui/system';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const StyledCard = styled(Card)({
  width: 180,
  margin: 8,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  boxShadow: 'none',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
  },
});

const StyledCardMedia = styled(CardMedia)({
  borderRadius: 12,
  height: 250,
});

const Home = () => {
    const [searchTerm, setSearchTerm] = useState(''); //状态变量searchTerm，保存搜索框内容，初始化值为空字符串
    const [recommendations, setRecommendations] = useState([]); //状态变量recommendation，保存日推动漫信息，初始化为空数组
    const [posts, setPosts] = useState([]); //状态变量posts，保存帖子信息，初始化为空数组
    const [currentPage, setCurrentPage] = useState(1); //状态变量当前页面，初始化为1
    const [totalPages, setTotalPages] = useState(1); //状态变量总页面，初始化为1
    const [loading, setLoading] = useState(false); //状态变量加载状态，初始化为false
    const [canScroll, setCanScroll] = useState(true); // 是否可以滚动加载更多

    //在组件挂载时，执行日推和获取帖子两个函数
    useEffect (() => {
        fetchDailyRecommendations();
        fetchPosts(currentPage);
    }, []); //依赖性空数组[]表示这个effect只在组件挂载和卸载时执行一次

    //获取日推动漫函数
    const fetchDailyRecommendations = async() => {
        try {
            const response = await axiosInstance.get('http://localhost:3000/api/daily-recommendations'); //向后端日推路由发送请求获取数据
            setRecommendations(response.data); //将日推动漫数据存入recommendations状态变量
        }catch (error) {
            console.error('Error fetching recommendations: ' + error); //控制台打印错误消息
        }
    };

    //获取帖子函数，记忆化的回调函数
    const fetchPosts = useCallback(async(page) => {
        setLoading(true); //将加载状态变量设置为true
        try {
            const response = await axiosInstance.get('http://localhost:3000/api/posts?page=${page}&limit=10'); //向后端分页获取帖子路由发送请求获取数据，页面页page函数，limit默认为10
            const data = response.data; //储存响应数据到到data，数组数据包含posts（帖子信息），totalPages，currentPage
            setPosts((prevPosts) => {
                //检查新的帖子是否已经在当前post里，避免重复添加，防御性编程确保datapost是一个数组，否则返回空数组
                const newPosts = Array.isArray(data.posts) ? data.posts.filter(post => !prevPosts.some(p => p._id === post._id)) : [];
                return [...prevPosts, ...newPosts];
            });
            setTotalPages(data.totalPages); //更新状态变量totalPage
            setCurrentPage(data.currentPage); //更新状态变量currentPage

            //如果帖子数量不足1页，禁用滚动加载
            if (data.totalPages === 1){
                setCanScroll(false);
            }
        }catch (error) {
            console.error('Error fetching posts: ' + error); //控制台打印错误消息
        }finally{
            setLoading(false); //无论获取成功与否，都将加载状态设置为false
        }
    }, []); //依赖为空数组，表示函数在组件的生命周期内不会改变

    //定义一个滚动事件处理函数，当检测页面滚动到接近底部，调用fetchPost函数加载帖子
    const handleScroll = useCallback(() => {
        //判断当前页面距离页面底部不足500像素，而且loading状态为false，当前页面小于总页面
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading && currentPage < totalPages){
            const nextPage = currentPage + 1; //定义一个变量储存更新后的当前页面，防止异步函数潜在问题
            setCurrentPage(nextPage); //更新当前页面状态变量 
            fetchPosts(nextPage); //调用fetchPost，参数为下一页，加载新帖子
        }
    }, [loading, currentPage, totalPages, fetchPosts]);

    //useEffect在handleScroll被调用时创建
    useEffect (() => {
        //根据canScroll状态函数决定是否添加滚动监视器
        if (canScroll){
            window.addEventListener('scroll', handleScroll); //创建一个滚动监听器，一旦滚动，调用handleScroll函数判断是否加载更多帖子
            return () => window.removeEventListener('scroll', handleScroll); //再添加新的useEffect前卸载滚动监听器
        }
    }, [handleScroll]);

    //更新搜索框的输入值
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    //处理搜索提交事件，逻辑还没写
    const handleSearchSubmit = async(event) => {
        event.preventDefault(); //防止浏览器默认提交
        //处理搜索逻辑，代写

    };

    // 定义截断文本的函数
    const truncateText = (text, length) => {
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    return (
        <Box sx={{ backgroundColor: '#E9F1F6', minHeight: '100vh', color: '#15559A' }}>
          <Container maxWidth={false} sx={{ marginTop: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                热门日推
              </Typography>
              <Box display="flex">
                {recommendations.map(anime => (
                  <StyledCard key={anime.mal_id}>
                    <StyledCardMedia
                      component="img"
                      image={anime.images.jpg.image_url}
                      alt={anime.title}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div" noWrap>
                        {anime.title}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                ))}
                <Button sx={{ marginLeft: 2 }} onClick={fetchDailyRecommendations}>
                    <NavigateNextIcon />
                </Button>
              </Box>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h4" gutterBottom>
                新鲜帖子
              </Typography>
              <Box id="posts-container">
                {posts.map(post => (
                  <Card key={post._id} sx={{ marginBottom: 2, display: 'flex', flexDirection: 'row' }}>
                    {post.image && (
                      <CardMedia
                        component="img"
                        image={`http://localhost:3000${post.image}`}
                        alt={post.title}
                        sx={{ width: '180px', height: '230px', objectFit: 'cover', borderRadius: 12 }}
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
                  </Card>
                ))}
                {loading && <Typography variant="body1">Loading...</Typography>}
              </Box>
            </Box>
          </Container>
        </Box>
      );
    };

export default Home;
