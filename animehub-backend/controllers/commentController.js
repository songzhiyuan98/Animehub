//作用：处理评论相关的逻辑。
//功能：addComment：添加评论到数据库，包括验证用户身份、保存评论信息。

const Comment = require('../models/Comment'); //导入comment数据库集合

//添加评论函数逻辑
exports.addComment = async (req, res) => {
  const { animeId, content } = req.body; //从请求头获取动漫id，内容
  try {
    const newComment = new Comment({
      userId: req.user.userId,
      animeId,
      content
    }); //存入新的评论进数据库
    await newComment.save();
    res.status(201).send('评论成功！');
  } catch (error) {
    res.status(500).send('Error adding comment: ' + error.message);
  }
};
