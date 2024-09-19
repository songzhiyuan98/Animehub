const Tag = require('../models/Tag');

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find().select('name');
    res.status(200).json(tags.map(tag => tag.name));
  } catch (error) {
    res.status(500).json({ message: '获取标签失败', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = new Tag({ name });
    await tag.save();
    res.status(201).json({ name: tag.name });
  } catch (error) {
    res.status(500).json({ message: '创建标签失败', error: error.message });
  }
};
