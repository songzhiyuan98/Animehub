//作用：处理帖子相关的逻辑。
//功能：
//createPost：创建新的帖子，包括处理图片上传、保存帖子信息。
//getPosts：分页获取帖子信息，包括关联用户信息、排序和分页处理。

const Post = require('../models/Post'); //导入帖子数据库集合

//创建帖子函数
exports.createPost = async (req, res) => {
  const { title, content } = req.body; //从请求头获取标题和内容
  const image = req.file ? `/uploads/${req.file.filename}` : null; //从请求form获取图片上传

  try {
    const newPost = new Post({
      userId: req.user.userId,
      title,
      content,
      image
    }); //保存新的帖子文档
    await newPost.save(); //储存到帖子数据库集合
    res.status(201).send('Post Created Successfully!'); //成功响应
  } catch (error) {
    res.status(500).send('Error Creating Post: ' + error.message); //错误响应
  }
};

//获取帖子函数
exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; //分页获取结构获取page和limit，默认为1，10

  try {
    const posts = await Post.find() //获取所有帖子
      .populate('userId', 'username') //关联user集合，填充username字段
      .sort({ createdAt: -1 }) //按创建时间降序排列
      .skip((page - 1) * limit) //跳过前面请求过的内容，根据page和limit（具体逻辑在前端）
      .limit(Number(limit)); //根据limit限制返回数量
    
    const totalPosts = await Post.countDocuments(); //更新总帖子数量
    res.status(200).json({
      posts,
      totalPage: Math.ceil(totalPosts / limit),
      currentPage: Number(page)
    }); //响应limit数量的帖子数组，总页面数量，现页面
  } catch (error) {
    res.status(500).send('Error Fetching posts: ' + error.message); //错误响应
  }
};
