//创建并导出redis客户端实例
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

module.exports = redis;
