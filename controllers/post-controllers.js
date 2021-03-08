const Post = require('../models/post-model');
const HttpError = require('../models/http-error');

exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;

  const createdPost = new Post({
    title,
    content,
  });

  try {
    await createdPost.save();
  } catch (err) {
    const error = new HttpError('Creating post failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};
