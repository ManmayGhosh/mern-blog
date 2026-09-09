import express from 'express';
import { addComment, getCommentsForPost, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/post/:postId', getCommentsForPost);
router.post('/post/:postId', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
