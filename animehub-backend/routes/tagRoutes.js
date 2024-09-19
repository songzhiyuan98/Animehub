const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authenticateToken = require('../middlewares/authenticateToken');

// 获取所有标签
router.get('/tags', tagController.getTags);

// 创建新标签
router.post('/tags', authenticateToken, tagController.createTag);

// 获取单个标签详情（如果需要的话）
// router.get('/tags/:id', tagController.getTagById);

// 更新标签（如果需要的话）
// router.put('/tags/:id', authenticateToken, tagController.updateTag);

// 删除标签（如果需要的话）
// router.delete('/tags/:id', authenticateToken, tagController.deleteTag);

module.exports = router;
