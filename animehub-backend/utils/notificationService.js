// services/notificationService.js

const Notification = require("../models/Notification"); //获取通知数据库
const FavoriteAnime = require("../models/FavoriteAnime"); //获取动漫收藏数据库
const Comment = require("../models/Comment");
const Post = require("../models/Post");

class NotificationService {
  //定义创建单个通知函数，接受一个通知对象作为参数
  static async createNotification(data) {
    const notification = new Notification(data);
    console.log(notification);
    await notification.save();
    return notification;
  } //返回通知对象

  //定义创建多个通知函数，接受一个通知对象数组作为参数
  static async createManyNotifications(dataArray) {
    try {
      const createdNotifications = await Notification.insertMany(dataArray);

      console.log(
        `Successfully created ${createdNotifications.length} notifications:`
      );
      createdNotifications.forEach((notification, index) => {
        console.log(`Notification ${index + 1}:`, {
          id: notification._id,
          recipient: notification.recipient,
          sender: notification.sender,
          type: notification.type,
          contentType: notification.contentType,
          contentId: notification.contentId,
          commentId: notification.commentId,
          createdAt: notification.createdAt,
        });
      });

      return createdNotifications;
    } catch (error) {
      console.error("Error creating notifications:", error);
      throw error; // 重新抛出错误，以便调用者可以处理它
    }
  }

  //动漫详情页主评论发送多条通知，接受动漫id，评论id，发送userid为参数
  static async notifyAnimeComment(animeId, commentId, senderId) {
    const favoriteUsers = await FavoriteAnime.find({ mal_id: animeId }); //根据动漫id查找所有收藏有该动漫的收藏对象
    const notifications = favoriteUsers
      .filter((favorite) => favorite.userId.toString() !== senderId.toString()) // 排除发送者自己
      .map((favorite) => ({
        recipient: favorite.userId, //接收者是所有收藏该动漫的user
        sender: senderId, //发送着userid来自参数
        type: "anime_comment", //类型comment
        contentType: "anime", //评论类型anime
        contentId: animeId, //被评论内容id
        commentId: commentId, //评论id
      }));

    if (notifications.length > 0) {
      const createdNotifications = await Notification.create(notifications);

      // 使用 populate 填充 sender 和 commentId 的详细信息
      const populatedNotifications = await Notification.populate(
        createdNotifications,
        [
          { path: "sender", select: "nickname avatar" },
          { path: "commentId", select: "content" },
        ]
      );

      return populatedNotifications;
    }

    return [];
  }

  //回复评论通知，发送一条通知给父评论用户，接受参数父评论id，回复评论id，发送者id，内容类型，内容id
  static async notifyCommentReply(
    parentCommentId,
    replyId,
    senderId,
    contentType,
    contentId
  ) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) return null;

    const notifications = [];

    // 给父评论作者发送通知（如果回复者不是父评论作者）
    if (parentComment.userId.toString() !== senderId.toString()) {
      const notification = await this.createNotification({
        recipient: parentComment.userId,
        sender: senderId,
        type: contentType === "anime" ? "anime_reply" : "post_reply",
        contentType: contentType,
        contentId: contentId,
        commentId: replyId,
      });
      notifications.push(notification);
    }

    // 如果是帖子评论，还要给帖子作者发送通知（如果回复者不是帖子作者）
    if (contentType === "post") {
      const post = await Post.findById(contentId);
      if (post && post.author.toString() !== senderId.toString() && post.author.toString() !== parentComment.userId.toString()) {//如果帖子存在，帖子作者不是发送者，帖子作者不是父评论作者
        const notification = await this.createNotification({
          recipient: post.author,
          sender: senderId,
          type: "post_reply_author",
          contentType: "post",
          contentId: contentId,
          commentId: replyId,
        });
        notifications.push(notification);
      }
    }

    // 使用 populate 填充 sender 和 commentId 的详细信息
    const populatedNotifications = await Notification.populate(notifications, [
      { path: "sender", select: "nickname avatar" },
      { path: "commentId", select: "content" },
    ]);

    return populatedNotifications;
  }

  //发送帖子评论通知，发送给帖子发布者，接受参数发送id，评论id，帖子id
  static async notifyPostComment(postId, commentId, senderId) {
    const post = await Post.findById(postId); //根据帖子id参数获取帖子对象
    if (post && post.author.toString() !== senderId.toString()) {
      //如果发帖者和评论者不是一个人
      const notification = await this.createNotification({
        recipient: post.author, //接收者帖子发布者
        sender: senderId, //发送者，来自于参数
        type: "post_comment", //类型postcomment
        contentType: "post", //内容类型post
        contentId: postId, //内容id，帖子id
        commentId: commentId, //评论id来自于参数
      }); //创建通知对象

      // 使用 populate 填充 sender 和 commentId 的详细信息
      const populatedNotification = await Notification.populate(notification, [
        { path: "sender", select: "nickname avatar" },
        { path: "commentId", select: "content" },
      ]);

      return populatedNotification;
    }

    return null;
  }

  // 新增方法

  // 获取用户的所有通知
  static async getUserNotifications(userId) {
    try {
      // 查找指定用户的所有通知
      const notifications = await Notification.find({ recipient: userId })
        // 按创建时间降序排序
        .sort({ createdAt: -1 })
        // 填充发送者信息，只包括用户名和头像
        .populate("sender", "nickname avatar")
        // 填充评论内容
        .populate("commentId", "content");
      // 返回查询结果
      return notifications;
    } catch (error) {
      // 记录错误日志
      console.error("Error fetching user notifications:", error);
      // 抛出错误，让调用者处理
      throw error;
    }
  }

  // 标记通知为已读
  static async markNotificationAsRead(notificationId, userId) {
    try {
      // 根据ID查找通知
      const notification = await Notification.findById(notificationId);
      // 如果通知不存在，抛出错误
      if (!notification) {
        throw new Error("Notification not found");
      }
      // 检查通知的接收者是否为当前用户
      if (notification.recipient.toString() !== userId.toString()) {
        throw new Error("Unauthorized to modify this notification");
      }
      // 将通知标记为已读
      notification.read = true;
      // 保存更新后的通知
      await notification.save();
      // 返回更新后的通知
      return notification;
    } catch (error) {
      // 记录错误日志
      console.error("Error marking notification as read:", error);
      // 抛出错误，让调用者处理
      throw error;
    }
  }

  // 获取用户未读通知数量
  static async getUnreadNotificationCount(userId) {
    try {
      // 计算指定用户的未读通知数量
      const count = await Notification.countDocuments({
        recipient: userId,
        read: false,
      });
      // 返回未读通知数量
      return count;
    } catch (error) {
      // 记录错误日志
      console.error("Error counting unread notifications:", error);
      // 抛出错误，让调用者处理
      throw error;
    }
  }

  // 删除通知
  static async deleteNotification(notificationId, userId) {
    try {
      // 根据ID查找通知
      const notification = await Notification.findById(notificationId);
      // 如果通知不存在，抛出错误
      if (!notification) {
        throw new Error("Notification not found");
      }
      // 检查通知的接收者是否为当前用户
      if (notification.recipient.toString() !== userId.toString()) {
        throw new Error("Unauthorized to delete this notification");
      }
      // 删除通知
      await notification.remove();
      // 返回成功消息
      return { message: "Notification deleted successfully" };
    } catch (error) {
      // 记录错误日志
      console.error("Error deleting notification:", error);
      // 抛出错误，让调用者处理
      throw error;
    }
  }
}

module.exports = NotificationService;
