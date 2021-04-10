const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: false },
  content: { type: String, required: true },
  creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  creatorName: { type: String, required: true },
  creatorImage: { type: String, required: true },
  creationDate: { type: String, required: true },
  edited: { type: Boolean, required: true },
  likesCount: { type: Number, required: true },
  likedBy: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
  comments: [
    {
      commentAuthorId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      commentAuthorName: {
        type: String,
        required: true,
      },
      commentAuthorImage: {
        type: String,
        required: true,
      },
      content: { type: String, required: true },
      commentDate: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Post', postSchema);
