import express from 'express';
import {
  getWorkers,
  getWorkerById,
  approveWorker,
  rejectWorker,
  blockWorker,
  unblockWorker,
  markFeatured,
  removeFeatured,
  assignBadge,
  removeBadge,
  approveKYC,
  deleteWorker
} from '../controllers/worker.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get workers (for service detail page)
router.get('/public', getWorkers);

// All other routes require authentication
router.use(protect);

router.get('/', getWorkers);
router.get('/:id', getWorkerById);

// Action routes (must come before generic /:id DELETE to avoid conflicts)
router.post('/:id/approve', approveWorker);
router.post('/:id/reject', rejectWorker);
router.post('/:id/block', blockWorker);
router.post('/:id/unblock', unblockWorker);
router.post('/:id/featured', markFeatured);
router.delete('/:id/featured', removeFeatured);
router.post('/:id/badge', assignBadge);
router.delete('/:id/badge', removeBadge);
router.post('/:id/kyc/approve', approveKYC);

// Delete route (must come after specific routes)
router.delete('/:id', deleteWorker);

export default router;
