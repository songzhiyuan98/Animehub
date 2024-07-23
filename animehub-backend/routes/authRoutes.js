//作用：定义认证相关的路由。
//功能：注册、登录和刷新令牌的路由，分别对应 authController 中的 register、login 和 refreshToken 函数。

const express = require('express'); //导入express中间件
const { register, login, refreshToken } = require('../controllers/authController'); //从controller里获取注册，登录，刷新令牌函数
const router = express.Router(); 

router.post('/register', register); //定义注册路由为api/register
router.post('/login', login); //定义登录路由为api/register
router.post('/token', refreshToken); //定义刷新令牌路由为api/register

module.exports = router; //导出认证相关的路由
