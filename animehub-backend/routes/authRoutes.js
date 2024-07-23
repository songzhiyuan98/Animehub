//作用：定义认证相关的路由。

//功能：

//注册、登录和刷新令牌的路由，分别对应 authController 中的 register、login 和 refreshToken 函数。

const express = require('express');
const { register, login, refreshToken } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/token', refreshToken);

module.exports = router;
