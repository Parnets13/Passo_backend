import FCMToken from '../models/FCMToken.js';
import Worker from '../models/Worker.js';

/**
 * @desc    Register or update FCM token
 * @route   POST /api/fcm/register
 * @access  Public (called during registration/login)
 */
export const registerFCMToken = async (req, res) => {
  try {
    const { userId, fcmToken, platform, deviceInfo } = req.body;
    
    console.log('📱 FCM Token Registration Request');
    console.log('   User ID:', userId);
    console.log('   Platform:', platform);
    console.log('   Token preview:', fcmToken?.substring(0, 30) + '...');
    
    // Validate required fields
    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'userId and fcmToken are required'
      });
    }
    
    // Check if worker exists
    const worker = await Worker.findById(userId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    // Check if token already exists for this worker
    let tokenDoc = await FCMToken.findOne({ worker: userId, token: fcmToken });
    
    if (tokenDoc) {
      // Update existing token
      console.log('   Updating existing token...');
      tokenDoc.platform = platform || tokenDoc.platform;
      tokenDoc.deviceInfo = deviceInfo || tokenDoc.deviceInfo;
      tokenDoc.isActive = true;
      tokenDoc.lastUsed = new Date();
      tokenDoc.failureCount = 0;
      await tokenDoc.save();
    } else {
      // Deactivate old tokens for this worker
      await FCMToken.updateMany(
        { worker: userId },
        { isActive: false }
      );
      
      // Create new token
      console.log('   Creating new token...');
      tokenDoc = await FCMToken.create({
        worker: userId,
        token: fcmToken,
        platform: platform || 'unknown',
        deviceInfo: deviceInfo || {},
        isActive: true
      });
    }
    
    // Update worker's FCM token field (for backward compatibility)
    worker.fcmToken = fcmToken;
    worker.devicePlatform = platform || 'unknown';
    worker.lastTokenUpdate = new Date();
    await worker.save();
    
    console.log('✅ FCM token registered successfully');
    
    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: {
        tokenId: tokenDoc._id,
        platform: tokenDoc.platform,
        isActive: tokenDoc.isActive
      }
    });
    
  } catch (error) {
    console.error('❌ FCM token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token',
      error: error.message
    });
  }
};

/**
 * @desc    Get all active tokens for a worker
 * @route   GET /api/fcm/tokens/:workerId
 * @access  Public
 */
export const getWorkerTokens = async (req, res) => {
  try {
    const { workerId } = req.params;
    
    const tokens = await FCMToken.find({
      worker: workerId,
      isActive: true
    }).select('-__v');
    
    res.status(200).json({
      success: true,
      count: tokens.length,
      data: tokens
    });
    
  } catch (error) {
    console.error('❌ Get worker tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get worker tokens',
      error: error.message
    });
  }
};

/**
 * @desc    Deactivate FCM token
 * @route   POST /api/fcm/deactivate
 * @access  Public
 */
export const deactivateFCMToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;
    
    if (!userId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'userId and fcmToken are required'
      });
    }
    
    const tokenDoc = await FCMToken.findOne({
      worker: userId,
      token: fcmToken
    });
    
    if (!tokenDoc) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }
    
    tokenDoc.isActive = false;
    await tokenDoc.save();
    
    // Also clear from worker model
    const worker = await Worker.findById(userId);
    if (worker && worker.fcmToken === fcmToken) {
      worker.fcmToken = null;
      worker.devicePlatform = 'unknown';
      await worker.save();
    }
    
    console.log('✅ FCM token deactivated');
    
    res.status(200).json({
      success: true,
      message: 'FCM token deactivated successfully'
    });
    
  } catch (error) {
    console.error('❌ Deactivate token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate token',
      error: error.message
    });
  }
};

/**
 * @desc    Clean up invalid tokens
 * @route   POST /api/fcm/cleanup
 * @access  Admin
 */
export const cleanupInvalidTokens = async (req, res) => {
  try {
    console.log('🧹 Cleaning up invalid FCM tokens...');
    
    // Deactivate tokens with 3+ failures
    const result = await FCMToken.updateMany(
      { failureCount: { $gte: 3 }, isActive: true },
      { isActive: false }
    );
    
    console.log(`✅ Deactivated ${result.modifiedCount} invalid tokens`);
    
    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} invalid tokens`,
      deactivated: result.modifiedCount
    });
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup tokens',
      error: error.message
    });
  }
};

/**
 * @desc    Get FCM token statistics
 * @route   GET /api/fcm/stats
 * @access  Admin
 */
export const getFCMStats = async (req, res) => {
  try {
    const totalTokens = await FCMToken.countDocuments();
    const activeTokens = await FCMToken.countDocuments({ isActive: true });
    const inactiveTokens = await FCMToken.countDocuments({ isActive: false });
    
    const platformStats = await FCMToken.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalTokens,
        activeTokens,
        inactiveTokens,
        platformStats
      }
    });
    
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get FCM stats',
      error: error.message
    });
  }
};

export default {
  registerFCMToken,
  getWorkerTokens,
  deactivateFCMToken,
  cleanupInvalidTokens,
  getFCMStats
};
