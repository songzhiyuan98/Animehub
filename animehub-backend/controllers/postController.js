//作用：处理帖子相关的逻辑。

//功能：

//createPost：创建新的帖子，包括处理图片上传、保存帖子信息。
//getPosts：分页获取帖子信息，包括关联用户信息、排序和分页处理。

const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newPost = new Post({
      userId: req.user.userId,
      title,
      content,
      image
    });
    await newPost.save();
    res.status(201).send('Post Created Successfully!');
  } catch (error) {
    res.status(500).send('Error Creating Post: ' + error.message);
  }
};

exports.getPosts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const posts = await Post.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const totalPosts = await Post.countDocuments();
    res.status(200).json({
      posts,
      totalPage: Math.ceil(totalPosts / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).send('Error Fetching posts: ' + error.message);
  }
};
