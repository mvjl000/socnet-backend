const Post = require('../models/post-model');
// const User = require('../models/user-model');
const HttpError = require('../models/http-error');

exports.getAllPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find();
  } catch (err) {
    const error = new HttpError(
      'Could not find posts due to server error. Please try again later.',
      500
    );
    return next(error);
  }

  res.json({ posts });
};

exports.getUserPosts = async (req, res, next) => {
  const username = req.params.username;

  let posts;
  try {
    posts = await Post.find({ creator: username });
  } catch (err) {
    const error = new HttpError(
      'Could not find user with provided username.',
      404
    );
    return next(error);
  }

  res.json({ posts });
};

exports.createPost = async (req, res, next) => {
  const { title, content, creator } = req.body;

  const createdPost = new Post({
    title,
    content,
    creator,
  });

  try {
    await createdPost.save();
  } catch (err) {
    const error = new HttpError('Creating post failed, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};
