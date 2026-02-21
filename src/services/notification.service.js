import { getFirebaseAdmin, sendNotificationToDevice, sendNotificationToMultipleDevices } from '../config/firebase.js';

/**
 * Send push notification to a single device
 */
export const sendNotification = async (fcmToken, notification, data = {}) => {
  try {
    return await sendNotificationToDevice(fcmToken, notification, data);
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to multiple devices
 */
export const sendMulticastNotification = async (fcmTokens, notification, data = {}) => {
  try {
    return await sendNotificationToMultipleDevices(fcmTokens, notification, data);
  } catch (error) {
    console.error('❌ Failed to send multicast notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to a worker by ID
 */
export const sendNotificationToWorker = async (workerId, notification, data = {}) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(workerId).select('fcmToken notificationPreferences');
    
    if (!worker) {
      console.log('❌ Worker not found');
      return { success: false, error: 'Worker not found' };
    }

    if (!worker.fcmToken) {
      console.log('⚠️ Worker has no FCM token');
      return { success: false, error: 'No FCM token registered' };
    }

    // Check notification preferences
    if (!worker.notificationPreferences?.pushEnabled) {
      console.log('⚠️ Push notifications disabled for this worker');
      return { success: false, error: 'Push notifications disabled' };
    }

    return await sendNotification(worker.fcmToken, notification, data);
  } catch (error) {
    console.error('❌ Failed to send notification to worker:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to all workers with specific criteria
 */
export const sendNotificationToWorkers = async (criteria, notification, data = {}) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const workers = await Worker.find({
      ...criteria,
      fcmToken: { $exists: true, $ne: null },
      'notificationPreferences.pushEnabled': true
    }).select('fcmToken');
    
    if (workers.length === 0) {
      console.log('⚠️ No workers found matching criteria');
      return { success: false, error: 'No workers found' };
    }

    const fcmTokens = workers.map(w => w.fcmToken);
    return await sendMulticastNotification(fcmTokens, notification, data);
  } catch (error) {
    console.error('❌ Failed to send notification to workers:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Notification templates
 */
export const NotificationTemplates = {
  WELCOME: (name) => ({
    title: 'Welcome to PaasoWork! 🎉',
    body: `Hi ${name}, your profile is under review. We'll notify you once approved.`
  }),
  
  PROFILE_APPROVED: (name) => ({
    title: 'Profile Approved! ✅',
    body: `Congratulations ${name}! Your profile has been approved. Start receiving job requests now.`
  }),
  
  PROFILE_REJECTED: (name, reason) => ({
    title: 'Profile Update Required',
    body: `Hi ${name}, your profile needs attention. Reason: ${reason}`
  }),
  
  NEW_JOB_REQUEST: (jobTitle) => ({
    title: 'New Job Request! 💼',
    body: `You have a new job request for ${jobTitle}. Check it out now!`
  }),
  
  PAYMENT_RECEIVED: (amount) => ({
    title: 'Payment Received! 💰',
    body: `You received ₹${amount}. Check your wallet for details.`
  }),
  
  SUBSCRIPTION_EXPIRING: (daysLeft) => ({
    title: 'Subscription Expiring Soon ⏰',
    body: `Your subscription expires in ${daysLeft} days. Renew now to continue enjoying premium features.`
  }),
  
  PROFILE_UNLOCKED: (customerName) => ({
    title: 'Profile Unlocked! 🔓',
    body: `${customerName} unlocked your profile. They might contact you soon!`
  })
};
