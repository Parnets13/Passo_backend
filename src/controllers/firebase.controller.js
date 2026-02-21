import { 
  sendPushNotification, 
  sendMulticastNotification, 
  sendTopicNotification 
} from '../config/firebase.js';
import Worker from '../models/Worker.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Send notification to single user
 */
export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body, data, imageUrl } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and body are required'
      });
    }

    // Find user and get FCM token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'User does not have FCM token registered'
      });
    }

    // Send notification
    const result = await sendPushNotification(
      user.fcmToken,
      { title, body, imageUrl },
      data || {}
    );

    // Save notification to database
    await Notification.create({
      userId,
      title,
      body,
      data,
      imageUrl,
      sentAt: new Date(),
      status: 'sent'
    });

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Send notification to worker
 */
export const sendNotificationToWorker = async (req, res) => {
  try {
    const { workerId, title, body, data, imageUrl } = req.body;

    if (!workerId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'workerId, title, and body are required'
      });
    }

    // Find worker and get FCM token
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    if (!worker.fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Worker does not have FCM token registered'
      });
    }

    // Send notification
    const result = await sendPushNotification(
      worker.fcmToken,
      { title, body, imageUrl },
      data || {}
    );

    // Save notification to database
    await Notification.create({
      workerId,
      title,
      body,
      data,
      imageUrl,
      sentAt: new Date(),
      status: 'sent'
    });

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotification = async (req, res) => {
  try {
    const { userIds, title, body, data, imageUrl } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'title and body are required'
      });
    }

    // Find users and get FCM tokens
    const users = await User.find({ _id: { $in: userIds } });
    const fcmTokens = users
      .filter(user => user.fcmToken)
      .map(user => user.fcmToken);

    if (fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid FCM tokens found for the provided users'
      });
    }

    // Send notifications
    const result = await sendMulticastNotification(
      fcmTokens,
      { title, body, imageUrl },
      data || {}
    );

    // Save notifications to database
    const notifications = userIds.map(userId => ({
      userId,
      title,
      body,
      data,
      imageUrl,
      sentAt: new Date(),
      status: 'sent'
    }));
    await Notification.insertMany(notifications);

    res.status(200).json({
      success: true,
      message: 'Bulk notifications sent',
      data: {
        totalUsers: userIds.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notification',
      error: error.message
    });
  }
};

/**
 * Send notification to all workers of specific type
 */
export const sendNotificationToWorkerType = async (req, res) => {
  try {
    const { workerType, title, body, data, imageUrl } = req.body;

    if (!workerType || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'workerType, title, and body are required'
      });
    }

    // Find all workers of this type
    const workers = await Worker.find({ workerType, isActive: true });
    const fcmTokens = workers
      .filter(worker => worker.fcmToken)
      .map(worker => worker.fcmToken);

    if (fcmTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No active workers found with type: ${workerType}`
      });
    }

    // Send notifications
    const result = await sendMulticastNotification(
      fcmTokens,
      { title, body, imageUrl },
      data || {}
    );

    res.status(200).json({
      success: true,
      message: `Notifications sent to ${workerType} workers`,
      data: {
        totalWorkers: workers.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });
  } catch (error) {
    console.error('Error sending notification to worker type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Send notification to topic
 */
export const sendNotificationToTopic = async (req, res) => {
  try {
    const { topic, title, body, data, imageUrl } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'topic, title, and body are required'
      });
    }

    const result = await sendTopicNotification(
      topic,
      { title, body, imageUrl },
      data || {}
    );

    res.status(200).json({
      success: true,
      message: 'Topic notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending topic notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send topic notification',
      error: error.message
    });
  }
};

/**
 * Test notification endpoint
 */
export const sendTestNotification = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'fcmToken is required'
      });
    }

    const result = await sendPushNotification(
      fcmToken,
      {
        title: '🎉 Test Notification',
        body: 'Firebase Admin SDK is working perfectly!'
      },
      { type: 'test', timestamp: new Date().toISOString() }
    );

    res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
};

export default {
  sendNotificationToUser,
  sendNotificationToWorker,
  sendBulkNotification,
  sendNotificationToWorkerType,
  sendNotificationToTopic,
  sendTestNotification
};
