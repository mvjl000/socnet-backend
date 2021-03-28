require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user-model');

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isPasswordValid;
  try {
    isPasswordValid = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!isPasswordValid) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, username: existingUser.username },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Failed to login. Please try again later.',
      500
    );
    return next(error);
  }

  res.json({ username, userId: existingUser._id, token });
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid credentials passed.', 422));
  }

  const { username, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Failed to create user. Please try again later.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    username,
    password: hashedPassword,
    description: 'Here you can write something about you.',
    posts: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Failed to save new user. Please try again later.',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, username: createdUser.username },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Failed to create user. Please try again later.',
      500
    );
    return next(error);
  }

  res.status(201).json({ username: createdUser.username, token });
};

exports.getUserData = async (req, res, next) => {
  const username = req.params.uname;

  let user;
  try {
    user = await User.findOne({ username });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, please try again later.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user with provided id.', 404);
    return next(error);
  }

  res.status(200).json({ description: user.description });
};

exports.updateDescription = async (req, res, next) => {
  const { description } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update description.',
      500
    );
    return next(error);
  }

  user.description = description;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update description.',
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: 'Description updated successfully',
    username: user.username,
  });
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError('Could not delete user, try again later.', 500);
    return next(error);
  }

  user.remove();

  res.status(200).json({ message: 'User deleted' });
};
