//作用：定义认证相关的路由。
//功能：注册、登录和刷新令牌的路由，分别对应 authController 中的 register、login 和 refreshToken 函数。
const express = require("express"); //导入express中间件
const authenticateToken = require("../middlewares/authenticateToken"); //认证路由中间件
const { upload } = require("../config/cloudinary"); //文件储存
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
