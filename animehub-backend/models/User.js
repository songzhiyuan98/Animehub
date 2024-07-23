//定义用户模型
const mongoose = require('mongoose'); //导入数据库操作

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, //用户名
  password: { type: String, required: true } //密码
});

module.exports = mongoose.model('User', userSchema); //导出user模型
