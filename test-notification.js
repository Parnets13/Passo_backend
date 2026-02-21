import { initializeFirebase, sendNotificationToDevice } from './src/config/firebase.js';

/**
 * Test Firebase notification
 * Usage: node test-notification.js <FCM_TOKEN>
 */

const testNotification = async () => {
  try {
    // Get FCM token from command line argument
    const fcmToken = process.argv[2];

    if (!fcmToken) {
      console.error('❌ Please provide FCM token as argument');
      console.log('Usage: node test-notification.js <FCM_TOKEN>');
      process.exit(1);
    }

    console.log('🚀 Testing Firebase notification...\n');

    // Initialize Firebase
    console.log('[1/3] Initializing Firebase Admin SDK...');
    initializeFirebase();
    console.log('✅ Firebase initialized\n');

    // Send test notification
    console.log('[2/3] Sending test notification...');
    console.log('Token:', fcmToken.substring(0, 30) + '...\n');

    const result = await sendNotificationToDevice(
      fcmToken,
      {
        title: '🎉 Test Notification',
        body: 'This is a test notification from PaasoWork backend!'
      },
      {
        type: 'test',
        timestamp: new Date().toISOString(),
        message: 'If you see this, Firebase is working perfectly!'
      }
    );

    console.log('[3/3] Result:');
    if (result.success) {
      console.log('✅ Notification sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('\n🎉 Firebase is working perfectly!');
      console.log('Check your device for the notification.');
    } else {
      console.log('❌ Failed to send notification');
      console.log('Error:', result.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. firebase-service-account.json not found');
    console.error('2. Invalid FCM token');
    console.error('3. Firebase project configuration issue');
    process.exit(1);
  }
};

testNotification();
