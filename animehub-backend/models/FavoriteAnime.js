// models/FavoriteAnime.js

const mongoose = require("mongoose");

const favoriteAnimeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mal_id: { type: String, required: true },
  title_japanese: { type: String, required: true },
  image_url: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now },
});

// 创建复合索引以确保每个用户的每个动漫只被收藏一次
favoriteAnimeSchema.index({ userId: 1, mal_id: 1 }, { unique: true });

module.exports = mongoose.model("FavoriteAnime", favoriteAnimeSchema);
