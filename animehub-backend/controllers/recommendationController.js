//作用：处理推荐相关的逻辑。
//功能：getDailyRecommendations：获取每日推荐的动漫，包括调用外部 API 获取数据、随机选择推荐内容。

const axios = require('axios'); //导入axios模块

//获取日推动漫函数
exports.getDailyRecommendations = async (req, res) => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime'); //获取日推动漫，jikan API
    const allRecommendations = response.data.data; //推荐动漫存入该数组

    const numOfRecommendations = 7; //定义返回日推动漫数量
    const recommendations = []; //定义一个空数组用来储存筛选的动漫

    for (let i = 0; i < numOfRecommendations; i++) {
      const randomIndex = Math.floor(Math.random() * allRecommendations.length);
      recommendations.push(allRecommendations[randomIndex]);
      allRecommendations.splice(randomIndex, 1);
    }

    res.status(200).send(recommendations); //响应推荐数组
  } catch (error) {
    res.status(500).send('Error fetching daily recommendations: ' + error.message); //响应错误消息
  }
};
