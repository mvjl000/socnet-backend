const HttpError = require('../models/http-error');

exports.createPost = (req, res, next) => {
  const { title } = req.body;

  res.json({ message: `New post's title is ${title}` });
};
