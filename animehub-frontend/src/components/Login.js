// src/components/Login.js
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
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

//创建react函数组件Login
const Login = () => {
  const [identifier, setIdentifier] = useState(""); //定义username
  const [password, setPassword] = useState(""); //定义password
  const [message, setMessage] = useState(""); //定义消息
  const [showPassword, setShowPassword] = useState(false); //定义showPassword状态
  const dispatch = useDispatch(); // 获取 dispatch 函数
  const navigate = useNavigate(); // 获取 navigate 函数

  //管理显示密码图标点击事件
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword); //切换密码显示状态
  };
  //定义一个异步函数处理表单提交
  const handleLogin = async (e) => {
    e.preventDefault(); //阻止默认提交
    //检查所有字段是否已填写
    if (!identifier || !password) {
      setMessage("请填写所有必填字段");
      return;
    }
    try {
      //发送请求
      const response = await axiosInstance.post(
        "http://localhost:3000/api/login",
        {
          identifier,
          password,
        }
      );

      setMessage(response.data.message); //设置返回消息

      //保存jwt令牌到本地
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      dispatch(login(response.data.user));

      //登录成功跳转首页
      navigate("/");
    } catch (error) {
      setMessage(error.response ? error.response.data.message : error.message);
    }
  };

  //返回html页面
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
          <Typography variant="h5" align="center" gutterButtom>
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
