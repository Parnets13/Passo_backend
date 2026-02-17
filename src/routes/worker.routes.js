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
    
    res.status(200).json({
      success: true,
      exists: !!worker,
      worker: worker ? {
        id: worker._id,
        name: worker.name,
        mobile: worker.mobile,
        status: worker.status,
        verified: worker.verified
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

// ============================================
// ADMIN ROUTES (PROTECTED - AUTHENTICATION REQUIRED)
// ============================================

// Admin workers list - TEMPORARILY PUBLIC for admin panel testing
// TODO: Add proper admin authentication
router.get('/', getWorkers);
router.get('/:id', getWorkerById);

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

// Apply authentication middleware to all routes below
router.use(protect);

// Worker profile routes
router.get('/me', async (req, res) => {
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

router.put('/me', async (req, res) => {
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
router.put('/me/status', async (req, res) => {
  try {
    const { online } = req.body;
    const Worker = (await import('../models/Worker.js')).default;
    const worker = await Worker.findById(req.admin.id || req.user?.id);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.online = online;
    worker.lastSeen = new Date();
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Status updated',
      worker: {
        online: worker.online,
        lastSeen: worker.lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Worker stats route
router.get('/me/stats', async (req, res) => {
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
router.get('/me/notification-preferences', async (req, res) => {
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

router.put('/me/notification-preferences', async (req, res) => {
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
router.get('/me/privacy-settings', async (req, res) => {
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

router.put('/me/privacy-settings', async (req, res) => {
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
router.get('/dashboard', async (req, res) => {
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
