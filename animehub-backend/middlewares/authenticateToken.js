//作用：定义身份验证中间件。

//功能：

//从请求头中获取 JWT 令牌，验证令牌，并将用户信息附加到请求对象上。
//如果验证失败，返回相应的状态码。


const jwt = require('jsonwebtoken');
const verifyToken = require('../utils/verifyToken');
const SECRET_KEY = 'your_hardcoded_secret_key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const user = await verifyToken(token, SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

module.exports = authenticateToken;
