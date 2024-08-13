//作用：定义认证相关的路由。
//功能：注册、登录和刷新令牌的路由，分别对应 authController 中的 register、login 和 refreshToken 函数。
const express = require("express"); //导入express中间件
const authenticateToken = require("../middlewares/authenticateToken"); //认证路由中间件
const multer = require("multer"); //文件储存
const path = require("path"); //路径
const fs = require("fs"); //文件操作
const {
  requestVerificationCode,
  verifyCode,
  register,
  login,
  getUserDoc,
  refreshToken,
  updateUserProfile,
} = require("../controllers/authController"); //从controller里获取注册，登录，刷新令牌函数
const router = express.Router();

//定义文件储存路径和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../avatars"); //定义为animehub-backend/avatars文件夹
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); //如果该文件夹不存在，在定义路径下创建新文件夹
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); //文件名为目前时间戳加文件后缀名,存在理论bug，同一秒上传的图片可能导致文件名重复
  },
});

//定义文件过滤器
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

router.post("/request-verification-code", requestVerificationCode); //定义请求发送验证码路由
router.post("/verify-code", verifyCode); //定义验证验证码路由
router.post("/register", register); //定义注册路由为api/register
router.post("/login", login); //定义登录路由为api/register
router.get("/getUserDoc", authenticateToken, getUserDoc); //定义获取用户文档api/getUserDoc
router.post("/token", refreshToken); //定义刷新令牌路由为api/register
router.post(
  "/updateUserProfile",
  authenticateToken,
  upload.single("avatar"),
  updateUserProfile
); // 更新用户信息和头像路由

module.exports = router; //导出认证相关的路由
