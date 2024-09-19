import React, { useEffect, useState } from "react"; //用于创建react组件
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; //创建路由容器，定义路由和导航行为
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Index from "./components/Index";
import Posts from "./components/Posts";
import Login from "./components/Login";
import Register from "./components/Register";
import UserCenter from "./components/UserCenter";
import PrivateRoute from "./components/PrivateRoute";
import AnimeInfo from "./components/AnimeInfo"; // 导入 AnimeInfo 组件
import AnimeVideo from "./components/AnimeVideo"; //导入动漫预告片组件
import TokenExpiredAlert from "./components/TokenExpiredAlert"; //过期报错组件
import axiosInstance from "../src/utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./redux/actions/userActions"; // 导入 login action
import LinearProgress from "@mui/material/LinearProgress"; //加载条
import {
  connectWebSocket,
  disconnectWebSocket,
  fetchNotifications,
} from "./redux/actions/notificationActions";
import PostDetail from './components/PostDetail';

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");

    if (username && accessToken) {
      axiosInstance
        .get("http://localhost:3000/api/getUserDoc", {
          params: { username },
        })
        .then((response) => {
          const user = response.data;
          dispatch(login(user));
          // 用户成功登录后，连接 WebSocket 并获取通知
          dispatch(connectWebSocket());
          dispatch(fetchNotifications());
        })
        .catch((error) => {
          localStorage.removeItem("username");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  // 监听登录状态变化
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(connectWebSocket());
      dispatch(fetchNotifications());
    } else {
      dispatch(disconnectWebSocket());
    }

    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [isLoggedIn, dispatch]);

  if (loading) {
    return <LinearProgress />;
  } //加载登录状态动画

  return (
    <Router>
      <Navbar />
      <TokenExpiredAlert />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/index" element={<Index />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user-center"
          element={<PrivateRoute component={UserCenter} />}
        />
        <Route path="/anime/:id" element={<AnimeInfo />} />{" "}
        <Route path="/anime-video/:id" element={<AnimeVideo />} />{" "}
        <Route path="/post/:id" element={<PostDetail />} />
        {/* 配置 AnimeInfo 路由 */}
      </Routes>
    </Router>
  );
};

export default App;
