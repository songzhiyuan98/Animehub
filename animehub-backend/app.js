const express = require('express'); //express.js框架
const mongoose = require('mongoose'); //mongoose操作数据库
const bcrypt = require('bcrypt'); //解码令牌库
const jwt = require('jsonwebtoken'); //jwt令牌
const cors = require('cors');
const multer = require('multer'); //node中间件处理文件上传并将文件储存到指定位置，处理用户上传的图片
const path = require('path'); //用来处理和转换文件路径
const axios = require('axios');
const fs = require('fs'); // 引入fs模块
const app = express();
const port = 3000; //监听端口3000

app.use(cors()); // 使用 CORS 中间件

//中间件解析请求体
app.use(express.json());

//连接MongoDB数据库
mongoose.connect('mongodb://localhost:27017/animehub')
    .then(() => console.log(`MongoDB connected`)) //控制台打印连接成功
    .catch(err => console.log(`MongoDB connection error: `, err)); //控制台打印连接失败

//在数据库中定义用户信息集合
const userSchema = new mongoose.Schema({
    username : {type : String, required : true, unique : true}, //用户名唯一性
    password : {type : String, required : true} //密码
});

//定义用户模型和数据库集合users（小写复数模型名称）
const User = mongoose.model(`User`, userSchema); //参数（模型名称，用户模式）

//在数据库中定义刷新令牌集合
const refreshTokenSchema = new mongoose.Schema({
    token : {type : String, required : true}, //令牌内容「头，内容，签名」
    userId : {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'User'}, //关联User表，引用字段
    expiresAt : {type : Date, required : true}, //过期时间
    refreshCount: { type: Number, default: 0 } // 刷新次数
});

//定义刷新令牌模型和数据库集合refreshtokens
const RefreshToken = mongoose.model(`RefreshToken`, refreshTokenSchema);

//在数据库中定义评论集合
const commentSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'User'}, //关联User表，引用字段
    animeId : {type : String, required : true}, //动漫名称
    content : {type : String, required : true}, //评论内容
    createdAt : {type : Date, default : Date.now} //创建时间：默认Date.now函数
});

//定义评论模型和数据库集合Comment
const Comment = mongoose.model(`Comment`, commentSchema);

//在数据库中定义帖子集合
const postSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true, ref : 'User'}, //关联User表
    title : {type : String, required : true}, //帖子标题
    content : {type : String, required : true}, //帖子内容
    image : {type : String, required : false}, //帖子图片
    createdAt : {type : Date, default : Date.now} //帖子发送时间
});

//定义帖子模型和数据库集合
const Post = mongoose.model(`Post`,postSchema);


