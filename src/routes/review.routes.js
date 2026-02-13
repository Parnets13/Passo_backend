import express from 'express';
import {
  submitReview,
  getReviews,
  getWorkerReviews,
  getReviewById,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewStats
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitReview); // Anyone can submit a review
router.get('/worker/:workerId', getWorkerReviews); // Public can view approved reviews

// Admin routes (protected)
router.get('/', protect, getReviews);
router.get('/stats', protect, getReviewStats);
router.get('/:id', protect, getReviewById);
router.post('/:id/approve', protect, approveReview);
router.post('/:id/reject', protect, rejectReview);
router.delete('/:id', protect, deleteReview);

export default router;
