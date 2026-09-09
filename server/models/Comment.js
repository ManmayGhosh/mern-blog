import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 }, // emoji safe (UTF-8)
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
