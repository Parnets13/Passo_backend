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
      onboardingFee
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
      console.log('❌ Worker already exists with mobile:', mobile);
      return res.status(400).json({
        success: false,
        message: 'Worker with this mobile number already exists'
      });
    }

    console.log('✅ Worker does not exist, creating new worker...');

    // Create worker with Pending status
    const worker = await Worker.create({
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
      status: 'Pending', // Always pending until admin approves
      verified: false,
      kycVerified: false
    });

    console.log('✅ Worker created successfully in MongoDB!');
    console.log('   Worker ID:', worker._id);
    console.log('   Name:', worker.name);
    console.log('   Mobile:', worker.mobile);
    console.log('   Status:', worker.status);
    console.log('🔵 ========================================\n');

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Pending admin approval.',
      data: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        mobile: worker.mobile,
        status: worker.status
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
    const { mobile, password } = req.body;

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

    // Update last seen
    worker.lastSeen = new Date();
    worker.online = true;
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
