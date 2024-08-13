// 导入通知服务模块
const NotificationService = require("../utils/notificationService");

class NotificationController {
  // 获取用户的所有通知
  static async getUserNotifications(req, res) {
    try {
      // 调用服务层方法获取用户通知
      const notifications = await NotificationService.getUserNotifications(
        req.user.userId
      );
      // 返回通知数据
      res.json(notifications);
    } catch (error) {
      // 记录错误日志
      console.error("Error in getUserNotifications:", error);
      // 返回服务器错误响应
      res.status(500).json({ message: "Server error" });
    }
  }

  // 标记通知为已读
  static async markNotificationAsRead(req, res) {
    try {
      // 调用服务层方法标记通知为已读
      const notification = await NotificationService.markNotificationAsRead(
        req.params.notificationId,
        req.user.userId
      );
      // 返回更新后的通知
      res.json(notification);
    } catch (error) {
      // 记录错误日志
      console.error("Error in markNotificationAsRead:", error);
      // 处理特定错误情况
      if (
        error.message === "Notification not found" ||
        error.message === "Unauthorized to modify this notification"
      ) {
        // 返回404错误，表示通知未找到或无权修改
        res.status(404).json({ message: error.message });
      } else {
        // 返回一般服务器错误
        res.status(500).json({ message: "Server error" });
      }
    }
  }

  // 获取未读通知数量
  static async getUnreadNotificationCount(req, res) {
    try {
      // 调用服务层方法获取未读通知数量
      const count = await NotificationService.getUnreadNotificationCount(
        req.user.userId
      );
      // 返回未读通知数量
      res.json({ count });
    } catch (error) {
      // 记录错误日志
      console.error("Error in getUnreadNotificationCount:", error);
      // 返回服务器错误响应
      res.status(500).json({ message: "Server error" });
    }
  }

  // 删除通知
  static async deleteNotification(req, res) {
    try {
      // 调用服务层方法删除通知
      const result = await NotificationService.deleteNotification(
        req.params.notificationId,
        req.user.userId
      );
      // 返回删除操作结果
      res.json(result);
    } catch (error) {
      // 记录错误日志
      console.error("Error in deleteNotification:", error);
      // 处理特定错误情况
      if (
        error.message === "Notification not found" ||
        error.message === "Unauthorized to delete this notification"
      ) {
        // 返回404错误，表示通知未找到或无权删除
        res.status(404).json({ message: error.message });
      } else {
        // 返回一般服务器错误
        res.status(500).json({ message: "Server error" });
      }
    }
  }
}

// 导出 NotificationController 类
module.exports = NotificationController;
