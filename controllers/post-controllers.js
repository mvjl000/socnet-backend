const mongoose = require('mongoose');

const Post = require('../models/post-model');
const User = require('../models/user-model');
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
  const userId = req.params.uid;

  let userWithPosts;
  try {
    userWithPosts = await User.findById(userId).populate('posts');
  } catch (err) {
    const error = new HttpError(
      'Fetching posts failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!userWithPosts) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ posts: userWithPosts.posts });
};

exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;

  const createdPost = new Post({
    title,
    content,
    creatorId: req.userData.userId,
    creatorName: req.userData.username,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating post failed, please try again.', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPost.save({ session: sess });
    user.posts.push(createdPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating post failed, please try again.', 500);
    return next(error);
  }

  res
    .status(201)
    .json({
      post: {
        title: createdPost.title,
        content: createdPost.content,
        creatorName: this.createPost.creatorName,
        _id: createdPost._id,
      },
    });
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findById(postId).populate('creatorId');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place. Please try again later.',
      500
    );
    return next(error);
  }
  if (!post) {
    const error = new HttpError('Could not find post with provided id.', 404);
    return next(error);
  }

  if (post.creatorId._id.toString() !== req.userData.userId.toString()) {
    const error = new HttpError(
      'You are not allowed to delete this post.',
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess });
    post.creatorId.posts.pull(post);
    await post.creatorId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete post.',
      500
    );
    return next(error);
  }

  res.json({ message: 'Post deleted succesfully' });
};
