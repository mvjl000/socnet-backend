const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: false },
  content: { type: String, required: true },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  creatorName: { type: String, required: true },
});

module.exports = mongoose.model('Post', postSchema);
