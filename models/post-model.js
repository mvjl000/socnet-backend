const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: false },
  content: { type: String, required: true },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  creatorName: { type: String, required: true },
  creationDate: { type: String, required: true },
  edited: { type: Boolean, required: true },
  likes_count: { type: Number, required: true },
});

module.exports = mongoose.model('Post', postSchema);
