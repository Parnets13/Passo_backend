import express from 'express';
import {
  sendPushNotification,
  sendBroadcastNotification,
  getNotifications,
  getNotificationById,
  deleteNotification
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Send push notification to specific workers
router.post('/send', sendPushNotification);

// Send broadcast notification to all workers
router.post('/broadcast', sendBroadcastNotification);

// Get all notifications
router.get('/', getNotifications);

// Get notification by ID
router.get('/:id', getNotificationById);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