const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir);
        }
        cb(null, uploadsDir);
    },
    filename : (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

//实例化multer模型,让multer可以使用
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

//硬编码的密钥（后期可使用环境变量更换）
const SECRET_KEY = 'your_hardcoded_secret_key';

const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7天

//注册路由,接受「用户名，密码」，响应jwt令牌，刷新令牌，消息
app.post('/api/register', async (req, res) => {
    //获取用户名和密码
    const { username, password } = req.body;
    //添加用户注册逻辑
    try{
        //检查用户名是否已存在
        const existingUser = await User.findOne({username});
        if (existingUser){
            return res.status(400).send(`用户名${username}已存在`);
        }

        //哈希密码
        const saltRound = 10;
        const hashPassword = await bcrypt.hash(password, saltRound);
        //创建新用户
        const newUser = new User({username, password: hashPassword});
        await newUser.save();

        //创建jwt令牌
        const accessToken = jwt.sign(
            {userId : newUser._id},//Playload:包含用户id
            SECRET_KEY,//Secret：用于签名的密钥
            {expiresIn : '1h'}//Option：JWT的过期时间
        );
        //创建刷新令牌
        const refreshToken = jwt.sign(
            {userId : newUser._id},
            SECRET_KEY,
            {expiresIn : '7d'} 
        );
        //创建储存在后端的新刷新令牌
        const newRefreshToken = new RefreshToken({
            token : refreshToken,
            userId : newUser._id,
            expiresAt : new Date(Date.now() + REFRESH_TOKEN_EXPIRATION)//设置绝对过期时间七天
        });
        await newRefreshToken.save();//储存刷新令牌在数据库

        //注册成功
        const responsePayload = {
            accessToken,
            refreshToken,
            message: `用户${username}注册成功！`
        }

        res.send(responsePayload);

    }catch (error){
        //重复性检查（数据库层面）
        if (error.code == 11000){
            res.status(400).send(`用户名${username}已存在`);
        }else{
            res.status(400).send(`error registering user: `, error.message);
        }
    }
});

// 登录路由：处理用户登录请求，接受「用户名，密码」，响应jwt令牌，刷新令牌，消息
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    // 简单的登录验证逻辑
    try{
        const user = await User.findOne({username});
        //找不到用户名
        if (!user){
            return res.status(401).send('用户名或密码错误')
        }

        //验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(401).send('用户名或密码错误');
        }

        //删除旧的刷新令牌
        await RefreshToken.deleteMany({ userId : user._id });
        
        //创建jwt令牌
        const accessToken = jwt.sign(
            {userId : user._id},//Playload:包含用户id
            SECRET_KEY,//Secret：用于签名的密钥
            {expiresIn : '1h'}//Option：JWT的过期时间
        );
        //创建刷新令牌
        const refreshToken = jwt.sign(
            {userId : user._id},
            SECRET_KEY,
            {expiresIn : '7d'}
        );
        //创建储存在后端的新刷新令牌
        const newRefreshToken = new RefreshToken({
            token : refreshToken,
            userId : user._id,
            expiresAt : new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),//设置绝对过期时间七天
            refreshCount: 0 // 初始化刷新次数
        });
        await newRefreshToken.save();//储存刷新令牌在数据库

        //登陆成功
        const responsePayload = {
            accessToken,
            refreshToken,
            message: '登陆成功!'
        }
        res.send(responsePayload);

    }catch(error){
        res.status(500).send('Error Login in: ' + error.message);
    }
  });

// 封装 jwt.verify 为返回 Promise 的函数
const verifyToken = (token, secret) => {
    //创建一个新的 Promise 对象
    return new Promise((resolve, reject) => {
        //在 Promise 的回调函数中调用 jwt.verify
        //使用 jwt.verify 方法验证令牌。verify 方法需要三个参数：
        //token：需要验证的 JWT 令牌。
        //SECRET_KEY：用于签名令牌的密钥。
        //回调函数：包含两个参数 err 和 user，其中 err 表示验证过程中发生的错误，user 是解码后的令牌内容（如果验证成功）。
        jwt.verify(token, secret, (err, decoded) => {
            //如果 jwt.verify 回调函数中出现错误，则调用 reject，将错误传递出去：
            if (err) {
                reject(err);
            //如果 jwt.verify 成功解析了令牌，则调用 resolve，将解析后的数据传递出去：
            } else {
                resolve(decoded);
            }
        });
    });
};

//刷新路由：处理jwt令牌刷新请求，接受「jwt令牌」，响应新的jwt令牌和刷新令牌
app.post('/api/token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.sendStatus(401); // 无刷新令牌时返回 401 未授权
    }

    try {
        const refreshToken = await RefreshToken.findOne({ token });

        if (!refreshToken || refreshToken.expiresAt < new Date()) {
            //删除过期刷新令牌
            if (refreshToken){
                await RefreshToken.deleteOne({ token });
            }
            return res.sendStatus(403); // 刷新令牌无效或已过期时返回 403 禁止访问
        }

        // 检查刷新次数是否超限
        if (refreshToken.refreshCount >= 5) {
            return res.status(403).send('刷新次数已达到上限，请重新登录');
        }

        try{
            const user = await verifyToken(token, SECRET_KEY);


            await RefreshToken.deleteOne({ token });//删除旧的刷新令牌

            // 创建新的访问令牌
            const accessToken = jwt.sign(
                { userId: user.userId },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            
            // 创建新的刷新令牌
            const newRefreshToken = jwt.sign(
                { userId: user.userId },
                SECRET_KEY,
                { expiresIn: '7d' }
            );

            // 储存新的刷新令牌进入数据库，保持属性过期时间为登录时开始记录
            const newRefreshTokenDoc = new RefreshToken({
                token : newRefreshToken,
                userId : user.userId,
                expiresAt : refreshToken.expiresAt,
                refreshCount: refreshToken.refreshCount + 1 // 更新刷新次数
            });

            await newRefreshTokenDoc.save(); //保存新的刷新令牌进数据库

            res.json({ accessToken, refreshToken : newRefreshToken }); // 返回新的访问令牌，刷新令牌
        }catch(err){
            return res.status(403).send('Failed to verify refresh token'); // 验证刷新令牌失败时返回 403 禁止访问
        }
    } catch (error) {
        res.status(500).send('Error processing token: ' + error.message); // 处理刷新令牌时发生错误
    }
});

