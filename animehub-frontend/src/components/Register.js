// src/components/Register.js
import React, { useState } from 'react'; //导入React，useState状态变量
import axiosInstance from '../utils/axiosInstance';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../redux/actions/userActions';
import { useNavigate } from 'react-router-dom';

//创建react函数组件Register
const Register = () => {
    const [username, setUsername] = useState(''); //定义状态变量username，初始化为空字符串
    const [password, setPassword] = useState(''); //定义状态变量password，初始化为空字符串
    const [message, setMessage] = useState(''); //定义状态变量message，初始化为空字符串
    const dispatch = useDispatch(); // 获取 dispatch 函数
    const navigate = useNavigate(); // 获取 navigate 函数

    //定义一个异步函数handleRegister用于处理表单提交事件
    const handleRegister = async (e) => {
        e.preventDefault(); //组织表单默认提交（页面刷新）
        try {
            //向端口为3000的服务器路由register发送请求，请求包「username，password」状态变量
            const response = await axiosInstance.post('http://localhost:3000/api/register', {
                username,
                password
            });

            setMessage(response.data.message);//设置状态变量message的值为后端响应的数据的message属性

            // 保存 accessToken 和 refreshToken 到 localStorage
            localStorage.setItem('accessToken', response.data.accessToken);//保存jwt令牌到本地
            localStorage.setItem('refreshToken', response.data.refreshToken);//保存刷新令牌到本地

            dispatch(login({ username }));

            //登录成功跳转首页
            navigate('/');

        }catch (error){
            //异步函数发送http请求，捕获失败消息并更新状态变量message
            setMessage('Error Registering user: ' + (error.response ? error.response.data.message : error.message));
        }
    };

    //返回html页面
    return (
        <Container maxWidth = 'sm' sx = {{ display : 'flex', justifyContent : 'center', alignItems : 'center', height : '100vh'}}>
            <Box sx = {{width : '100%', boxShadow : 3, p : 3, borderRadius : 2, backgroundColor : 'background.paper'}}>
                <Typography variant = "h5" align = "center" gutterBottom>
                    注册
                </Typography>
                <form onSubmit = {handleRegister}>
                    <TextField
                        label="用户名"
                        fullWidth
                        margin="normal"
                        value = {username}
                        onChange = {(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="密码"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange = {(e) => setPassword(e.target.value)}
                    />
                    <Button type = "submit" variant = "contained" color = "primary" fullWidth>注册</Button>
                </form>
                {message && <Typography color="error" align="center">{message}</Typography>}
            </Box>
        </Container>
    );
};

export default Register;