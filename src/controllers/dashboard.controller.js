import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalWorkers,
      activeWorkers,
      todayUnlocks,
      todayRevenue,
      monthlyRevenue,
      pendingKYC
    ] = await Promise.all([
      User.countDocuments({ status: 'Active' }),
      Worker.countDocuments(),
      Worker.countDocuments({ online: true, status: 'Approved' }),
      Transaction.countDocuments({ 
        type: 'Unlock', 
        status: 'Success',
        createdAt: { $gte: today }
      }),
      Transaction.aggregate([
        { 
          $match: { 
            status: 'Success',
            createdAt: { $gte: today }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { 
          $match: { 
            status: 'Success',
            createdAt: { 
              $gte: new Date(today.getFullYear(), today.getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Worker.countDocuments({ status: 'Pending', kycVerified: false })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        activeWorkers,
        todayUnlocks,
        todayRevenue: todayRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        pendingKYC
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily unlocks data
// @route   GET /api/dashboard/daily-unlocks
// @access  Private
export const getDailyUnlocks = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const unlocks = await Transaction.aggregate([
      {
        $match: {
          type: 'Unlock',
          status: 'Success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: unlocks.map(item => ({
        date: item._id,
        unlocks: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue breakdown by type
// @route   GET /api/dashboard/revenue-by-type
// @access  Private
export const getRevenueByType = async (req, res, next) => {
  try {
    const revenue = await Transaction.aggregate([
      {
        $match: {
          status: 'Success'
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: revenue.map(item => ({
        type: item._id,
        amount: item.total
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top categories by unlocks
// @route   GET /api/dashboard/top-categories
// @access  Private
export const getTopCategories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const categories = await Transaction.aggregate([
      {
        $match: {
          type: 'Unlock',
          status: 'Success'
        }
      },
      {
        $group: {
          _id: '$category',
          unlocks: { $sum: 1 }
        }
      },
      { $sort: { unlocks: -1 } },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: categories.map(item => ({
        category: item._id,
        unlocks: item.unlocks
      }))
    });
  } catch (error) {
    next(error);
  }
};
