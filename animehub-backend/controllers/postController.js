const mongoose = require('mongoose');
const Post = require('../models/Post');

// 创建帖子函数
exports.createPost = async (req, res) => {
  try {
    const { title, content, previewText, tags } = req.body;
    const userId = req.user.userId;
    let coverImage = '';

    if (req.file) {
      coverImage = '/' + req.file.path; // 添加前导斜杠
    }

    // 计算预计阅读时间
    const calculateReadTime = (text) => {
      if (!text) return 1; // 如果没有文本，返回默认值1分钟
      const charsPerMinute = 1000; // 假设平均每分钟阅读1000个字符
      const charCount = text.length;
      const readTime = Math.ceil(charCount / charsPerMinute);
      return Math.max(readTime, 1); // 返回至少1分钟
    };

    const readTime = calculateReadTime(content);

    const newPost = new Post({
      title,
      content,
      previewText,
      coverImage,
      author: userId,
      readTime: readTime, // 将计算出的阅读时间存储到数据库
      tags: JSON.parse(tags) // 解析标签数据
    });

    await newPost.save();
    res.status(201).json({ message: '帖子创建成功', post: newPost });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ message: '创建帖子失败', error: error.message });
  }
};

// 获取帖子函数
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // 获取页码
    const limit = parseInt(req.query.limit) || 10; // 获取每页帖子数量
    const skip = (page - 1) * limit; // 计算跳过帖子数量

    const posts = await Post.find() // 查找所有帖子
      .select('title previewText coverImage author createdAt readTime tags likes') // 添加 tags
      .populate('author', 'username avatar') // 关联user集合，填充username和avatar字段
      .sort({ createdAt: -1 }) // 按创建时间降序排列
      .skip(skip) // 跳过帖子数量
      .limit(limit); // 限制帖子数量

    const totalPosts = await Post.countDocuments(); // 计算帖子总数
    const totalPages = Math.ceil(totalPosts / limit); // 计算总页数

    const response = {
      posts,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages
    };

    res.status(200).json(response); // 响应帖子信息
  } catch (error) {
    console.error('Error in getPosts:', error); // 输出错误信息
    res.status(500).json({ message: '获取帖子失败', error: error.message }); // 响应错误信息
  }
  // ... 保持不变 ...
};

// 获取单个帖子详情函数
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar');
    
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error in getPostById:', error);
    res.status(500).json({ message: '获取帖子详情失败', error: error.message });
  }
};

// 点赞帖子函数
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "帖子不存在" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取相似帖子函数
exports.getSimilarPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const currentPost = await Post.findById(id);
    if (!currentPost) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 查找具有相同标签的帖子
    const similarPosts = await Post.find({
      _id: { $ne: id },
      tags: { $in: currentPost.tags }
    }).populate('author', 'username avatar');

    // 计算每个帖子匹配的标签数量并排序
    const sortedSimilarPosts = similarPosts
      .map(post => ({
        ...post.toObject(),
        matchingTags: post.tags.filter(tag => currentPost.tags.includes(tag)).length
      }))
      .sort((a, b) => b.matchingTags - a.matchingTags);

    // 如果相似帖子不足10个，随机选择其他帖子
    if (sortedSimilarPosts.length < 10) {
      const remainingCount = 10 - sortedSimilarPosts.length;
      const existingIds = new Set([id, ...sortedSimilarPosts.map(post => post._id.toString())]);

      const randomPosts = await Post.aggregate([
        { $match: { _id: { $nin: Array.from(existingIds).map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sample: { size: remainingCount } },
        { $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        { $project: {
            'author.username': 1,
            'author.avatar': 1,
            title: 1,
            content: 1,
            previewText: 1,
            coverImage: 1,
            createdAt: 1,
            readTime: 1,
            tags: 1
          }
        }
      ]);

      sortedSimilarPosts.push(...randomPosts.map(post => ({ ...post, matchingTags: 0 })));
    }

    // 返回前10个帖子
    const recommendedPosts = sortedSimilarPosts.slice(0, 10);

    res.status(200).json(recommendedPosts);
  } catch (error) {
    console.error('Error in getSimilarPosts:', error);
    res.status(500).json({ message: '获取相似帖子失败', error: error.message });
  }
};
