//作用：处理评论相关的逻辑。
//功能：addComment：添加评论到数据库，包括验证用户身份、保存评论信息。

const Comment = require("../models/Comment"); //导入comment数据库集合
const NotificationService = require("../utils/notificationService"); //获取通知服务函数
const { getIO } = require("../config/websocket"); //获取websocket服务器

//处理嵌套评论
const populateReplies = async (comments) => {
  for (let comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      await Comment.populate(comment, {
        path: "replies",
        populate: [
          { path: "userId", select: "username nickname avatar" }, //填充userId字段，username，nickname，avatar
          { path: "replies" },
        ],
      });
      await populateReplies(comment.replies);
    }
  }
};

//获取动漫评论，postman功能验证已通过，接受路径参数animeId，http://localhost:3000/api/anime/52291/comments
exports.getAnimeComments = async (req, res) => {
  try {
    let comments = await Comment.find({
      animeId: req.params.animeId,
      parentId: null,
    })
      .populate("userId", "username nickname avatar")
      .sort({ createdAt: -1 });

    await populateReplies(comments);

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).send("服务器错误");
  }
};

//发表评论，接受路径参数animeId，请求头参数content，http://localhost:3000/api/anime/52291/comments
exports.postComment = async (req, res) => {
  try {
    const newComment = new Comment({
      animeId: req.params.animeId,
      userId: req.user.userId,
      content: req.body.content,
    });
    const comment = await newComment.save();

    // 在后端 WebSocket 事件处理中
    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "nickname avatar"
    );

    //使用notificationSerive创建通知
    await NotificationService.notifyAnimeComment(
      req.params.animeId,
      populatedComment._id,
      req.user.userId
    ); //生成并储存通知给所有收藏该动漫的用户

    const io = getIO();

    // 查找收藏了这个动漫的所有用户
    const favoritedUsers = await FavoriteAnime.find({
      mal_id: req.params.animeId,
    });

    // 向所有收藏了这个动漫的用户发送 WebSocket 通知
    favoritedUsers.forEach((favorite) => {
      if (favorite.userId.toString() !== req.user.userId.toString()) {
        io.to(favorite.userId.toString()).emit("newNotification", {
          type: "newComment",
          animeId: req.params.animeId,
          comment: populatedComment,
        });
      }
    });

    //发送websocket通知
    io.to(req.params.animeId).emit("newComment", {
      comment: populatedComment,
      animeId: req.params.animeId,
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("服务器错误");
  }
};

//回复评论，接受路径参数动漫id，请求头参数content，这是父评论的id，如果不存在，则返回该父评论不存在无法评论，http://localhost:3000/api/comments/${commentId}/reply
exports.replyToComment = async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.commentId); //从路径参数提取父评论id并查找数据库
    //如果父评论不存在
    if (!parentComment) {
      return res.status(404).json({ message: "评论不存在" });
    }
    //如果父评论存在且被找到
    const newReply = new Comment({
      animeId: parentComment.animeId, //评论所属动漫与父评论一致
      userId: req.user.userId, //从jwt认证中提取user信息
      content: req.body.content,
      parentId: parentComment._id,
    });

    const reply = await newReply.save();
    parentComment.replies.push(reply._id); //在父评论里也保存子评论id
    await parentComment.save();

    // 填充回复评论的用户信息
    const populatedReply = await Comment.findById(reply._id).populate(
      "userId",
      "nickname avatar"
    );

    // 使用 NotificationService 创建回复通知
    await NotificationService.notifyCommentReply(
      parentComment._id,
      populatedReply._id,
      req.user.userId,
      "anime",
      parentComment.animeId
    );
    const io = getIO();

    // 发送 WebSocket 通知
    io.to(parentComment.userId.toString()).emit("newReply", {
      reply: populatedReply,
      parentCommentId: parentComment._id,
      animeId: parentComment.animeId,
    });

    res.status(201).json(populatedReply);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("服务器错误");
  }
};

//获取评论回复, http://localhost:3000/api/comments/${commentId}/replies
exports.getCommentReplies = async (req, res) => {
  try {
    const replies = await Comment.find({ parentId: req.params.commentId }) //获取路径参数要获取子评论的id
      .populate("userId", "username")
      .sort({ createdAt: 1 }); //按时间升序排列
    res.json(replies);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("服务器错误");
  }
};
