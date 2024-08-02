//定义用户模型
const mongoose = require("mongoose"); //导入数据库操作

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, //用户名
  password: { type: String, required: true }, //密码
  email: { type: String, required: true, unique: true }, //邮箱
  avatar: { type: String, default: "/path/to/default/avatar.png" }, //头像
  nickname: { type: String, unique: true }, //昵称
  gender: { type: String, default: "未知" }, //性别
  emailVerified: { type: Boolean, default: false }, //邮箱是否验证，布尔函数
});

//中间件，在每次存入数据库之前执行检查nickname是否存在
userSchema.pre("save", function (next) {
  if (!this.nickname) {
    this.nickname = this.username; //如果昵称不存在，默认为用户名
  }
  next();
});

module.exports = mongoose.model("User", userSchema); //导出user模型
