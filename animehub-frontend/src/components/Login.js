// src/components/Login.js
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios"; // 导入axios库
import { useDispatch } from "react-redux";
import { login } from "../redux/actions/userActions";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // 用户名或邮箱
  const [password, setPassword] = useState(""); // 密码
  const [message, setMessage] = useState(""); // 错误或成功消息
  const [showPassword, setShowPassword] = useState(false); // 控制密码显示
  const dispatch = useDispatch(); // Redux dispatch 函数
  const navigate = useNavigate(); // React Router 导航

  // 切换显示密码
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // 表单提交处理
  const handleLogin = async (e) => {
    e.preventDefault(); // 阻止默认表单提交

    // 检查是否填写了所有必填字段
    if (!identifier || !password) {
      setMessage("请填写所有必填字段");
      return;
    }

    try {
      // 向服务器发送登录请求
      const response = await axios.post("http://localhost:3000/api/login", {
        identifier,
        password,
      });

      // 设置成功消息
      setMessage(response.data.message);

      // 保存 JWT 令牌到本地存储
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // 将用户信息存入 Redux 状态
      dispatch(login(response.data.user));

      // 登录成功后跳转到首页
      navigate("/");
    } catch (error) {
      // 错误处理
      if (error.response) {
        if (error.response.status === 401) {
          setMessage("用户名或密码错误");
        } else if (error.response.status === 403) {
          setMessage("您的账号已被禁用，请联系管理员");
        } else {
          setMessage("登录失败，请稍后再试");
        }
      } else {
        setMessage("无法连接到服务器，请检查您的网络连接");
      }
    }
  };

  return (
    <Container maxWidth={false} sx={{ backgroundColor: "#F2F2F2" }}>
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            width: "100%",
            boxShadow: 3,
            p: 3,
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            登录
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="用户名/电子邮箱"
              fullWidth
              margin="normal"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <TextField
              label="密码"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              登录
            </Button>
          </form>
          {message && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            还没有账号？ <Link href="/register">注册</Link>
          </Typography>
        </Box>
      </Container>
    </Container>
  );
};

export default Login;
