//作用：处理推荐相关的逻辑。

//功能：

//getDailyRecommendations：获取每日推荐的动漫，包括调用外部 API 获取数据、随机选择推荐内容。

const axios = require('axios');

exports.getDailyRecommendations = async (req, res) => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime');
    const allRecommendations = response.data.data;

    const numOfRecommendations = 7;
    const recommendations = [];

    for (let i = 0; i < numOfRecommendations; i++) {
      const randomIndex = Math.floor(Math.random() * allRecommendations.length);
      recommendations.push(allRecommendations[randomIndex]);
      allRecommendations.splice(randomIndex, 1);
    }

    res.status(200).send(recommendations);
  } catch (error) {
    res.status(500).send('Error fetching daily recommendations: ' + error.message);
  }
};
