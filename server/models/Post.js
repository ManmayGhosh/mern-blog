import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // markdown; stores emoji/unicode fine (UTF-8)
    excerpt: { type: String, maxlength: 300, default: '' },
    coverImage: { type: String, default: '' }, // /uploads/posts/xyz.jpg
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    published: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Post', postSchema);
