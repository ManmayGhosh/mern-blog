import express from 'express';
import { suggestScene } from '../controllers/sceneController.js';

const router = express.Router();

router.get('/suggest', suggestScene);

export default router;
