import { sendNotificationToDevice, sendNotificationToMultipleDevices } from '../config/firebase.js';
import FCMToken from '../models/FCMToken.js';
import Worker from '../models/Worker.js';

/**
 * Send notification to a single worker by ID
 */
export const sendNotificationToWorker = async (workerId, notification, data = {}) => {
  try {
    console.log('📤 Sending notification to worker:', workerId);
    console.log('   Title:', notification.title);
    console.log('   Body:', notification.body);
    
    // Get worker's active FCM tokens
    const tokens = await FCMToken.find({
      worker: workerId,
      isActive: true
    });
    
    if (tokens.length === 0) {
      console.log('⚠️ No active FCM tokens found for worker');
      return {
        success: false,
        reason: 'No active FCM tokens'
      };
    }
    
    console.log(`📱 Found ${tokens.length} active token(s)`);
    
    // Send to all active tokens
    const results = [];
    for (const tokenDoc of tokens) {
      try {
        const result = await sendNotificationToDevice(
          tokenDoc.token,
          notification,
          data
        );
        
        // Mark token as successful
        await tokenDoc.markAsSuccessful();
        
        results.push({
          success: true,
          messageId: result.messageId
        });
        
        console.log('✅ Notification sent successfully to token');
      } catch (error) {
        console.error('❌ Failed to send to token:', error.message);
        
        // Mark token as failed
        await tokenDoc.markAsFailed();
        
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    // Return success if at least one notification was sent
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      sent: successCount,
      failed: results.length - successCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Send notification to worker error:', error);
    throw error;
  }
};

/**
 * Send notification to multiple workers
 */
export const sendNotificationToWorkers = async (workerIds, notification, data = {}) => {
  try {
    console.log(`📤 Sending notification to ${workerIds.length} workers`);
    console.log('   Title:', notification.title);
    console.log('   Body:', notification.body);
    
    // Get all active FCM tokens for these workers
    const tokens = await FCMToken.find({
      worker: { $in: workerIds },
      isActive: true
    });
    
    if (tokens.length === 0) {
      console.log('⚠️ No active FCM tokens found');
      return {
        success: false,
        sent: 0,
        failed: 0,
        reason: 'No active FCM tokens'
      };
    }
    
    console.log(`📱 Found ${tokens.length} active token(s)`);
    
    // Extract token strings
    const fcmTokens = tokens.map(t => t.token);
    
    // Send multicast notification
    const result = await sendNotificationToMultipleDevices(
      fcmTokens,
      notification,
      data
    );
    
    // Update token statuses based on results
    if (result.responses) {
      for (let i = 0; i < result.responses.length; i++) {
        const response = result.responses[i];
        const tokenDoc = tokens[i];
        
        if (response.success) {
          await tokenDoc.markAsSuccessful();
        } else {
          await tokenDoc.markAsFailed();
        }
      }
    }
    
    console.log(`✅ Notification sent to ${result.successCount}/${tokens.length} devices`);
    
    return {
      success: result.successCount > 0,
      sent: result.successCount,
      failed: result.failureCount,
      total: tokens.length
    };
    
  } catch (error) {
    console.error('❌ Send notification to workers error:', error);
    throw error;
  }
};

/**
 * Send notification based on target audience
 */
export const sendNotificationByAudience = async (notificationId) => {
  try {
    console.log('📤 Sending notification by audience:', notificationId);
    
    // Import Notification model dynamically to avoid circular dependency
    const Notification = (await import('../models/Notification.js')).default;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    console.log('   Target Audience:', notification.targetAudience);
    console.log('   Title:', notification.title);
    console.log('   Message:', notification.message);
    
    let workerIds = [];
    
    // Determine target workers based on audience
    if (notification.targetAudience === 'All') {
      // Get all approved workers
      const workers = await Worker.find({ status: 'Approved' }).select('_id');
      workerIds = workers.map(w => w._id);
      console.log(`   Targeting all ${workerIds.length} approved workers`);
      
    } else if (notification.targetAudience === 'Specific') {
      // Use specific user IDs
      workerIds = notification.userIds || [];
      console.log(`   Targeting ${workerIds.length} specific workers`);
      
    } else if (notification.targetAudience === 'City') {
      // Filter by cities
      const workers = await Worker.find({
        status: 'Approved',
        city: { $in: notification.cities || [] }
      }).select('_id');
      workerIds = workers.map(w => w._id);
      console.log(`   Targeting ${workerIds.length} workers in cities:`, notification.cities);
      
    } else if (notification.targetAudience === 'Category') {
      // Filter by categories
      const workers = await Worker.find({
        status: 'Approved',
        category: { $in: notification.categories || [] }
      }).select('_id');
      workerIds = workers.map(w => w._id);
      console.log(`   Targeting ${workerIds.length} workers in categories:`, notification.categories);
    }
    
    if (workerIds.length === 0) {
      console.log('⚠️ No workers found for target audience');
      
      // Update notification status
      notification.status = 'Sent';
      notification.sentAt = new Date();
      notification.sentCount = 0;
      await notification.save();
      
      return {
        success: false,
        sent: 0,
        reason: 'No workers found for target audience'
      };
    }
    
    // Prepare notification payload
    const notificationPayload = {
      title: notification.title,
      body: notification.message,
      imageUrl: notification.bannerImage || undefined
    };
    
    // Prepare data payload
    const dataPayload = {
      notificationId: notification._id.toString(),
      type: notification.type,
      bannerPosition: notification.bannerPosition || '',
      bannerLink: notification.bannerLink || '',
      timestamp: new Date().toISOString()
    };
    
    // Send notification to all target workers
    const result = await sendNotificationToWorkers(
      workerIds,
      notificationPayload,
      dataPayload
    );
    
    // Update notification status
    notification.status = 'Sent';
    notification.sentAt = new Date();
    notification.sentCount = result.sent || 0;
    notification.failedCount = result.failed || 0;
    await notification.save();
    
    console.log(`✅ Notification sent successfully`);
    console.log(`   Sent: ${result.sent}`);
    console.log(`   Failed: ${result.failed}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Send notification by audience error:', error);
    throw error;
  }
};

/**
 * Send test notification to a worker
 */
export const sendTestNotification = async (workerId) => {
  try {
    console.log('🧪 Sending test notification to worker:', workerId);
    
    const notification = {
      title: '🎉 Test Notification',
      body: 'This is a test notification from PaasoWork Admin Panel. If you received this, your FCM setup is working correctly!'
    };
    
    const data = {
      type: 'test',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendNotificationToWorker(workerId, notification, data);
    
    if (result.success) {
      console.log('✅ Test notification sent successfully');
    } else {
      console.log('❌ Test notification failed:', result.reason);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Send test notification error:', error);
    throw error;
  }
};

/**
 * Send welcome notification to new worker
 */
export const sendWelcomeNotification = async (workerId) => {
  try {
    console.log('👋 Sending welcome notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker) {
      throw new Error('Worker not found');
    }
    
    const notification = {
      title: `Welcome to PaasoWork, ${worker.name}! 🎉`,
      body: 'Your account has been approved. Start exploring job opportunities and grow your business with us!'
    };
    
    const data = {
      type: 'welcome',
      screen: 'Dashboard',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendNotificationToWorker(workerId, notification, data);
    
    console.log('✅ Welcome notification sent');
    
    return result;
    
  } catch (error) {
    console.error('❌ Send welcome notification error:', error);
    throw error;
  }
};

/**
 * Send approval notification to worker
 */
export const sendApprovalNotification = async (workerId) => {
  try {
    console.log('✅ Sending approval notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker) {
      throw new Error('Worker not found');
    }
    
    const notification = {
      title: '✅ Account Approved!',
      body: `Congratulations ${worker.name}! Your PaasoWork account has been approved. You can now start receiving job opportunities.`
    };
    
    const data = {
      type: 'approval',
      screen: 'Dashboard',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendNotificationToWorker(workerId, notification, data);
    
    console.log('✅ Approval notification sent');
    
    return result;
    
  } catch (error) {
    console.error('❌ Send approval notification error:', error);
    throw error;
  }
};

/**
 * Send rejection notification to worker
 */
export const sendRejectionNotification = async (workerId, reason = '') => {
  try {
    console.log('❌ Sending rejection notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker) {
      throw new Error('Worker not found');
    }
    
    const notification = {
      title: 'Application Update',
      body: reason || 'Your application has been reviewed. Please contact support for more information.'
    };
    
    const data = {
      type: 'rejection',
      screen: 'Support',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendNotificationToWorker(workerId, notification, data);
    
    console.log('✅ Rejection notification sent');
    
    return result;
    
  } catch (error) {
    console.error('❌ Send rejection notification error:', error);
    throw error;
  }
};

/**
 * Send job alert notification
 */
export const sendJobAlertNotification = async (workerIds, jobDetails) => {
  try {
    console.log(`💼 Sending job alert to ${workerIds.length} workers`);
    
    const notification = {
      title: '💼 New Job Alert!',
      body: jobDetails.title || 'A new job matching your profile is available. Check it out now!'
    };
    
    const data = {
      type: 'job_alert',
      job_id: jobDetails.id || '',
      screen: 'JobDetails',
      timestamp: new Date().toISOString()
    };
    
    const result = await sendNotificationToWorkers(workerIds, notification, data);
    
    console.log('✅ Job alert sent');
    
    return result;
    
  } catch (error) {
    console.error('❌ Send job alert error:', error);
    throw error;
  }
};

export default {
  sendNotificationToWorker,
  sendNotificationToWorkers,
  sendNotificationByAudience,
  sendTestNotification,
  sendWelcomeNotification,
  sendApprovalNotification,
  sendRejectionNotification,
  sendJobAlertNotification
};
