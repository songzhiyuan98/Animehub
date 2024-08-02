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
import axiosInstance from "../src/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { login } from "./redux/actions/userActions"; // 导入 login action
import LinearProgress from "@mui/material/LinearProgress"; //加载条

const App = () => {
  const dispatch = useDispatch(); //获取dispatch函数
  const [loading, setLoading] = useState(true); //状态变量决定是否加载动画

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken"); //钩子重新加载页面，派发函数有变化，从本地缓存中获取jwt和用户名
    const username = localStorage.getItem("username");

    //如果用户名和访问令牌获取成功
    if (username && accessToken) {
      axiosInstance
        .get("http://localhost:3000/api/getUserDoc", {
          params: { username }, // 通过查询参数传递用户名
        }) //发送请求以用户名请求完成用户文档对象
        .then((response) => {
          const user = response.data;
          dispatch(login(user));
        })
        .catch((error) => {
          localStorage.removeItem("username");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => {
          setLoading(false); //加载完成后，停止加载动画
        });
    } else {
      setLoading(false); //如果没有用户信息，停止加载动画
    }
  }, [dispatch]);

  if (loading) {
    return <LinearProgress />;
  } //加载登录状态动画

  return (
    <Router>
      <Navbar />
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
        {/* 配置 AnimeInfo 路由 */}
      </Routes>
    </Router>
  );
};

export default App;
