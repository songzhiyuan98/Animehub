//作用：定义身份验证中间件。
//功能：
//从请求头中获取 JWT 令牌，验证令牌，并将用户信息附加到请求对象上。
//如果验证失败，返回相应的状态码。

const jwt = require("jsonwebtoken"); //导入jwt模块
const verifyToken = require("../utils/verifyToken"); //导入验证jwt验证函数
const SECRET_KEY = "your_hardcoded_secret_key"; //密钥

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; //从请求头里获取authorization属性
  const token = authHeader && authHeader.split(" ")[1]; //分离请求头获取jwt令牌
  if (!token) return res.sendStatus(401); //如果令牌不存在直接返回401错误
  try {
    const user = await verifyToken(token, SECRET_KEY); //异步请求等待jwt验证函数响应
    req.user = user; //返回给请求端user属性为验证后的user信息
    next(); //继续原路由函数
  } catch (err) {
    res.sendStatus(403); //响应403错误消息
  }
};

module.exports = authenticateToken; //导出认证模块
