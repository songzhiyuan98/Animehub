//作用：主应用文件，配置和启动 Express 应用。
//功能：
//连接数据库。
//配置中间件（CORS、JSON 解析、静态文件服务）。
//配置路由（认证、评论、帖子、推荐）。
//启动服务器并监听指定端口。

const express = require("express"); //导入express中间件
const cors = require("cors"); //导入cors中间件
const path = require("path"); //导入path
const http = require("http"); // 添加这行
const { setupWebSocket } = require("./config/websocket"); // 添加这行
const connectDB = require("./config/db"); //从config db.js中导入模块连接数据库
const authRoutes = require("./routes/authRoutes"); //导入认证相关的路由
const commentRoutes = require("./routes/commentRoutes"); //导入评论相关的路由
const postRoutes = require("./routes/postRoutes"); //导入帖子相关的路由
const animeRoutes = require("./routes/animeRoutes"); // 更改名称
const notificationRoutes = require("./routes/notificationRoutes"); // 添加这行
const tagRoutes = require("./routes/tagRoutes"); // 添加这行
require("dotenv").config(); //加载环境变量

const app = express();
const server = http.createServer(app); // 创建 HTTP 服务器，但保留 app
const port = process.env.PORT || 3000; // 确保使用了正确的端口

connectDB(); //连接数据库

// 初始化 WebSocket
setupWebSocket(server); // 添加这行

app.use(cors()); //启用cors中间件
app.use(express.json({ limit: '50mb' })); //启用epxress json中间件获取请求头
app.use(express.urlencoded({ limit: '50mb', extended: true })); //启用epxress urlencoded中间件
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //配置静态文件让外界可以访问特定文件夹
app.use("/avatars", express.static(path.join(__dirname, "avatars"))); // 配置头像目录的静态文件务

app.use("/api", authRoutes); //定义访问认证相关路由的路径
app.use("/api", commentRoutes); //定义访问评论相关路由的路径
app.use("/api", postRoutes); //定义访问帖子相关路由的路径
app.use("/api", animeRoutes); // 更改路径
app.use("/api/notifications", notificationRoutes); // 添加这行
app.use("/api", tagRoutes); // 添加这行

//监听端口3000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
