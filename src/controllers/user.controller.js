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
