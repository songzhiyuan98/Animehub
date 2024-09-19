const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true }, //帖子标题
  content: { type: String, required: true }, //帖子内容
  previewText: { type: String }, //帖子预览
  coverImage: { type: String }, //帖子封面
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //帖子作者
  createdAt: { type: Date, default: Date.now }, //帖子创建时间
  readTime: { type: Number, default: 1 }, //预计阅读时间（分钟）
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //点赞用户
  tags: [{ type: String }], //添加标签字段
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema); //导出帖子模型
