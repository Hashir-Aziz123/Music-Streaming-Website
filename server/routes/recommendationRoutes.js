import express from 'express';
import { fetchTopRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/:userId', fetchTopRecommendations);

export default router;
