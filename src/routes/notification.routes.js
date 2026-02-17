import express from 'express';
import { protect } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get worker notifications (no auth required for now - will use workerId from query)
router.get('/worker', async (req, res) => {
  try {
    const { workerId } = req.query;
    
    console.log('📬 Fetching notifications for worker:', workerId);
    
    // Get all notifications for this worker
    // For now, get all "Sent" notifications with targetAudience "All"
    const notifications = await Notification.find({
      status: 'Sent',
      $or: [
        { targetAudience: 'All' },
        { userIds: workerId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('title message type createdAt bannerImage bannerLink');
    
    console.log(`✅ Found ${notifications.length} notifications`);
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('❌ Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Protected routes (require authentication)
router.use(protect);

router.post('/send', (req, res) => res.json({ success: true, message: 'Notification sent' }));
router.get('/history', (req, res) => res.json({ success: true, message: 'Notification history' }));
router.post('/banner', (req, res) => res.json({ success: true, message: 'Banner uploaded' }));
router.get('/banners', (req, res) => res.json({ success: true, message: 'Banners list' }));

export default router;
