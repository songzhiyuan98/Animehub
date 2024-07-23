# AnimeHub

AnimeHub 是一个面向动漫爱好者的平台，提供动漫搜索、评价、评论等功能。

## 项目结构

```
AnimeHub/
├── animehub-backend/        # 后端代码
│   ├── node_modules/
│   ├── src/
│   ├── package.json
│   └── ...
├── animehub-frontend/       # 前端代码
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── package.json
└── README.md
```

## 功能

- 用户注册和登录
- 动漫搜索和浏览
- 动漫详情展示
- 用户评论和评分
- 用户收藏和管理

## 安装和运行

### 前提条件

- Node.js (推荐使用最新的 LTS 版本)
- MongoDB 数据库

### 克隆仓库

```bash
git clone https://github.com/your-username/animehub.git
cd animehub
```

### 安装依赖

#### 后端

```bash
cd animehub-backend
npm install
```

#### 前端

```bash
cd ../animehub-frontend
npm install
```

### 配置环境变量

在 `animehub-backend` 目录下创建 `.env` 文件，并添加必要的环境变量：

```plaintext
# .env example
MONGO_URI=mongodb://localhost:27017/animehub
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 运行项目

#### 启动后端

```bash
cd animehub-backend
npm start
```

#### 启动前端

```bash
cd ../animehub-frontend
npm start
```

前端将运行在 [http://localhost:3001](http://localhost:3001)，后端将运行在 [http://localhost:5000](http://localhost:5000)。

## 贡献

欢迎贡献！请 fork 该仓库并提交 pull request。

## 许可证

该项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

```

```
