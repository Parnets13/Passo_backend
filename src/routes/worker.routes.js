import express from 'express';
import {
  getWorkers,
  getWorkerById,
  approveWorker,
  rejectWorker,
  blockWorker,
  unblockWorker,
  markFeatured,
  removeFeatured,
  assignBadge,
  removeBadge,
  approveKYC,
  deleteWorker
} from '../controllers/worker.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// ============================================

// In-memory OTP storage (for development - use Redis in production)
const otpStore = new Map();

// Generate OTP - PUBLIC ROUTE
router.post('/send-otp', async (req, res) => {
  try {
    console.log('📱 Send OTP request received');
    const { mobile } = req.body;
    
    if (!mobile) {
      console.log('❌ Mobile number missing');
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      console.log('❌ Invalid mobile number format');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(mobile, {
      otp,
      expiryTime,
      attempts: 0
    });

    console.log('✅ OTP generated for', mobile, ':', otp);
    console.log('⏰ OTP expires at:', new Date(expiryTime).toLocaleTimeString());
    console.log('📱 OTP will be displayed on screen (no SMS)');

    // Return response with OTP (no SMS sending)
    res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp, // Always return OTP for display on screen
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP - PUBLIC ROUTE
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('🔐 Verify OTP request received');
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      console.log('❌ Mobile or OTP missing');
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Check if OTP exists
    const storedData = otpStore.get(mobile);
    
    if (!storedData) {
      console.log('❌ No OTP found for mobile:', mobile);
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please request a new OTP'
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiryTime) {
      console.log('❌ OTP expired for mobile:', mobile);
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP'
      });
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      console.log('❌ Too many attempts for mobile:', mobile);
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('❌ Invalid OTP for mobile:', mobile);
      storedData.attempts += 1;
      otpStore.set(mobile, storedData);
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
      });
    }

    // OTP verified successfully
    console.log('✅ OTP verified successfully for mobile:', mobile);
    otpStore.delete(mobile);

    // Check if user exists
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findOne({ mobile }).select('-password');
    
    // Generate JWT token if worker exists
    let token = null;
    if (worker) {
      token = worker.generateAuthToken();
      console.log('🔑 JWT token generated for worker:', worker._id);
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      exists: !!worker,
      token: token, // ✅ Add JWT token
      worker: worker ? {
        _id: worker._id,
        id: worker._id,
        name: worker.name,
        email: worker.email,
        mobile: worker.mobile,
        workerType: worker.workerType,
        category: worker.category,
        serviceArea: worker.serviceArea,
        city: worker.city,
        languages: worker.languages,
        availability: worker.availability,
        online: worker.online,
        status: worker.status,
        verified: worker.verified,
        kycVerified: worker.kycVerified,
        badges: worker.badges,
        profilePhoto: worker.profilePhoto,
        gstNumber: worker.gstNumber,
        msmeNumber: worker.msmeNumber,
        createdAt: worker.createdAt
      } : null
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Public workers list
router.get('/public', getWorkers);

// Check mobile - PUBLIC ROUTE for OTP verification
router.post('/check-mobile', async (req, res) => {
  try {
    console.log('📞 Check mobile request received');
    const { mobile } = req.body;
    
    if (!mobile) {
      console.log('❌ Mobile number missing');
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    console.log('🔍 Checking mobile:', mobile);
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findOne({ mobile }).select('-password');
    
    console.log('✅ Mobile check complete. Exists:', !!worker);
    
    // Return complete worker data for profile display
    res.status(200).json({
      success: true,
      exists: !!worker,
      worker: worker ? {
        _id: worker._id,
        id: worker._id,
        name: worker.name,
        email: worker.email,
        mobile: worker.mobile,
        workerType: worker.workerType,
        category: worker.category,
        serviceArea: worker.serviceArea,
        city: worker.city,
        languages: worker.languages,
        availability: worker.availability,
        online: worker.online,
        status: worker.status,
        verified: worker.verified,
        kycVerified: worker.kycVerified,
        badges: worker.badges,
        profilePhoto: worker.profilePhoto,
        gstNumber: worker.gstNumber,
        msmeNumber: worker.msmeNumber,
        createdAt: worker.createdAt
      } : null
    });
  } catch (error) {
    console.error('❌ Check mobile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// FCM Token Registration - PUBLIC ROUTE
router.post('/fcm-token', async (req, res) => {
  try {
    console.log('📱 FCM token registration request received');
    const { userId, fcmToken, platform } = req.body;
    
    if (!userId || !fcmToken) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'userId and fcmToken are required'
      });
    }

    console.log('🔍 Registering FCM token for user:', userId);
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(userId);
    
    if (!worker) {
      console.log('❌ Worker not found');
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Update FCM token
    worker.fcmToken = fcmToken;
    worker.devicePlatform = platform || 'unknown';
    worker.lastTokenUpdate = new Date();
    await worker.save();
    
    console.log('✅ FCM token registered successfully');
    
    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    console.error('❌ FCM token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// ADMIN ROUTES (PROTECTED - AUTHENTICATION REQUIRED)
// ============================================

// Admin workers list - TEMPORARILY PUBLIC for admin panel testing
// TODO: Add proper admin authentication
router.get('/', getWorkers);
router.get('/:id', getWorkerById);

// Update worker (for availability and other fields)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`📝 Updating worker ${id}:`, updates);
    
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ Worker updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      worker
    });
  } catch (error) {
    console.error('❌ Update worker error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Action routes (must come before generic /:id DELETE to avoid conflicts)
router.post('/:id/approve', protect, approveWorker);
router.post('/:id/reject', protect, rejectWorker);
router.post('/:id/block', protect, blockWorker);
router.post('/:id/unblock', protect, unblockWorker);
router.post('/:id/featured', protect, markFeatured);
router.delete('/:id/featured', protect, removeFeatured);
router.post('/:id/badge', protect, assignBadge);
router.delete('/:id/badge', protect, removeBadge);
router.post('/:id/kyc/approve', protect, approveKYC);

// Delete route (must come after specific routes)
router.delete('/:id', protect, deleteWorker);

// ============================================
// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// ============================================

// NOTE: Do NOT use router.use(protect) here as it will apply to ALL routes
// including the public routes defined above. Apply protect individually to
// each protected route instead.

// Worker profile routes
router.get('/me', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findByIdAndUpdate(
      req.admin.id || req.user?.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Worker status routes
router.put('/me/status', protect, async (req, res) => {
  try {
    const { online, availability } = req.body;
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Update online status if provided
    if (typeof online !== 'undefined') {
      worker.online = online;
    }
    
    // Update availability status if provided
    if (availability) {
      worker.availability = availability;
      // Also update online status based on availability
      worker.online = availability === 'online';
    }
    
    worker.lastSeen = new Date();
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Status updated',
      worker: {
        online: worker.online,
        availability: worker.availability,
        lastSeen: worker.lastSeen
      }
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Worker stats route
router.get('/me/stats', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUnlocks: worker.totalUnlocks,
        rating: worker.rating,
        totalReviews: worker.totalReviews,
        verified: worker.verified,
        kycVerified: worker.kycVerified,
        badges: worker.badges,
        featured: worker.featured,
        subscription: worker.subscription
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Notification preferences routes
router.get('/me/notification-preferences', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id).select('notificationPreferences');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      preferences: worker.notificationPreferences || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/me/notification-preferences', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.notificationPreferences = {
      ...worker.notificationPreferences,
      ...req.body
    };
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      preferences: worker.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Privacy settings routes
router.get('/me/privacy-settings', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id).select('privacySettings');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      settings: worker.privacySettings || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/me/privacy-settings', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.privacySettings = {
      ...worker.privacySettings,
      ...req.body
    };
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated',
      settings: worker.privacySettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Dashboard route
router.get('/dashboard', protect, async (req, res) => {
  try {
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        worker: {
          name: worker.name,
          mobile: worker.mobile,
          email: worker.email,
          status: worker.status,
          verified: worker.verified,
          rating: worker.rating,
          totalReviews: worker.totalReviews,
          badges: worker.badges,
          featured: worker.featured,
          online: worker.online,
          availability: worker.availability,
          subscription: worker.subscription
        },
        stats: {
          totalUnlocks: worker.totalUnlocks,
          rating: worker.rating,
          totalReviews: worker.totalReviews
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;


// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get worker notifications
router.get('/:workerId/notifications', async (req, res) => {
  try {
    const { workerId } = req.params;
    console.log('🔔 Fetching notifications for worker:', workerId);
    
    const Notification = (await import('../models/Notification.js')).default;
    
    // Find notifications for this worker
    // Either targeted to 'All' or specifically to this worker
    const notifications = await Notification.find({
      $or: [
        { targetAudience: 'All' },
        { userIds: workerId }
      ],
      status: 'Sent'
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    console.log(`✅ Found ${notifications.length} notifications`);
    
    res.status(200).json({
      success: true,
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
});

// Mark notification as read
router.put('/:workerId/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log('✅ Marking notification as read:', notificationId);
    
    const Notification = (await import('../models/Notification.js')).default;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});
