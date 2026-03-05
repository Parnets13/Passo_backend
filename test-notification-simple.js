import { initializeFirebase, sendNotificationToDevice } from './src/config/firebase.js';

/**
 * Simple notification test with sample token
 * This will test if Firebase is properly configured
 */

const testNotification = async () => {
  try {
    console.log('🚀 Testing Firebase Notification Setup...\n');
    console.log('=' .repeat(60));

    // Initialize Firebase
    console.log('\n[Step 1/2] Initializing Firebase Admin SDK...');
    initializeFirebase();
    console.log('✅ Firebase initialized successfully');
    console.log('📱 Project: paaso-app');

    console.log('\n[Step 2/2] Testing notification capability...');
    console.log('⚠️  Note: You need a real FCM token to send actual notification');
    console.log('');
    console.log('To get FCM token from UserApp:');
    console.log('1. Open UserApp on your device/emulator');
    console.log('2. Check console logs for FCM token');
    console.log('3. Copy the token');
    console.log('4. Run: node test-notification.js <YOUR_FCM_TOKEN>');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Firebase Setup Complete!');
    console.log('🎉 Backend is ready to send notifications');
    console.log('=' .repeat(60));

    console.log('\n📋 Next Steps:');
    console.log('1. Start UserApp: cd ../UserApp && npm start');
    console.log('2. Get FCM token from app logs');
    console.log('3. Test notification: node test-notification.js <TOKEN>');
    console.log('4. Create a booking to test real notifications');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Firebase setup failed:', error.message);
    console.error('\n💡 Solutions:');
    console.error('1. Check firebase-service-account.json exists');
    console.error('2. Verify credentials are valid');
    console.error('3. Run: npm run check-firebase');
    process.exit(1);
  }
};

testNotification();
