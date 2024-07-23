//作用：定义推荐相关的路由。

//功能：

//获取每日推荐的路由，对应 recommendationController 中的 getDailyRecommendations 函数。

const express = require('express');
const { getDailyRecommendations } = require('../controllers/recommendationController');
const router = express.Router();

router.get('/daily-recommendations', getDailyRecommendations);

module.exports = router;
