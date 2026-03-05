import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = {};

    // Search by mobile or name
    if (search) {
      query.$or = [
        { mobile: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block user
// @route   POST /api/users/:id/block
// @access  Private
export const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'Blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock user
// @route   POST /api/users/:id/unblock
// @access  Private
export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'Active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue free credits to user
// @route   POST /api/users/:id/credits
// @access  Private
export const issueCredits = async (req, res, next) => {
  try {
    const { credits, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add credits
    user.freeCredits += credits;
    await user.save();

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: 'Credit',
      amount: 0,
      status: 'Success',
      paymentGateway: 'Manual',
      creditReason: reason,
      issuedBy: req.admin._id
    });

    res.status(200).json({
      success: true,
      message: `${credits} credits issued successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user history
// @route   GET /api/users/:id/history
// @access  Private
export const getUserHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get transaction history
    const transactions = await Transaction.find({ userId: user._id })
      .populate('workerId', 'name category')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        user,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record unlock contact (called after payment success)
// @route   POST /api/users/:id/unlock
// @access  Public (called from app after payment)
export const recordUnlock = async (req, res, next) => {
  try {
    const { workerId, workerName, workerMobile, category, amount, date } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already unlocked
    const alreadyUnlocked = user.unlockHistory?.some(
      unlock => unlock.workerId?.toString() === workerId
    );

    if (alreadyUnlocked) {
      return res.status(200).json({
        success: true,
        message: 'Contact already unlocked',
        data: { unlocked: true }
      });
    }

    // Add to unlock history
    if (!user.unlockHistory) {
      user.unlockHistory = [];
    }
    
    user.unlockHistory.push({
      workerId,
      workerName,
      workerMobile,
      category,
      amount,
      date: date ? new Date(date) : new Date()
    });

    // Update stats
    user.unlocks = (user.unlocks || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + amount;

    await user.save();

    console.log('✅ Unlock recorded for user:', user._id, '- Data saved to User Management');

    res.status(200).json({
      success: true,
      message: 'Unlock recorded successfully',
      data: {
        unlocked: true,
        unlocks: user.unlocks,
        totalSpent: user.totalSpent
      }
    });
  } catch (error) {
    console.error('❌ Record unlock error:', error);
    next(error);
  }
};

// @desc    Create anonymous user (for app users without registration)
// @route   POST /api/users/create-anonymous
// @access  Public
export const createAnonymousUser = async (req, res, next) => {
  try {
    const { name, mobile, password, deviceId } = req.body;

    // Check if user already exists with this mobile or deviceId
    const existingUser = await User.findOne({ 
      $or: [{ mobile }, { deviceId }] 
    });

    if (existingUser) {
      console.log('✅ Existing user found:', existingUser._id);
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          mobile: existingUser.mobile,
          status: existingUser.status,
          unlocks: existingUser.unlocks,
          totalSpent: existingUser.totalSpent,
          freeCredits: existingUser.freeCredits
        }
      });
    }

    // Create new anonymous user
    const user = await User.create({
      name,
      mobile,
      password,
      deviceId,
      status: 'Active'
    });

    console.log('✅ Anonymous user created:', user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        status: user.status,
        unlocks: user.unlocks,
        totalSpent: user.totalSpent,
        freeCredits: user.freeCredits
      }
    });
  } catch (error) {
    console.error('❌ Create anonymous user error:', error);
    next(error);
  }
};
