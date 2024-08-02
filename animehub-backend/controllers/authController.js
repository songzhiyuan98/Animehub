//作用：处理用户认证相关的逻辑。
const bcrypt = require("bcrypt"); //导入bcrypt模块
const jwt = require("jsonwebtoken"); //导入jwt模块
const User = require("../models/User"); //导入user数据库集合
const path = require("path"); //导入path
const RefreshToken = require("../models/RefreshToken"); //导入刷新令牌数据库集合
const SECRET_KEY = "your_hardcoded_secret_key"; //定义jwt验证密钥
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; //定义刷新令牌过期时间（固定）
const redis = require("../config/redisClient"); //导入redis模块
const {
  sendVerificationCode,
  generateVerificationCode,
} = require("../utils/email"); //导入生成验证码，发送验证码函数

//请求发送验证码函数
exports.requestVerificationCode = async (req, res) => {
  const { email } = req.body; //从请求头中获取电子邮箱地址

  try {
    const existingUser = await User.findOne({ email }); //根据email查找User表
    if (existingUser) {
      return res.status(400).json({ message: "邮箱已被注册" }); //如果在表中找到对应用户，返回邮箱已被注册
    }

    const code = generateVerificationCode(); //随机生成验证码
    await sendVerificationCode(email, code); //发送验证码到目的邮箱
    res.json({ message: "验证码已成功发送到您的邮箱" }); //成功响应消息
  } catch (error) {
    res.status(500).json({ message: error.message }); //错误响应
  }
};

//验证验证码函数
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body; //从请求头中获取电子邮箱，验证码

  try {
    //确保邮箱已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send(`邮箱已被注册`);
    }

    const storedCode = await redis.get(email); //从redis储存中获取验证码，根据电子邮箱
    if (storedCode === code) {
      await redis.setex(`${email}:verified`, 3600, "true"); // 设置验证成功标志，过期时间可设为较长时间
      res.send({ message: "验证成功" }); //验证通过
    } else {
      res.status(400).json({ message: "验证码错误或已过期" }); //验证失败
    }
  } catch (error) {
    res.status(500).json({ message: error.message }); //请求验证失败
  }
};

//注册函数
exports.register = async (req, res) => {
  const { username, password, email, verificationCode } = req.body;
  //在后端检查是否所有字段已填写，双重验证
  if (!username || !password || !email || !verificationCode) {
    res.status(400).send("所有字段都是必填的");
  }
  try {
    //确保用户通过了邮箱验证
    const verified = await redis.get(`${email}:verified`); //根据邮箱查找redis，验证状态为真或者假
    if (!verified) {
      return res.status(400).send("请先进行邮箱验证");
    }

    await redis.del(`${email}:verified`); //删除验证标志，防止重复使用

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send(`邮箱已被注册`);
    }

    //加密哈希密码
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);
    //创建用户新文档
    const newUser = new User({
      username,
      password: hashPassword,
      email,
      emailVerified: true,
    }); //储存用户名，密码，邮箱，邮箱认证状态
    await newUser.save(); //保存至数据库user集合

    //获取jwt令牌，刷新令牌
    const accessToken = jwt.sign({ userId: newUser._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: newUser._id }, SECRET_KEY, {
      expiresIn: "7d",
    });
    //将新刷新令牌存入数据库
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: newUser._id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
    });
    await newRefreshToken.save(); //异步等待刷新令牌保存

    //返回用户信息，不包含密码
    const userDoc = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      nickname: newUser.nickname,
      gender: newUser.gender,
      emailVerified: newUser.emailVerified,
    };

    res.send({
      accessToken,
      refreshToken,
      user: userDoc,
      message: `用户${username}注册成功！`,
    }); //返回成功响应
  } catch (error) {
    if (error.code == 11000) {
      res.status(400).json({ message: `用户名${username}已存在` }); //打印错误消息
    } else {
      res.status(400).json({ message: error.message }); //打印错误消息
    }
  }
};

//登录函数
exports.login = async (req, res) => {
  const { identifier, password } = req.body; //接受用户名/邮箱，密码
  try {
    //根据用户输入，用户名或者电子邮箱，查询用户文档
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    //检查用户是否存在
    if (!user) {
      return res.status(401).json({ message: "用户名或者邮箱未注册" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "密码不正确，请重试" });
    }

    await RefreshToken.deleteMany({ userId: user._id }); //登录时检查数据库删除之前这个账号用过的刷新令牌，确保一个账号一次只有一个刷新令牌

    //派发新的jwt令牌，刷新令牌，保存刷新令牌进入数据库
    const accessToken = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: user._id }, SECRET_KEY, {
      expiresIn: "7d",
    });
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      refreshCount: 0,
    });
    await newRefreshToken.save();

    //删除返回给前端redux的用户文档的敏感信息如密码
    const userWithoutSensitiveInfo = user.toObject();
    delete userWithoutSensitiveInfo.password;

    res.send({
      accessToken,
      refreshToken,
      user: userWithoutSensitiveInfo,
      message: "登陆成功!",
    }); //成功响应
  } catch (error) {
    res.status(500).json({ message: error.message }); //错误响应
  }
};

//根据用户名获取完整用户文档
exports.getUserDoc = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//更新用户信息函数
exports.updateUserProfile = async (req, res) => {
  const { nickname, gender } = req.body; //从请求头解构昵称，性别
  const userId = req.user.userId; //从jwt令牌中获取req.user

  try {
    const updateData = { nickname, gender }; //更新数组
    if (req.file) {
      updateData.avatar = `/avatars/${req.file.filename}`; //如果头像文件存在，更新数组
    }
    const updateUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }); //根据id查找用户文档并且更新
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updateUser); //响应更新后的用户文档
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
      return res.status(403).send("刷新次数已达到上限，请重新登录");
    } //如果该令牌已经刷新过五次，则返回错误消息，需要重新登录获取新的刷新令牌

    try {
      const user = await verifyToken(token, SECRET_KEY); //验证该令牌有效
      await RefreshToken.deleteOne({ token }); //删除旧刷新令牌

      //返回新的刷新令牌，jwt令牌
      const accessToken = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "1h",
      });
      const newRefreshToken = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "7d",
      });

      //把刷新令牌路由返回的新刷新令牌存入数据库，但不更新过期时间属性
      const newRefreshTokenDoc = new RefreshToken({
        token: newRefreshToken,
        userId: user.userId,
        expiresAt: refreshToken.expiresAt,
        refreshCount: refreshToken.refreshCount + 1,
      });
      await newRefreshTokenDoc.save();

      res.json({ accessToken, refreshToken: newRefreshToken }); //响应jwt令牌，刷新令牌
    } catch (err) {
      return res.status(403).send("Failed to verify refresh token"); //错误响应
    }
  } catch (error) {
    res.status(500).send("Error processing token: " + error.message); //错误响应
  }
};
