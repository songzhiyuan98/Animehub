//创建并导出redis客户端实例
const Redis = require('ioredis');
const redis = new Redis(); //默认链接到本地6379端口，redis服务端默认端口

module.exports = redis;