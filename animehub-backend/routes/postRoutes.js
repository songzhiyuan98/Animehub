//作用：定义帖子相关的路由。
//功能：创建帖子和获取帖子的路由，分别对应 postController 中的 createPost 和 getPosts 函数，使用 authenticateToken 中间件验证用户身份，并处理图片上传。

const express = require('express'); //导入express中间件
const { createPost, getPosts } = require('../controllers/postController'); //导入创建帖子，获取帖子函数
const authenticateToken = require('../middlewares/authenticateToken'); //导入认证函数
const multer = require('multer'); //导入multer
const path = require('path');
const fs = require('fs'); //导入文件操作
const router = express.Router();

//定义文件储存路径和储存文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

//定义文件过滤器
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.post('/posts', authenticateToken, upload.single('image'), createPost); //创建帖子路由
router.get('/posts', getPosts); //获取帖子路由

module.exports = router;
