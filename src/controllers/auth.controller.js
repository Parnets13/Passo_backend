import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Worker from '../models/Worker.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (admin.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new admin
// @route   POST /api/auth/register
// @access  Public (should be protected in production)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin'
    });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout admin
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new worker
// @route   POST /api/auth/worker/register
// @access  Public
export const registerWorker = async (req, res, next) => {
  console.log('\n🔵 ========================================');
  console.log('🔵 WORKER REGISTRATION REQUEST RECEIVED');
  console.log('🔵 ========================================');
  console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📍 Timestamp:', new Date().toISOString());
  
  try {
    const {
      name,
      email,
      mobile,
      password,
      languages,
      workerType,
      category,
      serviceArea,
      city,
      teamSize,
      profilePhoto,
      aadhaarDoc,
      panCard,
      gstCertificate,
      gstNumber,
      msmeCertificate,
      msmeNumber,
      onboardingFee,
      paymentScreenshot,
      availability,
      online,
      fcmToken
    } = req.body;

    console.log('✅ Data extracted from request');
    console.log('   Name:', name);
    console.log('   Mobile:', mobile);
    console.log('   Category:', category);
    console.log('   City:', city);

    // Check if worker already exists
    console.log('🔍 Checking if worker exists...');
    const existingWorker = await Worker.findOne({ mobile });

    if (existingWorker) {
      console.log('⚠️ Worker already exists with mobile:', mobile);
      console.log('   Worker Status:', existingWorker.status);
      console.log('   Worker Name:', existingWorker.name);
      
      // Return appropriate message based on status
      if (existingWorker.status === 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'This mobile number is already registered. Please login instead.',
          alreadyRegistered: true,
          status: existingWorker.status
        });
      } else if (existingWorker.status === 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Your registration is pending admin approval. Please wait.',
          alreadyRegistered: true,
          status: existingWorker.status
        });
      } else if (existingWorker.status === 'Rejected') {
        return res.status(400).json({
          success: false,
          message: 'Your previous registration was rejected. Please contact support.',
          alreadyRegistered: true,
          status: existingWorker.status
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Account exists with status: ${existingWorker.status}. Please contact support.`,
          alreadyRegistered: true,
          status: existingWorker.status
        });
      }
    }

    console.log('✅ Worker does not exist, creating new worker...');

    // Ensure category is an array
    let categoryArray = category;
    if (!Array.isArray(category)) {
      categoryArray = category ? [category] : ['General'];
    } else if (category.length === 0) {
      categoryArray = ['General'];
    }

    console.log('📦 Category Array:', categoryArray);

    // Handle onboardingFee - can be string (transaction ID) or object
    let onboardingFeeData = onboardingFee;
    if (typeof onboardingFee === 'string') {
      onboardingFeeData = {
        paid: true,
        transactionId: onboardingFee,
        amount: 499,
        paidAt: new Date()
      };
    }

    console.log('💳 Onboarding Fee:', onboardingFeeData);

    // Create worker with Pending status
    const worker = await Worker.create({
      name,
      email,
      mobile,
      password,
      languages,
      workerType,
      category: categoryArray,
      serviceArea,
      city,
      teamSize: teamSize || 1, // Default to 1 if not provided
      profilePhoto,
      aadhaarDoc,
      panCard,
      gstCertificate,
      gstNumber,
      msmeCertificate,
      msmeNumber,
      onboardingFee: onboardingFeeData,
      paymentScreenshot, // Add payment screenshot
      availability: availability || 'online', // Add availability status
      online: online !== undefined ? online : true, // Add online status
      fcmToken: fcmToken || null, // ✅ Add FCM token for push notifications
      status: 'Pending', // Always pending until admin approves
      verified: false,
      kycVerified: false
    });

    console.log('✅ Worker created successfully in MongoDB!');
    console.log('   Worker ID:', worker._id);
    console.log('   Name:', worker.name);
    console.log('   Mobile:', worker.mobile);
    console.log('   Status:', worker.status);
    
    // ✅ Register FCM token if provided
    if (fcmToken) {
      try {
        console.log('📱 Registering FCM token during registration...');
        const FCMToken = (await import('../models/FCMToken.js')).default;
        
        await FCMToken.create({
          worker: worker._id,
          token: fcmToken,
          platform: req.body.platform || 'unknown',
          deviceInfo: req.body.deviceInfo || {},
          isActive: true
        });
        
        console.log('✅ FCM token registered successfully');
      } catch (fcmError) {
        console.error('⚠️ FCM token registration failed:', fcmError.message);
        // Don't fail registration if FCM token fails
      }
    }
    
    console.log('🔵 ========================================\n');

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Pending admin approval.',
      worker: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        mobile: worker.mobile,
        workerType: worker.workerType,
        category: worker.category,
        serviceArea: worker.serviceArea,
        city: worker.city,
        languages: worker.languages,
        status: worker.status,
        verified: worker.verified,
        kycVerified: worker.kycVerified,
        availability: worker.availability,
        online: worker.online,
        badges: worker.badges || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker login
// @route   POST /api/auth/worker/login
// @access  Public
export const workerLogin = async (req, res, next) => {
  try {
    const { mobile, password, fcmToken } = req.body;

    // Check if worker exists
    const worker = await Worker.findOne({ mobile }).select('+password');

    if (!worker) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await worker.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if worker is approved
    if (worker.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${worker.status.toLowerCase()}. Please wait for admin approval.`,
        status: worker.status
      });
    }

    // Generate token
    const token = generateToken(worker._id);

    // Update last seen, online status, and FCM token
    worker.lastSeen = new Date();
    worker.online = true;
    if (fcmToken) {
      worker.fcmToken = fcmToken;
      worker.devicePlatform = req.body.platform || 'unknown';
      worker.lastTokenUpdate = new Date();
      console.log('✅ FCM token updated for worker:', worker.name);
      
      // ✅ Register FCM token in FCMToken collection
      try {
        const FCMToken = (await import('../models/FCMToken.js')).default;
        
        // Check if token already exists
        let tokenDoc = await FCMToken.findOne({ worker: worker._id, token: fcmToken });
        
        if (tokenDoc) {
          // Update existing token
          tokenDoc.platform = req.body.platform || tokenDoc.platform;
          tokenDoc.isActive = true;
          tokenDoc.lastUsed = new Date();
          tokenDoc.failureCount = 0;
          await tokenDoc.save();
        } else {
          // Deactivate old tokens
          await FCMToken.updateMany({ worker: worker._id }, { isActive: false });
          
          // Create new token
          await FCMToken.create({
            worker: worker._id,
            token: fcmToken,
            platform: req.body.platform || 'unknown',
            deviceInfo: req.body.deviceInfo || {},
            isActive: true
          });
        }
        
        console.log('✅ FCM token registered in FCMToken collection');
      } catch (fcmError) {
        console.error('⚠️ FCM token registration failed:', fcmError.message);
       
      }
    }
    await worker.save();

    res.status(200).json({
      success: true,
      token,
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        mobile: worker.mobile,
        category: worker.category,
        status: worker.status,
        verified: worker.verified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - Send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token and set to resetPasswordToken field
    const crypto = await import('crypto');
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expire time (10 minutes)
    admin.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await admin.save();

    // In production, send email with reset token
    // For now, return token in response (remove this in production)
    console.log('Password reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      // Remove this in production - only for development
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Hash the provided token
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find admin with matching token and not expired
    const admin = await Admin.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Set new password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    // Generate new token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update FCM token for worker
// @route   POST /api/auth/update-fcm-token
// @access  Private (Worker)
export const updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Update worker's FCM token
    const worker = await Worker.findByIdAndUpdate(
      req.worker.id,
      { fcmToken },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ FCM token updated for worker:', worker.name);

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
