/**
 * Notification Helper Functions
 * 
 * यह file notification भेजने के लिए helper functions provide करती है
 */

import { sendPushNotification } from '../config/firebase.js';
import Worker from '../models/Worker.js';

/**
 * Send OTP notification to worker
 */
export const sendOTPNotification = async (mobile, otp) => {
  try {
    console.log('📤 Sending OTP notification to:', mobile);
    
    const worker = await Worker.findOne({ mobile });
    
    if (!worker || !worker.fcmToken) {
      console.log('💡 Worker not found or no FCM token');
      return { success: false, message: 'No FCM token available' };
    }
    
    await sendPushNotification(
      worker.fcmToken,
      {
        title: 'PaasoWork - आपका OTP',
        body: `आपका OTP है: ${otp}\nयह 5 मिनट में expire हो जाएगा।`
      },
      {
        type: 'otp',
        otp: otp,
        mobile: mobile,
        expiresIn: '300'
      }
    );
    
    console.log('✅ OTP notification sent successfully');
    return { success: true, message: 'OTP notification sent' };
  } catch (error) {
    console.error('❌ Failed to send OTP notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send registration success notification
 */
export const sendRegistrationNotification = async (workerId, workerName, fcmToken) => {
  try {
    console.log('📤 Sending registration notification to:', workerName);
    
    if (!fcmToken) {
      console.log('💡 No FCM token provided');
      return { success: false, message: 'No FCM token' };
    }
    
    await sendPushNotification(
      fcmToken,
      {
        title: 'PaasoWork में आपका स्वागत है! 🎉',
        body: `${workerName}, आपका registration सफलतापूर्वक submit हो गया है। Admin approval के बाद आप काम शुरू कर सकते हैं।`
      },
      {
        type: 'registration_success',
        workerId: workerId.toString(),
        status: 'Pending'
      }
    );
    
    console.log('✅ Registration notification sent successfully');
    return { success: true, message: 'Registration notification sent' };
  } catch (error) {
    console.error('❌ Failed to send registration notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send profile update notification
 */
export const sendProfileUpdateNotification = async (workerId, updateType = 'profile') => {
  try {
    console.log('📤 Sending profile update notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker || !worker.fcmToken) {
      console.log('💡 Worker not found or no FCM token');
      return { success: false, message: 'No FCM token available' };
    }
    
    let title = 'Profile Updated';
    let body = 'आपकी profile successfully update हो गई है।';
    
    if (updateType === 'kyc') {
      title = 'KYC Documents Submitted';
      body = 'आपके KYC documents successfully submit हो गए हैं। Admin verification pending है।';
    } else if (updateType === 'availability') {
      title = 'Availability Updated';
      body = `आपकी availability status अब "${worker.availability}" है।`;
    }
    
    await sendPushNotification(
      worker.fcmToken,
      {
        title: title,
        body: body
      },
      {
        type: 'profile_update',
        updateType: updateType,
        workerId: workerId.toString()
      }
    );
    
    console.log('✅ Profile update notification sent successfully');
    return { success: true, message: 'Profile update notification sent' };
  } catch (error) {
    console.error('❌ Failed to send profile update notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send approval notification
 */
export const sendApprovalNotification = async (workerId) => {
  try {
    console.log('📤 Sending approval notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker || !worker.fcmToken) {
      console.log('💡 Worker not found or no FCM token');
      return { success: false, message: 'No FCM token available' };
    }
    
    await sendPushNotification(
      worker.fcmToken,
      {
        title: 'Account Approved! ✅',
        body: `बधाई हो ${worker.name}! आपका account approve हो गया है। अब आप PaasoWork पर काम शुरू कर सकते हैं।`
      },
      {
        type: 'account_approved',
        workerId: workerId.toString(),
        status: 'Approved'
      }
    );
    
    console.log('✅ Approval notification sent successfully');
    return { success: true, message: 'Approval notification sent' };
  } catch (error) {
    console.error('❌ Failed to send approval notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send rejection notification
 */
export const sendRejectionNotification = async (workerId, reason = '') => {
  try {
    console.log('📤 Sending rejection notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker || !worker.fcmToken) {
      console.log('💡 Worker not found or no FCM token');
      return { success: false, message: 'No FCM token available' };
    }
    
    const body = reason 
      ? `आपका account reject हो गया है। कारण: ${reason}. अधिक जानकारी के लिए support से संपर्क करें।`
      : 'आपका account reject हो गया है। अधिक जानकारी के लिए support से संपर्क करें।';
    
    await sendPushNotification(
      worker.fcmToken,
      {
        title: 'Account Rejected',
        body: body
      },
      {
        type: 'account_rejected',
        workerId: workerId.toString(),
        status: 'Rejected',
        reason: reason
      }
    );
    
    console.log('✅ Rejection notification sent successfully');
    return { success: true, message: 'Rejection notification sent' };
  } catch (error) {
    console.error('❌ Failed to send rejection notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Send generic notification to worker
 */
export const sendWorkerNotification = async (workerId, title, body, data = {}) => {
  try {
    console.log('📤 Sending notification to worker:', workerId);
    
    const worker = await Worker.findById(workerId);
    
    if (!worker || !worker.fcmToken) {
      console.log('💡 Worker not found or no FCM token');
      return { success: false, message: 'No FCM token available' };
    }
    
    await sendPushNotification(
      worker.fcmToken,
      {
        title: title,
        body: body
      },
      {
        ...data,
        workerId: workerId.toString()
      }
    );
    
    console.log('✅ Notification sent successfully');
    return { success: true, message: 'Notification sent' };
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
    return { success: false, message: error.message };
  }
};

export default {
  sendOTPNotification,
  sendRegistrationNotification,
  sendProfileUpdateNotification,
  sendApprovalNotification,
  sendRejectionNotification,
  sendWorkerNotification
};
