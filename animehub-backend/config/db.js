//负责数据库连接配置
//功能：连接到 MongoDB 数据库，并在控制台输出连接成功或失败的信息。
const mongoose = require('mongoose'); //导入moogodb数据库

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/animehub'); //异步请求等待数据库连接
    console.log('MongoDB connected'); //返回成功响应
  } catch (err) {
    console.log('MongoDB connection error: ', err); //返回错误响应
  }
};

module.exports = connectDB; //导出模块connectDB
