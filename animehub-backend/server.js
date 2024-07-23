//作用：主应用文件，配置和启动 Express 应用。

//功能：

//连接数据库。
//配置中间件（CORS、JSON 解析、静态文件服务）。
//配置路由（认证、评论、帖子、推荐）。
//启动服务器并监听指定端口。

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const postRoutes = require('./routes/postRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
const port = 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api', commentRoutes);
app.use('/api', postRoutes);
app.use('/api', recommendationRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
