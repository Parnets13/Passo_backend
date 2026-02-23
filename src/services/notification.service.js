import { sendNotificationToDevice, sendNotificationToMultipleDevices } from '../config/firebase.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';

/**
 * Send push notification to a single worker
 */
export const sendPushToWorker = async (workerId, notification, data = {}) => {
  try {
    console.log('📤 Sending push notification to worker:', workerId);
    
    // Get worker's FCM token
    const worker = await Worker.findById(workerId).select('fcmToken name');
    
    if (!worker) {
      throw new Error('Worker not found');
    }
    
    if (!worker.fcmToken) {
      console.warn('⚠️ Worker has no FCM token registered');
      return { success: false, reason: 'no_token' };
    }
    
    console.log('   Worker:', worker.name);
    console.log('   Token preview:', worker.fcmToken.substring(0, 30) + '...');
    
    // Send notification
    const result = await sendNotificationToDevice(
      worker.fcmToken,
      {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      {
        ...data,
        workerId: workerId.toString(),
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('✅ Push notification sent successfully');
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    
    // Handle invalid token errors
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      console.log('🗑️ Removing invalid FCM token from worker');
      await Worker.findByIdAndUpdate(workerId, { 
        fcmToken: null,
        lastTokenUpdate: null 
      });
    }
    
    throw error;
  }
};

/**
 * Send push notification to multiple workers
 */
export const sendPushToMultipleWorkers = async (workerIds, notification, data = {}) => {
  try {
    console.log(`📤 Sending push notification to ${workerIds.length} workers`);
    
    // Get workers' FCM tokens
    const workers = await Worker.find({
      _id: { $in: workerIds },
      fcmToken: { $ne: null, $exists: true }
    }).select('fcmToken name');
    
    if (workers.length === 0) {
      console.warn('⚠️ No workers with FCM tokens found');
      return { success: false, reason: 'no_tokens' };
    }
    
    console.log(`   Found ${workers.length} workers with FCM tokens`);
    
    const fcmTokens = workers.map(w => w.fcmToken);
    
    // Send notification
    const result = await sendNotificationToMultipleDevices(
      fcmTokens,
      {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      {
        ...data,
        timestamp: new Date().toISOString()
      }
    );
    
    console.log(`✅ Push notifications sent: ${result.successCount}/${fcmTokens.length}`);
    
    // Handle failed tokens
    if (result.failureCount > 0) {
      console.log('🗑️ Cleaning up invalid tokens...');
      result.responses.forEach(async (resp, idx) => {
        if (!resp.success && 
            (resp.error?.code === 'messaging/invalid-registration-token' ||
             resp.error?.code === 'messaging/registration-token-not-registered')) {
          const worker = workers[idx];
          await Worker.findByIdAndUpdate(worker._id, { 
            fcmToken: null,
            lastTokenUpdate: null 
          });
          console.log(`   Removed invalid token for worker: ${worker.name}`);
        }
      });
    }
    
    return {
      success: true,
      successCount: result.successCount,
      failureCount: result.failureCount
    };
    
  } catch (error) {
    console.error('❌ Failed to send push notifications:', error);
    throw error;
  }
};

/**
 * Send notification based on target audience
 */
export const sendNotificationByAudience = async (notificationId) => {
  try {
    console.log('📤 Sending notification by audience:', notificationId);
    
    // Get notification details
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    console.log('   Target audience:', notification.targetAudience);
    
    let workerIds = [];
    
    // Determine target workers based on audience
    switch (notification.targetAudience) {
      case 'All':
        // Get all workers with FCM tokens
        const allWorkers = await Worker.find({
          fcmToken: { $ne: null, $exists: true },
          status: 'Approved'
        }).select('_id');
        workerIds = allWorkers.map(w => w._id);
        break;
        
      case 'City':
        // Get workers in specific cities
        const cityWorkers = await Worker.find({
          city: { $in: notification.cities },
          fcmToken: { $ne: null, $exists: true },
          status: 'Approved'
        }).select('_id');
        workerIds = cityWorkers.map(w => w._id);
        break;
        
      case 'Category':
        // Get workers in specific categories
        const categoryWorkers = await Worker.find({
          category: { $in: notification.categories },
          fcmToken: { $ne: null, $exists: true },
          status: 'Approved'
        }).select('_id');
        workerIds = categoryWorkers.map(w => w._id);
        break;
        
      case 'Custom':
        // Use specific user IDs
        workerIds = notification.userIds;
        break;
        
      default:
        throw new Error('Invalid target audience');
    }
    
    console.log(`   Target workers: ${workerIds.length}`);
    
    if (workerIds.length === 0) {
      console.warn('⚠️ No target workers found');
      await Notification.findByIdAndUpdate(notificationId, {
        status: 'Sent',
        sentAt: new Date(),
        totalRecipients: 0,
        deliveredCount: 0
      });
      return { success: true, sent: 0 };
    }
    
    // Send notification
    const result = await sendPushToMultipleWorkers(
      workerIds,
      {
        title: notification.title,
        body: notification.message,
        imageUrl: notification.bannerImage
      },
      {
        notificationId: notificationId.toString(),
        type: notification.type,
        bannerLink: notification.bannerLink
      }
    );
    
    // Update notification status
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'Sent',
      sentAt: new Date(),
      totalRecipients: workerIds.length,
      deliveredCount: result.successCount
    });
    
    console.log('✅ Notification sent successfully');
    return {
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
      total: workerIds.length
    };
    
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    
    // Update notification status to failed
    await Notification.findByIdAndUpdate(notificationId, {
      status: 'Failed'
    });
    
    throw error;
  }
};

/**
 * Send test notification to a specific worker
 */
export const sendTestNotification = async (workerId) => {
  try {
    console.log('🧪 Sending test notification to worker:', workerId);
    
    const result = await sendPushToWorker(
      workerId,
      {
        title: '🧪 Test Notification',
        body: 'This is a test notification from PaasoWork. If you see this, push notifications are working!'
      },
      {
        type: 'test',
        test: 'true'
      }
    );
    
    console.log('✅ Test notification sent');
    return result;
    
  } catch (error) {
    console.error('❌ Failed to send test notification:', error);
    throw error;
  }
};

export default {
  sendPushToWorker,
  sendPushToMultipleWorkers,
  sendNotificationByAudience,
  sendTestNotification
};
