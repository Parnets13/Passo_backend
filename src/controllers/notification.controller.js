import Notification from '../models/Notification.js';
import Worker from '../models/Worker.js';
import { sendNotificationToDevice, sendNotificationToMultipleDevices } from '../config/firebase.js';

/**
 * Send push notification to specific workers
 */
export const sendPushNotification = async (req, res) => {
  try {
    const { title, message, workerIds, data = {} } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    console.log('📤 Sending push notification:', title);
    console.log('   Target workers:', workerIds?.length || 'All');
    
    let workers;
    let targetAudience = 'All';
    
    if (workerIds && workerIds.length > 0) {
      // Send to specific workers
      workers = await Worker.find({ 
        _id: { $in: workerIds },
        fcmToken: { $exists: true, $ne: null }
      }).select('fcmToken name mobile');
      targetAudience = 'Custom';
    } else {
      // Send to all workers with FCM tokens
      workers = await Worker.find({ 
        fcmToken: { $exists: true, $ne: null },
        status: 'Approved'
      }).select('fcmToken name mobile');
    }
    
    if (workers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No workers found with FCM tokens'
      });
    }
    
    console.log(`✅ Found ${workers.length} workers with FCM tokens`);
    
    // Extract FCM tokens
    const fcmTokens = workers.map(w => w.fcmToken).filter(Boolean);
    
    if (fcmTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid FCM tokens found'
      });
    }
    
    // Create notification record
    const notification = await Notification.create({
      title,
      message,
      type: 'Push',
      targetAudience,
      userIds: workerIds || [],
      totalRecipients: fcmTokens.length,
      status: 'Sent',
      sentAt: new Date(),
      createdBy: req.admin?.id || req.user?.id || '000000000000000000000000' // Default admin ID
    });
    
    // Send notification via Firebase
    const notificationPayload = {
      title,
      body: message
    };
    
    const dataPayload = {
      notification_id: notification._id.toString(),
      timestamp: new Date().toISOString(),
      ...data
    };
    
    let result;
    if (fcmTokens.length === 1) {
      // Send to single device
      result = await sendNotificationToDevice(fcmTokens[0], notificationPayload, dataPayload);
      notification.deliveredCount = result.success ? 1 : 0;
    } else {
      // Send to multiple devices
      result = await sendNotificationToMultipleDevices(fcmTokens, notificationPayload, dataPayload);
      notification.deliveredCount = result.successCount || 0;
    }
    
    await notification.save();
    
    console.log(`✅ Notification sent to ${notification.deliveredCount}/${fcmTokens.length} devices`);
    
    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        totalRecipients: notification.totalRecipients,
        deliveredCount: notification.deliveredCount,
        sentAt: notification.sentAt
      }
    });
  } catch (error) {
    console.error('❌ Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

/**
 * Send notification to all workers
 */
export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, data = {} } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    console.log('📢 Broadcasting notification to all workers');
    
    // Get all approved workers with FCM tokens
    const workers = await Worker.find({ 
      fcmToken: { $exists: true, $ne: null },
      status: 'Approved'
    }).select('fcmToken');
    
    if (workers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No workers found with FCM tokens'
      });
    }
    
    const fcmTokens = workers.map(w => w.fcmToken).filter(Boolean);
    
    console.log(`✅ Broadcasting to ${fcmTokens.length} workers`);
    
    // Create notification record
    const notification = await Notification.create({
      title,
      message,
      type: 'Push',
      targetAudience: 'All',
      totalRecipients: fcmTokens.length,
      status: 'Sent',
      sentAt: new Date(),
      createdBy: req.admin?.id || req.user?.id || '000000000000000000000000'
    });
    
    // Send notification
    const notificationPayload = { title, body: message };
    const dataPayload = {
      notification_id: notification._id.toString(),
      timestamp: new Date().toISOString(),
      ...data
    };
    
    const result = await sendNotificationToMultipleDevices(fcmTokens, notificationPayload, dataPayload);
    
    notification.deliveredCount = result.successCount || 0;
    await notification.save();
    
    console.log(`✅ Broadcast sent to ${notification.deliveredCount}/${fcmTokens.length} devices`);
    
    res.status(200).json({
      success: true,
      message: 'Broadcast notification sent successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        totalRecipients: notification.totalRecipients,
        deliveredCount: notification.deliveredCount,
        sentAt: notification.sentAt
      }
    });
  } catch (error) {
    console.error('❌ Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast notification',
      error: error.message
    });
  }
};

/**
 * Get all notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Get notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};
