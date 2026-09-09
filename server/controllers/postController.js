import slugify from 'slugify';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const makeUniqueSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 100);
  let slug = base;
  let counter = 1;
  while (await Post.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, tags, published } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

    const slug = await makeUniqueSlug(title);
    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.replace(/[#*_`>\n]/g, '').slice(0, 200),
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      author: req.user._id,
      coverImage: req.file ? `/uploads/posts/${req.file.filename}` : '',
      published: published !== 'false'
    });

    const populated = await post.populate('author', 'username avatar');
    res.status(201).json({ post: populated });
  } catch (err) {
    next(err);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, search, author } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag.toLowerCase();
    if (author) filter.author = author;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter)
    ]);

    res.json({
      posts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    next(err);
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar bio');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar bio');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this post for editing' });
    }
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const { title, content, excerpt, tags, published } = req.body;
    if (title && title !== post.title) {
      post.title = title;
      post.slug = await makeUniqueSlug(title);
    }
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (tags !== undefined) post.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (published !== undefined) post.published = published !== 'false';
    if (req.file) post.coverImage = `/uploads/posts/${req.file.filename}`;

    await post.save();
    const populated = await post.populate('author', 'username avatar');
    res.json({ post: populated });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const uid = req.user._id.toString();
    const idx = post.likes.findIndex((id) => id.toString() === uid);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);

    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    next(err);
  }
};
