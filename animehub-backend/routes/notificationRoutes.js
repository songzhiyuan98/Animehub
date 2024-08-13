const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const authenticateToken = require("../middlewares/authenticateToken"); //认证模块导入

// 获取用户的所有通知
// GET /api/notifications
router.get("/", authenticateToken, NotificationController.getUserNotifications);

// 将特定通知标记为已读
// PUT /api/notifications/:notificationId/read
router.put(
  "/:notificationId/read",
  authenticateToken,
  NotificationController.markNotificationAsRead
);

// 获取用户未读通知的数量
// GET /api/notifications/unread-count
router.get(
  "/unread-count",
  authenticateToken,
  NotificationController.getUnreadNotificationCount
);

// 删除特定通知
// DELETE /api/notifications/:notificationId
router.delete(
  "/:notificationId",
  authenticateToken,
  NotificationController.deleteNotification
);

module.exports = router;

// 注释说明：
// 1. authenticateToken 中间件用于验证用户身份，确保只有登录用户才能访问这些接口
// 2. 每个路由都单独应用了 authenticateToken，这样可以灵活控制每个接口的认证需求
// 3. NotificationController 包含了处理各种通知相关操作的具体逻辑
// 4. 这些路由遵循 RESTful API 设计原则，使用适当的 HTTP 方法和URL结构
