import express from 'express';
import {
  registerFCMToken,
  getWorkerTokens,
  deactivateFCMToken,
  cleanupInvalidTokens,
  getFCMStats
} from '../controllers/fcm.controller.js';

const router = express.Router();

// ============================================
// PUBLIC FCM ROUTES
// ============================================

// Register or update FCM token
router.post('/register', registerFCMToken);

// Get worker's active tokens
router.get('/tokens/:workerId', getWorkerTokens);

// Deactivate FCM token (on logout)
router.post('/deactivate', deactivateFCMToken);

// ============================================
// ADMIN FCM ROUTES
// ============================================

// Cleanup invalid tokens
router.post('/cleanup', cleanupInvalidTokens);

// Get FCM statistics
router.get('/stats', getFCMStats);

export default router;
