// src/components/Login.js
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useDispatch } from 'react-redux';
import { login } from '../redux/actions/userActions';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Link} from '@mui/material';

//创建react函数组件Login
const Login = () => {
    const [username, setUsername] = useState('');//定义username
    const [password, setPassword] = useState('');//定义password
    const [message, setMessage] = useState('');//定义消息
    const dispatch = useDispatch(); // 获取 dispatch 函数
    const navigate = useNavigate(); // 获取 navigate 函数

    //定义一个异步函数处理表单提交
    const handleLogin = async (e) => {
        e.preventDefault(); //阻止默认提交
        try {
            //发送请求
            const response = await axiosInstance.post('http://localhost:3000/api/login',{
                username,
                password
            });

            setMessage(response.data.message);//设置返回消息

            //保存jwt令牌到本地
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            dispatch(login({ username }));

            //登录成功跳转首页
            navigate('/');

        }catch (error){
            setMessage('Error Login In: ' + (error.response ? error.response.data.message : error.message));
        }
    }

    //返回html页面
    return (
        <Container maxWidth = 'sm' sx = {{ display : 'flex', justifyContent : 'center', alignItems : 'center', height : '100vh'}}>
            <Box sx = {{width : '100%', boxShadow : 3, p : 3, borderRadius : 2, backgroundColor : 'background.paper'}}>
                <Typography variant = "h5" align = 'center' gutterButtom>
                    登录
                </Typography>
                <form onSubmit = {handleLogin}>
                    <TextField
                        label = '用户名'
                        fullWidth
                        margin = 'normal'
                        value = {username}
                        onChange = {(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label = '密码'
                        type = 'password'
                        fullWidth
                        margin = 'normal'
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                    />
                    <Button type = "submit" variant = "contained" color = "primary" fullWidth>登录</Button>
                </form>
                {message && <Typography color = "error" align = "center">{message}</Typography>}
                <Typography variant = "body2" align="center" sx={{marginTop: 2}}>
                    还没有账号？ <Link href = "/register">注册</Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Login;