//身份验证中间件
const authenticateToken = async (req, res, next) => {
    //从请求头中获取 Authorization 字段。这个字段通常包含 JWT 令牌，格式为 Bearer <token>。
    const authHeader = req.headers['authorization']; 
    //使用逻辑与操作符检查 authHeader 是否存在，如果存在，则使用 split(' ') 方法将 authHeader 按空格分割成数组，并获取数组的第二个元素（即令牌）。如果 authHeader 不存在，token 将是 undefined。
    const token = authHeader && authHeader.split(' ')[1];
    //如果 token 是 undefined 或空字符串，返回 HTTP 状态码 401（未授权），表示请求中没有提供有效的令牌。
    if (!token) return res.sendStatus(401);
    try {
        const user = await verifyToken(token, SECRET_KEY);
        req.user = user;
        next();
    } catch (err) {
        res.sendStatus(403);
    }
};

//评论路由：添加评论到数据库,接受「jwt令牌，animeId，contetn」，响应消息
app.post('/api/comments', authenticateToken, async (req, res) => {
    const { animeId, content } = req.body;

    try{
        const newComment = new Comment({
            userId : req.user.userId,
            animeId,
            content
        });
        await newComment.save();

        res.status(201).send('评论成功！');
    }catch(error){
        res.status(500).send(`error adding message` + error.message);
    }
});

//创建帖子路由，接受「jwt令牌，标题，内容，封面」，响应
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
    //从请求包里获取帖子标题，内容，图片
    const { title, content } = req.body;
    //如果文件存在，生成文件的存储路径；如果文件不存在，则设置为 null。
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        //创建新的帖子
        const newPost = new Post({
            userId : req.user.userId,
            title,
            content,
            image
        });
        await newPost.save(); //将新帖子存入数据库
        //返回创建成功消息响应
        res.status(201).send('Post Created Successfully!');
    }catch (error) {
        //返回
        res.status(500).send('Error Creating Post: ' + error.message);
    }
});

//提供静态文件服务，让浏览器可以通过http://localhost:3000/uploads/image.jpg访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//分页获取帖子信息路由，接受「page，limit」，响应
app.get('/api/posts', async (req, res) => {
    const { page = 1, limit = 10 } =req.query; //解构操作，从http请求中？后获取page，limit，默认值为1，10

    try {
        const posts = await Post.find() //获取指定分页的帖子数据
            .populate('userId', 'username') //关联用户表
            .sort({createdAt: -1}) //按时间降序排列
            .skip((page - 1) * limit) //跳过这个页面之前的所有帖子
            .limit(Number(limit)); //限制帖子数量为limit
        
        const totalPosts = await Post.countDocuments(); //计算总帖子数量
        //返回成功响应json文件
        res.status(200).json({
            posts, //包含帖子信息的数组
            totalPage : Math.ceil(totalPosts/limit), //计算页面数量
            currentPage : Number(page) //目前页面
        });
    }catch (error) {
        res.status(500).send('Error Fetching posts: ' + error.message); //响应错误消息
    }
});

app.get('/api/daily-recommendations', async (req, res) => {
    try {
        const response = await axios.get('https://api.jikan.moe/v4/top/anime');
        const allRecommendations = response.data.data;

        // 确保推荐的数量不超过总的数量
        const numOfRecommendations = 7;
        const recommendations = [];

        for (let i = 0; i < numOfRecommendations; i++) {
            const randomIndex = Math.floor(Math.random() * allRecommendations.length);
            recommendations.push(allRecommendations[randomIndex]);
            allRecommendations.splice(randomIndex, 1); // 确保不会重复推荐相同的动漫
        }

        res.status(200).send(recommendations);
    } catch (error) {
        res.status(500).send('Error fetching daily recommendations: ' + error.message);
    }
});


// 启动服务器，监听端口3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });