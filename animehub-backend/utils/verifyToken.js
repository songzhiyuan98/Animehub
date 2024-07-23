//作用：封装 JWT 验证逻辑。
//功能：
//创建一个返回 Promise 的函数，用于验证 JWT 令牌。
//处理验证结果，解析成功则返回用户信息，失败则返回错误信息。

const jwt = require('jsonwebtoken'); //导入jwt模块

//根据token和密钥验证jwt令牌，验证逻辑
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = verifyToken; //导出jwt验证函数
