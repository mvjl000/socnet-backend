const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

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
  const username = req.params.uname;

  let userWithPosts;
  try {
    userWithPosts = await User.findOne({ username }).populate('posts');
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Post fields are too long, or too short.', 422));
  }

  const { title, content } = req.body;

  const today = new Date().toISOString().slice(0, 10);

  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();

  const createdPost = new Post({
    title,
    content,
    creatorId: req.userData.userId,
    creatorName: req.userData.username,
    creationDate: `${today} | ${hours}:${
      minutes < 10 ? '0' + minutes.toString() : minutes
    }`,
    edited: false,
    likesCount: 0,
    likedBy: [],
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

  res.status(201).json({
    post: createdPost,
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

exports.editPost = async (req, res, next) => {
  const { content } = req.body;
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post with provided id.', 404);
    return next(error);
  }

  if (post.creatorId.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this post.', 401);
    return next(error);
  }

  post.content = content;
  post.edited = true;

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not edit post',
      500
    );
    return next(error);
  }

  res.json({ content: post.content });
};

exports.likeAction = async (req, res, next) => {
  const { actionType, postId } = req.body;

  let post;
  try {
    post = await Post.findById(postId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find post.',
      500
    );
    return next(error);
  }

  if (!post) {
    const error = new HttpError('Could not find post with provided id.', 404);
    return next(error);
  }

  const isPostLikedByUser = post.likedBy.find(
    (userId) => userId.toString() === req.userData.userId
  );

  if (actionType === 'LIKE') {
    if (isPostLikedByUser) {
      const error = new HttpError('This post is already liked by you.', 409);
      return next(error);
    } else {
      post.likesCount++;
      post.likedBy.push(req.userData.userId);
      try {
        await post.save();
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not save post likes value.',
          500
        );
        return next(error);
      }
    }
  } else if (actionType === 'DISLIKE') {
    if (isPostLikedByUser) {
      post.likesCount--;
      const updatedLikeUsers = post.likedBy.filter(
        (userId) => userId.toString() !== req.userData.userId
      );
      post.likedBy = updatedLikeUsers;
      try {
        await post.save();
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not save post likes value.',
          500
        );
        return next(error);
      }
    } else {
      const error = new HttpError(
        'This post is not liked by you, so it can not be disliked.',
        409
      );
      return next(error);
    }
  }

  res.json({
    post,
  });
};
