// 作用：处理动漫相关的逻辑。
// 功能：
// - getDailyRecommendations：获取每日推荐的动漫，包括调用外部 API 获取数据、随机选择推荐内容。
// - getAnimeById：获取特定动漫的详细信息。
// - addToFavorites：将动漫添加到用户的收藏列表。
// - getFavorites：获取用户的收藏动漫列表。
// - removeFromFavorites：从用户的收藏列表中移除动漫。
// - checkFavorites：检查特定动漫是否在用户的收藏列表中。

const axios = require("axios"); // 导入axios模块用于发送HTTP请求
const User = require("../models/User"); // 导入用户数据库模型
const FavoriteAnime = require("../models/FavoriteAnime"); // 导入收藏动漫数据库模型
const mongoose = require("mongoose"); // 导入mongoose模块
const ObjectId = mongoose.Types.ObjectId; // 获取ObjectId类型
const NodeCache = require("node-cache"); // 导入node-cache模块用于缓存

const animeCache = new NodeCache({ stdTTL: 3600 }); // 创建缓存实例，设置标准生存时间为1小时

// 获取日推动漫函数
exports.getDailyRecommendations = async (req, res) => {
  try {
    const response = await axios.get("https://api.jikan.moe/v4/top/anime");
    const allRecommendations = response.data.data;

    const page = parseInt(req.query.page) || 0; // 获取页码，默认为0
    const numOfRecommendations = 6; // 每页推荐数量

    // 计算起始和结束索引
    const startIndex = page * numOfRecommendations;
    const endIndex = startIndex + numOfRecommendations;

    // 获取指定范围内的推荐动漫
    const recommendations = allRecommendations.slice(startIndex, endIndex);

    // 响应推荐数组和分页信息
    res.status(200).json({
      recommendations,
      currentPage: page,
      totalrecommendationPages: Math.ceil(
        allRecommendations.length / numOfRecommendations
      ),
    });
  } catch (error) {
    res
      .status(500)
      .send("获取每日推荐时出错: " + error.message);
  }
};

// 获取动漫详情的函数
exports.getAnimeById = async (req, res) => {
  const { id } = req.params;

  try {
    // 先检查缓存
    const cachedData = animeCache.get(id);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // 如果缓存中没有，则从API获取
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);

    // 将结果存入缓存
    animeCache.set(id, response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("获取动漫详情时出错:", error);
    res
      .status(500)
      .json({ message: "获取动漫详情时出错", error: error.message });
  }
};

// 添加动漫到收藏列表
exports.addToFavorites = async (req, res) => {
  const { userId, animeId } = req.body;

  try {
    // 从外部API获取动漫信息
    const animeResponse = await axios.get(
      `https://api.jikan.moe/v4/anime/${animeId}`
    );
    const animeData = animeResponse.data.data;

    // 创建新的收藏动漫记录
    const favoriteAnime = new FavoriteAnime({
      userId,
      mal_id: animeId,
      title_japanese: animeData.title_japanese,
      image_url: animeData.images.jpg.large_image_url,
    });

    await favoriteAnime.save();

    res
      .status(200)
      .json({ message: "动漫已添加到收藏", favoriteAnime });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB重复键错误
      return res
        .status(400)
        .json({ message: "该动漫已在您的收藏列表中" });
    }
    console.error("添加动漫到收藏时出错:", error);
    res.status(500).json({ message: "添加动漫到收藏时出错" });
  }
};

// 获取用户收藏的动漫列表
exports.getFavorites = async (req, res) => {
  let { userId } = req.params;

  // 移除多余的引号（如果有）
  userId = userId.replace(/^"|"$/g, "");

  try {
    let query;
    if (ObjectId.isValid(userId)) {
      query = { userId: new ObjectId(userId) };
    } else {
      query = { userId: userId };
    }

    const favorites = await FavoriteAnime.find(query).sort({ dateAdded: -1 });
    res.status(200).json(favorites);
  } catch (error) {
    console.error("获取收藏列表时出错:", error);
    res
      .status(500)
      .json({ message: "获取收藏列表时出错", error: error.toString() });
  }
};

// 从收藏列表中移除动漫
exports.removeFromFavorites = async (req, res) => {
  const { userId, animeId } = req.body;

  try {
    await FavoriteAnime.findOneAndDelete({ userId, mal_id: animeId });
    res.status(200).json({ message: "Anime removed from favorites" });
  } catch (error) {
    console.error("Error removing anime from favorites:", error);
    res.status(500).json({ message: "Error removing anime from favorites" });
  }
};

exports.checkFavorites = async (req, res) => {
  let { userId, animeId } = req.params;

  userId = userId.replace(/^"|"$/g, ""); // 清理 userId

  try {
    // 检查 userId 是否为有效的 ObjectId 字符串
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // 将 userId 转换为 ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // 查找是否已收藏
    const favorite = await FavoriteAnime.findOne({
      userId: objectId,
      mal_id: animeId,
    });
    const isFavorite = favorite ? true : false;

    res.json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite status:", error); // 打印详细错误信息到控制台
    res.status(500).json({ message: "Error checking favorite status", error });
  }
};
