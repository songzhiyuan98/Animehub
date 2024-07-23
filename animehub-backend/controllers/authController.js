//作用：处理用户认证相关的逻辑。
//功能：
//register：处理用户注册逻辑，包括检查用户名、哈希密码、创建用户、生成 JWT 令牌和刷新令牌。
//login：处理用户登录逻辑，包括验证用户名和密码、生成 JWT 令牌和刷新令牌。
//refreshToken：处理刷新令牌逻辑，包括验证刷新令牌、生成新的访问令牌和刷新令牌。

const bcrypt = require('bcrypt'); //导入bcrypt模块
const jwt = require('jsonwebtoken'); //导入jwt模块
const User = require('../models/User'); //导入user数据库集合
const RefreshToken = require('../models/RefreshToken'); //导入刷新令牌数据库集合
const SECRET_KEY = 'your_hardcoded_secret_key'; //定义jwt验证密钥
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; //定义刷新令牌过期时间（固定）

//注册函数
exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send(`用户名${username}已存在`);
    }

    //加密哈希密码
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);
    //创建用户新文档
    const newUser = new User({ username, password: hashPassword });
    await newUser.save(); //保存至数据库user集合

    //获取jwt令牌，刷新令牌
    const accessToken = jwt.sign(
      { userId: newUser._id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: newUser._id },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    //将新刷新令牌存入数据库
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: newUser._id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION)
    });
    await newRefreshToken.save(); //异步等待刷新令牌保存

    res.send({ accessToken, refreshToken, message: `用户${username}注册成功！` }); //返回成功响应

  } catch (error) {
    if (error.code == 11000) {
      res.status(400).send(`用户名${username}已存在`); //打印错误消息
    } else {
      res.status(400).send('Error registering user: ' + error.message); //打印错误消息
    }
  }
};

//登录函数
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('用户名或密码错误');
    }

    await RefreshToken.deleteMany({ userId: user._id }); //登录时检查数据库删除之前这个账号用过的刷新令牌，确保一个账号一次只有一个刷新令牌

    //派发新的jwt令牌，刷新令牌，保存刷新令牌进入数据库
    const accessToken = jwt.sign(
      { userId: user._id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      refreshCount: 0
    });
    await newRefreshToken.save();

    res.send({ accessToken, refreshToken, message: '登陆成功!' }); //成功响应

  } catch (error) {
    res.status(500).send('Error Login in: ' + error.message); //错误响应
  }
};

//刷新令牌函数
exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401); //确认刷新令牌包含在请求头中

  try {
    const refreshToken = await RefreshToken.findOne({ token }); //异步请求寻找该令牌是否存在于数据库
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      if (refreshToken) await RefreshToken.deleteOne({ token });
      return res.sendStatus(403);
    } //如果令牌不存在或者已经过期，如果令牌存在就删除，已过期，如果不存在，直接返回403错误响应

    if (refreshToken.refreshCount >= 5) {
      return res.status(403).send('刷新次数已达到上限，请重新登录');
    } //如果该令牌已经刷新过五次，则返回错误消息，需要重新登录获取新的刷新令牌

    try {
      const user = await verifyToken(token, SECRET_KEY); //验证该令牌有效
      await RefreshToken.deleteOne({ token }); //删除旧刷新令牌

      //返回新的刷新令牌，jwt令牌
      const accessToken = jwt.sign(
        { userId: user.userId },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      const newRefreshToken = jwt.sign(
        { userId: user.userId },
        SECRET_KEY,
        { expiresIn: '7d' }
      );

      //把刷新令牌路由返回的新刷新令牌存入数据库，但不更新过期时间属性
      const newRefreshTokenDoc = new RefreshToken({
        token: newRefreshToken,
        userId: user.userId,
        expiresAt: refreshToken.expiresAt,
        refreshCount: refreshToken.refreshCount + 1
      });
      await newRefreshTokenDoc.save();

      res.json({ accessToken, refreshToken: newRefreshToken }); //响应jwt令牌，刷新令牌

    } catch (err) {
      return res.status(403).send('Failed to verify refresh token'); //错误响应
    }
  } catch (error) {
    res.status(500).send('Error processing token: ' + error.message); //错误响应
  }
};
