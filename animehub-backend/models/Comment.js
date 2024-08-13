//定义评论模型
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  animeId: {
    type: String,
    required: true,
  }, //储存评论存在的动漫id
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, //关联user数据库补充字段
  content: {
    type: String,
    required: true,
  }, //储存评论文字内容
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  }, //如果是子评论，储存评论的父评论id，补充文档字段
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ], //如果有子评论的话，储存子评论id，补充文档字段
  createdAt: {
    type: Date,
    default: Date.now,
  }, //评论创建时间
});

module.exports = mongoose.model("Comment", CommentSchema);
