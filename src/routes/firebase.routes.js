import express from 'express';
import {
  sendNotificationToUser,
  sendNotificationToWorker,
  sendBulkNotification,
  sendNotificationToWorkerType,
  sendNotificationToTopic,
  sendTestNotification
} from '../controllers/firebase.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Test notification (no auth required for testing)
router.post('/test', sendTestNotification);

// Protected routes - require authentication
router.use(protect);

// Send notification to single user
router.post('/send-to-user', authorize('admin'), sendNotificationToUser);

// Send notification to single worker
router.post('/send-to-worker', authorize('admin'), sendNotificationToWorker);

// Send bulk notifications to multiple users
router.post('/send-bulk', authorize('admin'), sendBulkNotification);

// Send notification to all workers of specific type
router.post('/send-to-worker-type', authorize('admin'), sendNotificationToWorkerType);

// Send notification to topic
router.post('/send-to-topic', authorize('admin'), sendNotificationToTopic);

export default router;
