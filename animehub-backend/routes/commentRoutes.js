//作用：定义评论相关的路由。
//功能：添加评论的路由，对应 commentController 中的 addComment 函数，使用 authenticateToken 中间件验证用户身份。

const express = require("express");
const {
  getAnimeComments,
  postComment,
  replyToComment,
  getCommentReplies,
  postPostComment,
  getPostComments,
} = require("../controllers/commentController");
const authenticateToken = require("../middlewares/authenticateToken"); //认证模块导入
const router = express.Router();

router.get("/anime/:animeId/comments", getAnimeComments);
router.post("/anime/:animeId/comments", authenticateToken, postComment);
router.post("/comments/:commentId/reply", authenticateToken, replyToComment);
router.get("/comments/:commentId/replies", getCommentReplies);
router.post("/posts/:postId/comments", authenticateToken, postPostComment);
router.get("/posts/:postId/comments", getPostComments);
module.exports = router;
