//定义刷新令牌模型
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  expiresAt: { type: Date, required: true },
  refreshCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
