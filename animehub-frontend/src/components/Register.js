// src/components/Register.js
import React, { useState, useEffect } from "react"; //导入React，useState状态变量
import axiosInstance from "../utils/axiosInstance";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useDispatch } from "react-redux";
import { login } from "../redux/actions/userActions";
import { useNavigate } from "react-router-dom";

//创建react函数组件Register
const Register = () => {
  const [username, setUsername] = useState(""); //定义状态变量username，初始化为空字符串
  const [password, setPassword] = useState(""); //定义状态变量password，初始化为空字符串
  const [strength, setStrength] = useState(0); //定义状态变量密码强度，表示已满足的密码强度
  const [showTooltip, setShowTooltip] = useState(false); //定义状态变量展示tooltip提示框状态，初始化false
  const [showRequirements, setShowRequirements] = useState(false); //展示密码要求满足实时变化的box,初始化false
  const [passwordError, setPasswordError] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  }); //定义状态变量检查密码合格，初始化为各项指标都为false
  const [confirmPassword, setConfirmPassword] = useState(""); //定义状态变量储存密码确认输入框，初始化为空字符串
  const [email, setEmail] = useState(""); //定义状态变量email，初始化为空字符串
  const [verificationCode, setVerificationCode] = useState(""); //定义状态变量验证码，初始化为空字符串
  const [message, setMessage] = useState(""); //定义状态变量message，初始化为空字符串
  const [countdown, setCountdown] = useState(0); //定义状态变量countdown，用来验证码倒计时
  const dispatch = useDispatch(); // 获取 dispatch 函数
  const navigate = useNavigate(); // 获取 navigate 函数

  //更新验证码计时器的钩子
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000); //countdown大于0，就调用一个计时器，过一秒，countdown减一
      return () => clearTimeout(timer); //清楚计时器
    }
  }, [countdown]); //countdown状态变量变化，调用钩子

  //更新密码强度状态变量的钩子
  useEffect(() => {
    const calculatePasswordStrength = () => {
      const conditionsMet = Object.values(passwordError).filter(Boolean).length; //获取passwordError状态变量里布尔函数为true的数量
      return conditionsMet; //返回布尔值为真的数量
    };
    setStrength(calculatePasswordStrength()); //更新到密码强度strength状态变量
  }, [passwordError]); //监听passwordError状态变量的变化，每次变化，调用钩子更新密码强度状态变量

  //检查密码满足要求的函数
  const validatePassword = (password) => {
    const errors = {
      length: password.length >= 8, //要求密码长度至少为8
      uppercase: /[A-Z]/.test(password), //要求至少包含大写字母
      lowercase: /[a-z]/.test(password), //要求至少包含小写字母
      number: /[0-9]/.test(password), //要求包含数字
      specialChar: /[!@#$%^&*]/.test(password), //要求包含特殊符号
    };
    setPasswordError(errors);
    return Object.values(errors).every(Boolean); //返回所有条件都为真
  };

  //处理密码输入变化,每次密码输入框改变，都判断一次密码
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value); //判断当前密码是否符合要求
  };

  const handleMouseEnter = () => setShowTooltip(true); //定义鼠标悬停并设定状态变量showTooltip为true
  const handleMouseLeave = () => setShowTooltip(false); //定义鼠标离开设定状态变量showTooltip为false

  //根据密码强度strength获取对应颜色函数
  const getStrengthColor = () => {
    if (strength < 3) return "#8B0000"; //弱密码满足一个要求返回深红色
    if (strength < 5) return "#FFA500"; //中密码返回黄色
    return "#006400"; //强密码返回深绿色
  };

  //发送验证码到用户邮箱函数
  const sendVerificationCode = async () => {
    //检查邮箱字段是否为空
    if (!email) {
      setMessage("请输入邮箱");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/api/request-verification-code",
        { email }
      ); //将用户邮箱，状态变量发送至后端请求发送验证码到指定邮箱
      setMessage(response.data.message); //成功响应
      setCountdown(60); //发送验证码成功响应后开始倒计时60秒
    } catch (error) {
      setMessage(error.response ? error.response.data.message : error.message); // 设置错误响应消息
    }
  };

  //验证验证码函数
  const verifyCode = async () => {
    //检查邮箱和验证码字段为否为空
    if (!email || !verificationCode) {
      setMessage("请先输入邮箱和验证码");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/api/verify-code",
        { email, code: verificationCode }
      );
      setMessage(response.data.message); //成功响应
    } catch (error) {
      setMessage(error.response ? error.response.data.message : error.message); //如果请求后端函数内部的错误消息存在，返回内部错误详细，如果不存在，返回一般错误消息
    }
  };

  //定义一个异步函数handleRegister用于处理表单提交事件
  const handleRegister = async (e) => {
    e.preventDefault(); //组织表单默认提交（页面刷新）
    //检查所有字段是否已经填写
    if (
      !email ||
      !verificationCode ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      setMessage("请填写所有必填字段");
      return;
    }
    //检查密码长度
    if (!passwordError.length) {
      setMessage("确保密码至少八个字符");
      return;
    }
    //检查密码是否符合要求
    if (strength < 3) {
      setMessage("密码不符合要求，请检查");
      return;
    }
    //检查确认密码是否和密码匹配
    if (confirmPassword !== password) {
      setMessage("确认密码和密码不匹配，请检查你的密码");
      return;
    }
    try {
      //向端口为3000的服务器路由register发送请求，请求包「username，password」状态变量
      const response = await axiosInstance.post(
        "http://localhost:3000/api/register",
        {
          username,
          password,
          email,
          verificationCode,
        }
      );

      setMessage(response.data.message); //设置状态变量message的值为后端响应的数据的message属性

      // 保存 accessToken 和 refreshToken 到 localStorage
      localStorage.setItem("accessToken", response.data.accessToken); //保存jwt令牌到本地
      localStorage.setItem("refreshToken", response.data.refreshToken); //保存刷新令牌到本地

      dispatch(login(response.data.user));

      //登录成功跳转首页
      navigate("/");
    } catch (error) {
      //异步函数发送http请求，捕获失败消息并更新状态变量message
      setMessage(
        "注册失败: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  };

  //根据消息内容决定显示颜色
  const messageColor = message.includes("成功") ? "#28a745" : "error";

  //返回html页面
  return (
    <Container maxWidth={false} sx={{ backgroundColor: "#F2F2F2" }}>
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
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
            注册
          </Typography>
          <form onSubmit={handleRegister}>
            <TextField
              label="用户名"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="电子邮箱"
                  margin="normal"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Button
                    onClick={sendVerificationCode}
                    color="primary"
                    fullWidth
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}秒后重新发送` : "发送验证码"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="验证码"
                  fullWidth
                  margin="normal"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Button onClick={verifyCode} color="primary" fullWidth>
                    验证
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <TextField
              label="密码"
              fullWidth
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setShowRequirements(true)} // 输入框获取焦点时显示要求
              onBlur={() => setShowRequirements(false)} // 输入框失去焦点时隐藏要求
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title="密码要求：至少8个字符(强制要求)，包含大写字母、小写字母、数字和特殊字符,至少满足三个要求及以上"
                      open={showTooltip}
                    >
                      <IconButton
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            {showRequirements && (
              <Box mt={2}>
                <Typography variant="subtitle1">密码强度：</Typography>
                <LinearProgress
                  variant="determinate" //定义该进度条有一个确定的值
                  value={(strength / 5) * 100} //根据强度判断进度条占据多少位置
                  sx={{
                    height: 3, //定义进度条高度10px
                    backgroundColor: "lightgrey", //定义默认背景灰色
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getStrengthColor(), //定义加载进度条背景为调用getStrength函数
                    },
                  }}
                />
                <Box mt={1}>
                  <Typography variant="body2" color={getStrengthColor()}>
                    {strength < 3 ? "弱" : strength < 5 ? "中等" : "强"}密码
                  </Typography>
                </Box>
                <Typography variant="subtitle1">密码要求：</Typography>
                <Typography
                  variant="body2"
                  color={passwordError.length ? "green" : "red"}
                >
                  {passwordError.length ? "✔️" : "❌"} 至少8个字符
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordError.uppercase ? "green" : "red"}
                >
                  {passwordError.uppercase ? "✔️" : "❌"} 包含大写字母
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordError.lowercase ? "green" : "red"}
                >
                  {passwordError.lowercase ? "✔️" : "❌"} 包含小写字母
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordError.number ? "green" : "red"}
                >
                  {passwordError.number ? "✔️" : "❌"} 包含数字
                </Typography>
                <Typography
                  variant="body2"
                  color={passwordError.specialChar ? "green" : "red"}
                >
                  {passwordError.specialChar ? "✔️" : "❌"} 包含特殊字符
                  (!@#$%^&*)
                </Typography>
              </Box>
            )}
            <TextField
              label="确认密码"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              注册
            </Button>
          </form>
          {message && (
            <Typography color={messageColor} align="center" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Box>
      </Container>
    </Container>
  );
};

export default Register;
