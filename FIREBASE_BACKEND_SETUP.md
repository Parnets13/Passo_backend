# Firebase Backend Setup - Complete Guide

## ✅ What's Been Set Up

### 1. Firebase Admin SDK Configuration
- ✅ `firebase-service-account.json` - Service account credentials
- ✅ `src/config/firebase.js` - Firebase initialization and helper functions
- ✅ Environment variables in `.env`

### 2. Notification Service
- ✅ `src/services/notification.service.js` - Notification business logic
- ✅ Send to single device
- ✅ Send to multiple devices
- ✅ Send to specific worker
- ✅ Send to workers by criteria
- ✅ Notification templates

### 3. API Routes
- ✅ `src/routes/notification.routes.js` - Notification endpoints
- ✅ Integrated in main routes

### 4. Test Script
- ✅ `test-notification.js` - Test Firebase setup

---

## 🚀 How to Use

### Start the Backend

```bash
cd Passo_backend
npm start
```

Expected output:
```
✅ Firebase Admin SDK initialized successfully
📱 Project ID: paaso-app
🚀 Server running in development mode on port 5000
```

---

## 📡 API Endpoints

### 1. Test Notification (Public)
```bash
POST http://localhost:5000/api/notifications/test
Content-Type: application/json

{
  "fcmToken": "YOUR_FCM_TOKEN_HERE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "success": true,
    "messageId": "projects/paaso-app/messages/..."
  }
}
```

### 2. Send Custom Notification
```bash
POST http://localhost:5000/api/notifications/send
Content-Type: application/json

{
  "fcmToken": "YOUR_FCM_TOKEN",
  "title": "Hello Worker!",
  "body": "You have a new job request",
  "data": {
    "type": "job_request",
    "jobId": "12345"
  }
}
```

### 3. Send to Multiple Devices
```bash
POST http://localhost:5000/api/notifications/send-multiple
Content-Type: application/json

{
  "fcmTokens": ["token1", "token2", "token3"],
  "title": "Important Update",
  "body": "New features available!",
  "data": {
    "type": "update"
  }
}
```

### 4. Send to Specific Worker
```bash
POST http://localhost:5000/api/notifications/send-to-worker/WORKER_ID
Content-Type: application/json

{
  "title": "Profile Approved!",
  "body": "Your profile has been approved",
  "data": {
    "type": "profile_approved"
  }
}
```

### 5. Send to Workers by Criteria
```bash
POST http://localhost:5000/api/notifications/send-to-workers
Content-Type: application/json

{
  "criteria": {
    "workerType": "plumber",
    "city": "Mumbai"
  },
  "title": "New Job Available",
  "body": "Check out new plumbing jobs in Mumbai",
  "data": {
    "type": "job_alert"
  }
}
```

### 6. Get Notification Templates
```bash
GET http://localhost:5000/api/notifications/templates
```

---

## 🧪 Testing

### Method 1: Using Test Script

```bash
cd Passo_backend
node test-notification.js YOUR_FCM_TOKEN
```

**Example:**
```bash
node test-notification.js fX7Y9Z2a3B4c5D6e7F8g9H0i1J2k3L4m5N6o7P8q9R0s1T2u3V4w5X6y7Z8a9B0c
```

### Method 2: Using cURL

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"YOUR_FCM_TOKEN"}'
```

### Method 3: Using Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:5000/api/notifications/test`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "fcmToken": "YOUR_FCM_TOKEN"
}
```
6. Send

---

## 📋 Available Functions

### In `src/config/firebase.js`:

```javascript
// Send to single device
await sendNotificationToDevice(fcmToken, notification, data);

// Send to multiple devices
await sendNotificationToMultipleDevices(fcmTokens, notification, data);

// Send to topic
await sendNotificationToTopic(topic, notification, data);

// Subscribe to topic
await subscribeToTopic(fcmTokens, topic);

// Unsubscribe from topic
await unsubscribeFromTopic(fcmTokens, topic);
```

### In `src/services/notification.service.js`:

```javascript
// Send notification
await sendNotification(fcmToken, notification, data);

// Send to multiple
await sendMulticastNotification(fcmTokens, notification, data);

// Send to worker by ID
await sendNotificationToWorker(workerId, notification, data);

// Send to workers by criteria
await sendNotificationToWorkers(criteria, notification, data);

