// src/components/Login.js
import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios"; // 导入axios库
import { useDispatch } from "react-redux";
import { login } from "../redux/actions/userActions";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const { t } = useTranslation();
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
      setMessage(t("fillAllFields"));
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
          setMessage(t("incorrectCredentials"));
        } else if (error.response.status === 403) {
          setMessage(t("accountDisabled"));
        } else {
          setMessage(t("loginFailed"));
        }
      } else {
        setMessage(t("serverConnectionError"));
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
            {t("login")}
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label={t("usernameOrEmail")}
              fullWidth
              margin="normal"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <TextField
              label={t("password")}
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
              {t("login")}
            </Button>
          </form>
          {message && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
          <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
            {t("noAccount")} <Link href="/register">{t("register")}</Link>
          </Typography>
        </Box>
      </Container>
    </Container>
  );
};

export default Login;
