const bcrypt = require('bcryptjs');

const HttpError = require('../models/http-error');
const User = require('../models/user-model');

exports.login = (req, res, next) => {
  const { username, password } = req.body;

  res.json({ message: 'Loggin in', username: username });
};

exports.signup = async (req, res, next) => {
  const { username, password, repeatPassword } = req.body;

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

  const areCredentialsValid =
    username.length > 0 && password.length > 0 && password === repeatPassword;

  if (!areCredentialsValid) {
    const error = new HttpError('Invalid credentials.', 403);
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

  res.status(201).json({ message: 'user created successfully', username });
};
