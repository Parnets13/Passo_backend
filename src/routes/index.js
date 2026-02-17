import express from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './user.routes.js';
import workerRoutes from './worker.routes.js';
import categoryRoutes from './category.routes.js';
import pricingRoutes from './pricing.routes.js';
import featuredRoutes from './featured.routes.js';
import transactionRoutes from './transaction.routes.js';
import complaintRoutes from './complaint.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';
import cmsRoutes from './cms.routes.js';
import reviewRoutes from './review.routes.js';
import adminRoutes from './admin.routes.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Public routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes); // Public admin routes for admin panel

// Protected routes (require authentication)
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/workers', workerRoutes);
router.use('/categories', categoryRoutes);
router.use('/pricing', pricingRoutes);
router.use('/featured', featuredRoutes);
router.use('/transactions', transactionRoutes);
router.use('/complaints', complaintRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/cms', cmsRoutes);
router.use('/reviews', reviewRoutes);

export default router;
