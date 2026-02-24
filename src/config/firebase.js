import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = () => {
  try {
    if (firebaseInitialized) {
      console.log('✅ Firebase Admin already initialized');
      return admin;
    }

    let serviceAccount;

    // Try to load from environment variable first (for Render deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('📱 Loading Firebase credentials from environment variable');
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      // Fallback to file (for local development)
      console.log('📱 Loading Firebase credentials from file');
      const serviceAccountPath = join(__dirname, '../../firebase-service-account.json');
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📱 Project ID: ${serviceAccount.project_id}`);
    
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.error('💡 Set FIREBASE_SERVICE_ACCOUNT env variable or add firebase-service-account.json file');
    throw error;
  }
};

/**
 * Get Firebase Admin instance
 */
export const getFirebaseAdmin = () => {
  if (!firebaseInitialized) {
    throw new Error('Firebase Admin not initialized. Call initializeFirebase() first.');
  }
  return admin;
};

/**
 * Send push notification to a single device
 */
export const sendPushNotification = async (fcmToken, notification, data = {}) => {
  return sendNotificationToDevice(fcmToken, notification, data);
};

export const sendNotificationToDevice = async (fcmToken, notification, data = {}) => {
  try {
    console.log('📤 Preparing to send notification...');
    console.log('   Token preview:', fcmToken.substring(0, 30) + '...');
    console.log('   Title:', notification.title);
    console.log('   Body:', notification.body);
    
    const message = {
      token: fcmToken,
      // CRITICAL: Both notification and data payloads are required
      // notification: Shows notification when app is in background/terminated
      // data: Allows custom handling when app is in foreground
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        // Convert all data values to strings (FCM requirement)
        title: notification.title,
        body: notification.body,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'paaso_default_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    // Convert all data values to strings
    Object.keys(message.data).forEach(key => {
      if (typeof message.data[key] !== 'string') {
        message.data[key] = String(message.data[key]);
      }
    });

    console.log('📨 Sending message via Firebase Admin SDK...');
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully');
    console.log('   Message ID:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    throw error;
  }
};

/**
 * Send push notification to multiple devices
 */
export const sendMulticastNotification = async (fcmTokens, notification, data = {}) => {
  return sendNotificationToMultipleDevices(fcmTokens, notification, data);
};

export const sendNotificationToMultipleDevices = async (fcmTokens, notification, data = {}) => {
  try {
    console.log(`📤 Sending push notification to ${fcmTokens.length} workers`);
    
    const message = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        // Add title and body to data payload for foreground handling
        title: notification.title,
        body: notification.body,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'paaso_default_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    // CRITICAL: Convert all data values to strings (FCM requirement)
    Object.keys(message.data).forEach(key => {
      if (typeof message.data[key] !== 'string') {
        message.data[key] = String(message.data[key]);
      }
    });

    console.log('📨 Sending multicast message via Firebase Admin SDK...');
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notifications sent: ${response.successCount}/${fcmTokens.length}`);
    
    if (response.failureCount > 0) {
      console.warn(`⚠️ Failed to send ${response.failureCount} notifications`);
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed for token ${idx}:`, resp.error);
        }
      });
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('❌ Failed to send notifications:', error);
    throw error;
  }
};

/**
 * Send notification to a topic
 */
export const sendTopicNotification = async (topic, notification, data = {}) => {
  return sendNotificationToTopic(topic, notification, data);
};

export const sendNotificationToTopic = async (topic, notification, data = {}) => {
  try {
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: {
        ...data,
        title: notification.title,
        body: notification.body,
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'paaso_default_channel',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    // Convert all data values to strings (FCM requirement)
    Object.keys(message.data).forEach(key => {
      if (typeof message.data[key] !== 'string') {
        message.data[key] = String(message.data[key]);
      }
    });

    const response = await admin.messaging().send(message);
    console.log('✅ Topic notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Failed to send topic notification:', error);
    throw error;
  }
};

/**
 * Subscribe device to topic
 */
export const subscribeToTopic = async (fcmTokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(fcmTokens, topic);
    console.log(`✅ Subscribed to topic ${topic}:`, response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to subscribe to topic:', error);
    throw error;
  }
};

/**
 * Unsubscribe device from topic
 */
export const unsubscribeFromTopic = async (fcmTokens, topic) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(fcmTokens, topic);
    console.log(`✅ Unsubscribed from topic ${topic}:`, response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Failed to unsubscribe from topic:', error);
    throw error;
  }
};

export default admin;
