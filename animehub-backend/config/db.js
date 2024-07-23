//负责数据库连接配置
//功能：

//连接到 MongoDB 数据库，并在控制台输出连接成功或失败的信息。
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/animehub');
    console.log('MongoDB connected');
  } catch (err) {
    console.log('MongoDB connection error: ', err);
  }
};

module.exports = connectDB;