// Use templates
const notification = NotificationTemplates.WELCOME('John');
const notification = NotificationTemplates.PROFILE_APPROVED('John');
const notification = NotificationTemplates.NEW_JOB_REQUEST('Plumber');
```

---

## 🎯 Notification Templates

### Available Templates:

1. **WELCOME** - Welcome message for new workers
```javascript
NotificationTemplates.WELCOME('John')
// Output: { title: 'Welcome to PaasoWork! 🎉', body: 'Hi John, your profile is under review...' }
```

2. **PROFILE_APPROVED** - Profile approval
```javascript
NotificationTemplates.PROFILE_APPROVED('John')
```

3. **PROFILE_REJECTED** - Profile rejection
```javascript
NotificationTemplates.PROFILE_REJECTED('John', 'Incomplete documents')
```

4. **NEW_JOB_REQUEST** - New job alert
```javascript
NotificationTemplates.NEW_JOB_REQUEST('Plumber')
```

5. **PAYMENT_RECEIVED** - Payment notification
```javascript
NotificationTemplates.PAYMENT_RECEIVED(500)
```

6. **SUBSCRIPTION_EXPIRING** - Subscription warning
```javascript
NotificationTemplates.SUBSCRIPTION_EXPIRING(3)
```

7. **PROFILE_UNLOCKED** - Profile unlock alert
```javascript
NotificationTemplates.PROFILE_UNLOCKED('Customer Name')
```

---

## 🔧 Integration Examples

### Example 1: Send Welcome Notification on Worker Registration

```javascript
import { sendNotificationToWorker, NotificationTemplates } from './services/notification.service.js';

// After worker registration
const worker = await Worker.create(workerData);

// Send welcome notification
await sendNotificationToWorker(
  worker._id,
  NotificationTemplates.WELCOME(worker.name),
  { type: 'welcome', workerId: worker._id.toString() }
);
```

### Example 2: Notify Worker on Profile Approval

```javascript
// In admin approval endpoint
const worker = await Worker.findByIdAndUpdate(
  workerId,
  { verificationStatus: 'approved' },
  { new: true }
);

await sendNotificationToWorker(
  workerId,
  NotificationTemplates.PROFILE_APPROVED(worker.name),
  { type: 'profile_approved' }
);
```

### Example 3: Broadcast to All Workers

```javascript
// Send to all active workers
await sendNotificationToWorkers(
  { verificationStatus: 'approved', isActive: true },
  {
    title: 'Important Update',
    body: 'New features are now available!'
  },
  { type: 'broadcast' }
);
```

---

## 🛠️ Troubleshooting

### Issue 1: Firebase not initializing
**Error:** `firebase-service-account.json not found`

**Solution:**
```bash
# Check if file exists
ls Passo_backend/firebase-service-account.json

# If not, create it with the service account credentials
```

### Issue 2: Notification not received
**Possible causes:**
1. Invalid FCM token
2. Device not connected to internet
3. App not running or in background
4. Google Play Services issue on device

**Solution:**
- Test with `test-notification.js` script
- Check device logs: `adb logcat | findstr firebase`
- Verify FCM token is correct

### Issue 3: Server error
**Error:** `Firebase Admin not initialized`

**Solution:**
- Ensure `initializeFirebase()` is called in `server.js`
- Check `firebase-service-account.json` path
- Restart server

---

## 📊 Monitoring

### Check Firebase Logs

```bash
# In server logs, look for:
✅ Firebase Admin SDK initialized successfully
📱 Project ID: paaso-app
✅ Notification sent successfully: projects/paaso-app/messages/...
```

### Check Notification Success Rate

```javascript
const result = await sendMulticastNotification(tokens, notification);
console.log(`Success: ${result.successCount}/${tokens.length}`);
console.log(`Failed: ${result.failureCount}`);
```

---

## 🎉 Summary

### What's Working:
- ✅ Firebase Admin SDK initialized
- ✅ Service account configured
- ✅ Notification service ready
- ✅ API endpoints available
- ✅ Test script ready
- ✅ Templates available

### Next Steps:
1. Start backend: `npm start`
2. Test notification: `node test-notification.js YOUR_TOKEN`
3. Integrate in your app flows
4. Monitor notification delivery

**Backend is ready to send push notifications!** 🚀
