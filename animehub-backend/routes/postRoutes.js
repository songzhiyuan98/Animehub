const express = require('express'); //导入express
const router = express.Router();//创建路由
const postController = require('../controllers/postController'); //导入创建帖子，获取帖子函数
const authenticateToken = require('../middlewares/authenticateToken'); //认证模块导入
const multer = require('multer'); //引入 multer
const path = require('path');

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 移除 upload 中间件
// const upload = require('../utils/imageUpload');

// 创建帖子路由
router.post('/posts', authenticateToken, upload.single('coverImage'), postController.createPost); //上传图片

// 获取帖子列表路由
router.get('/posts', postController.getPosts);

// 获取单个帖子详情路由
router.get('/posts/:id', postController.getPostById);

// 更新帖子路由
//router.put('/posts/:postId', authenticateToken, upload.array('images', 10), postController.updatePost);

// 删除帖子路由
//router.delete('/posts/:postId', authenticateToken, postController.deletePost);

// 点赞路由
router.post('/posts/:id/like', authenticateToken, postController.likePost); //点赞

// 获取相似帖子路由
router.get('/posts/:id/similar', postController.getSimilarPosts);

module.exports = router;
