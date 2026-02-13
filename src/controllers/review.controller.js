import Review from '../models/Review.js';
import Worker from '../models/Worker.js';

// @desc    Submit a review (Public - no auth required)
// @route   POST /api/reviews
// @access  Public
export const submitReview = async (req, res, next) => {
  try {
    const { workerId, rating, comment, userName } = req.body;

    // Validate required fields
    if (!workerId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID and rating are required'
      });
    }

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Create review
    const review = await Review.create({
      worker: workerId,
      workerName: worker.name,
      category: worker.category,
      rating,
      comment: comment || '',
      userName: userName || 'Anonymous',
      status: 'Pending' // Reviews need admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews with filters
// @route   GET /api/reviews
// @access  Private (Admin)
export const getReviews = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      workerId,
      minRating,
      maxRating
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (workerId) query.worker = workerId;
    if (minRating) query.rating = { ...query.rating, $gte: parseInt(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseInt(maxRating) };

    const reviews = await Review.find(query)
      .populate('worker', 'name category mobile verified')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
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

// @desc    Get reviews for a specific worker (Public)
// @route   GET /api/reviews/worker/:workerId
// @access  Public
export const getWorkerReviews = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      worker: workerId,
      status: 'Approved' // Only show approved reviews publicly
    })
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ 
      worker: workerId,
      status: 'Approved'
    });

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { 
        $match: { 
          worker: workerId,
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        total,
        ratingDistribution: ratingStats
      },
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

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Private
export const getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('worker', 'name category mobile verified');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve review
// @route   POST /api/reviews/:id/approve
// @access  Private (Admin)
export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'Approved';
    review.isVerified = true;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject review
// @route   POST /api/reviews/:id/reject
// @access  Private (Admin)
export const rejectReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'Rejected';
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review rejected',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Private (Admin)
export const getReviewStats = async (req, res, next) => {
  try {
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'Pending' });
    const approvedReviews = await Review.countDocuments({ status: 'Approved' });
    const rejectedReviews = await Review.countDocuments({ status: 'Rejected' });

    // Average rating across all approved reviews
    const avgRatingResult = await Review.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = avgRatingResult.length > 0 
      ? Math.round(avgRatingResult[0].avgRating * 10) / 10 
      : 0;

    // Reviews by category
    const reviewsByCategory = await Review.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent reviews
    const recentReviews = await Review.find()
      .populate('worker', 'name category')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews,
        avgRating,
        byCategory: reviewsByCategory,
        recent: recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};
