//作用：处理用户认证相关的逻辑。

//功能：

//register：处理用户注册逻辑，包括检查用户名、哈希密码、创建用户、生成 JWT 令牌和刷新令牌。
//login：处理用户登录逻辑，包括验证用户名和密码、生成 JWT 令牌和刷新令牌。
//refreshToken：处理刷新令牌逻辑，包括验证刷新令牌、生成新的访问令牌和刷新令牌。

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const SECRET_KEY = 'your_hardcoded_secret_key';
const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send(`用户名${username}已存在`);
    }

    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);
    const newUser = new User({ username, password: hashPassword });
    await newUser.save();

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
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: newUser._id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION)
    });
    await newRefreshToken.save();

    res.send({ accessToken, refreshToken, message: `用户${username}注册成功！` });

  } catch (error) {
    if (error.code == 11000) {
      res.status(400).send(`用户名${username}已存在`);
    } else {
      res.status(400).send('Error registering user: ' + error.message);
    }
  }
};

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

    await RefreshToken.deleteMany({ userId: user._id });

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

    res.send({ accessToken, refreshToken, message: '登陆成功!' });

  } catch (error) {
    res.status(500).send('Error Login in: ' + error.message);
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  try {
    const refreshToken = await RefreshToken.findOne({ token });
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      if (refreshToken) await RefreshToken.deleteOne({ token });
      return res.sendStatus(403);
    }

    if (refreshToken.refreshCount >= 5) {
      return res.status(403).send('刷新次数已达到上限，请重新登录');
    }

    try {
      const user = await verifyToken(token, SECRET_KEY);
      await RefreshToken.deleteOne({ token });

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

      const newRefreshTokenDoc = new RefreshToken({
        token: newRefreshToken,
        userId: user.userId,
        expiresAt: refreshToken.expiresAt,
        refreshCount: refreshToken.refreshCount + 1
      });
      await newRefreshTokenDoc.save();

      res.json({ accessToken, refreshToken: newRefreshToken });

    } catch (err) {
      return res.status(403).send('Failed to verify refresh token');
    }
  } catch (error) {
    res.status(500).send('Error processing token: ' + error.message);
  }
};
