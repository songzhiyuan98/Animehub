//作用：处理评论相关的逻辑。
//功能：addComment：添加评论到数据库，包括验证用户身份、保存评论信息。

const Comment = require("../models/Comment"); //导入comment数据库集合
const NotificationService = require("../utils/notificationService"); //获取通知服务函数
const FavoriteAnime = require("../models/FavoriteAnime"); //获取动漫收藏数据库
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
      contentId: req.params.animeId,
      contentType: "anime",
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

//获取帖子评论，postman功能验证已通过，接受路径参数postId，http://localhost:3000/api/posts/666666666666666666666666/comments
exports.getPostComments = async (req, res) => {
  try {
    let comments = await Comment.find({
      contentId: req.params.postId,
      contentType: "post",
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
}
//发表动漫评论，接受路径参数animeId，请求头参数content，http://localhost:3000/api/anime/52291/comments
exports.postComment = async (req, res) => {
  try {
    const newComment = new Comment({
      contentId: req.params.animeId,
      contentType: "anime",
      userId: req.user.userId,
      content: req.body.content,
    });
    const comment = await newComment.save();

    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "nickname avatar"
    );

    const notifications = await NotificationService.notifyAnimeComment(
      req.params.animeId,
      populatedComment._id,
      req.user.userId
    );

    const io = getIO();

    notifications.forEach((notification) => {
      io.to(notification.recipient.toString()).emit(
        "newNotification",
        notification
      );
    });

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

//发表帖子评论，接受路径参数postId，请求头参数content，http://localhost:3000/api/posts/666666666666666666666666/comments
exports.postPostComment = async (req, res) => {
  try {
    const newComment = new Comment({
      contentId: req.params.postId,
      contentType: "post",
      userId: req.user.userId,
      content: req.body.content,
    });
    const comment = await newComment.save();

    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "nickname avatar"
    );

    const notification = await NotificationService.notifyPostComment(
      req.params.postId,
      populatedComment._id,
      req.user.userId
    );

    const io = getIO();

    if (notification) {
      io.to(notification.recipient.toString()).emit(
        "newNotification",
        notification
      );
    }

    io.to(req.params.postId).emit("newComment", {
      comment: populatedComment,
      postId: req.params.postId,
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("服务器错误");
  }
}

//回复评论，接受路径参数动漫id，请求头参数content，这是父评论的id，如果不存在，则返回该父评论不存在无法评论，http://localhost:3000/api/comments/${commentId}/reply
exports.replyToComment = async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "评论不存在" });
    }

    const newReply = new Comment({
      contentId: parentComment.contentId,
      contentType: parentComment.contentType,
      userId: req.user.userId,
      content: req.body.content,
      parentId: parentComment._id,
    });

    const reply = await newReply.save();
    parentComment.replies.push(reply._id);
    await parentComment.save();

    const populatedReply = await Comment.findById(reply._id).populate(
      "userId",
      "nickname avatar"
    );

    const notifications = await NotificationService.notifyCommentReply(
      parentComment._id,
      populatedReply._id,
      req.user.userId,
      parentComment.contentType,
      parentComment.contentId
    );

    console.log("notifications", notifications);
    
    const io = getIO();

    // 发送所有创建的通知
    notifications.forEach(notification => {
      io.to(notification.recipient.toString()).emit(
        "newNotification",
        notification
      );
    });

    io.to(parentComment.contentId).emit("newReply", {
      reply: populatedReply,
      parentCommentId: parentComment._id,
      [parentComment.contentType === "anime" ? "animeId" : "postId"]: parentComment.contentId,
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