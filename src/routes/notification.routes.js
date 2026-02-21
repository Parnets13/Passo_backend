import express from 'express';
import {
  sendNotification,
  sendMulticastNotification,
  sendNotificationToWorker,
  sendNotificationToWorkers,
  NotificationTemplates
} from '../services/notification.service.js';

const router = express.Router();

/**
 * @route   POST /api/notifications/send
 * @desc    Send notification to a single device
 * @access  Private (Admin)
 */
router.post('/send', async (req, res) => {
  try {
    const { fcmToken, title, body, data } = req.body;

    if (!fcmToken || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'FCM token, title, and body are required'
      });
    }

    const result = await sendNotification(
      fcmToken,
      { title, body },
      data || {}
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/send-multiple
 * @desc    Send notification to multiple devices
 * @access  Private (Admin)
 */
router.post('/send-multiple', async (req, res) => {
  try {
    const { fcmTokens, title, body, data } = req.body;

    if (!fcmTokens || !Array.isArray(fcmTokens) || fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'FCM tokens array is required'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const result = await sendMulticastNotification(
      fcmTokens,
      { title, body },
      data || {}
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Notification sent to ${result.successCount}/${fcmTokens.length} devices`,
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send notifications',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/send-to-worker/:workerId
 * @desc    Send notification to a specific worker
 * @access  Private (Admin)
 */
router.post('/send-to-worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const result = await sendNotificationToWorker(
      workerId,
      { title, body },
      data || {}
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Notification sent to worker',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to send notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending notification to worker:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/send-to-workers
 * @desc    Send notification to multiple workers based on criteria
 * @access  Private (Admin)
 */
router.post('/send-to-workers', async (req, res) => {
  try {
    const { criteria, title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const result = await sendNotificationToWorkers(
      criteria || {},
      { title, body },
      data || {}
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Notification sent to ${result.successCount} workers`,
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to send notifications',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending notifications to workers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Test notification endpoint
 * @access  Public (for testing)
 */
router.post('/test', async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    const result = await sendNotification(
      fcmToken,
      {
        title: '🎉 Test Notification',
        body: 'This is a test notification from PaasoWork backend!'
      },
      {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/notifications/templates
 * @desc    Get available notification templates
 * @access  Public
 */
router.get('/templates', (req, res) => {
  res.status(200).json({
    success: true,
    templates: {
      WELCOME: 'Welcome message for new workers',
      PROFILE_APPROVED: 'Profile approval notification',
      PROFILE_REJECTED: 'Profile rejection notification',
      NEW_JOB_REQUEST: 'New job request notification',
      PAYMENT_RECEIVED: 'Payment received notification',
      SUBSCRIPTION_EXPIRING: 'Subscription expiry warning',
      PROFILE_UNLOCKED: 'Profile unlock notification'
    }
  });
});

export default router;
