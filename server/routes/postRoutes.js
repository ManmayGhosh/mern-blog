import express from 'express';
import {
  createPost,
  getPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  toggleLike
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { uploadPostImage, handleUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/by-id/:id', protect, getPostById);
router.get('/:slug', getPostBySlug);
router.post('/', protect, handleUpload(uploadPostImage), createPost);
router.put('/:id', protect, handleUpload(uploadPostImage), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

export default router;
