import express from 'express';
import { 
  getStats, 
  getDailyUnlocks, 
  getRevenueByType, 
  getTopCategories 
} from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getStats);
router.get('/daily-unlocks', getDailyUnlocks);
router.get('/revenue-by-type', getRevenueByType);
router.get('/top-categories', getTopCategories);

export default router;
