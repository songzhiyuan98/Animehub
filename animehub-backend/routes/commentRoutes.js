//作用：定义评论相关的路由。

//功能：

//添加评论的路由，对应 commentController 中的 addComment 函数，使用 authenticateToken 中间件验证用户身份。

const express = require('express');
const { addComment } = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/comments', authenticateToken, addComment);

module.exports = router;
