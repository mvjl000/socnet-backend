const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  description: {
    type: String,
  },
  posts: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Post' }],
  image: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
