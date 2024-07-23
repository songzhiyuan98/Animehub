//作用：处理评论相关的逻辑。

//功能：

//addComment：添加评论到数据库，包括验证用户身份、保存评论信息。

const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  const { animeId, content } = req.body;
  try {
    const newComment = new Comment({
      userId: req.user.userId,
      animeId,
      content
    });
    await newComment.save();
    res.status(201).send('评论成功！');
  } catch (error) {
    res.status(500).send('Error adding comment: ' + error.message);
  }
};
