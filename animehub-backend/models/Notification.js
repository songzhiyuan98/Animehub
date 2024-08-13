// models/Notification.js 通知系统模型

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, //通知接收者
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, //通知发送者
  type: {
    type: String,
    enum: ["comment", "reply", "post_comment"],
    required: true,
  }, //通知类型
  contentType: {
    type: String,
    enum: ["anime", "post"],
    required: true,
  }, //通知内容类型
  contentId: {
    type: String,
    required: true,
  }, //通知内容id
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  }, //通知内容自动填充字段
  read: {
    type: Boolean,
    default: false,
  }, //是否已读
  createdAt: {
    type: Date,
    default: Date.now,
  }, //通知创建时间
});

module.exports = mongoose.model("Notification", NotificationSchema);
