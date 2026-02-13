import Worker from '../models/Worker.js';

// @desc    Get all workers with filters
// @route   GET /api/workers
// @access  Private
export const getWorkers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      city, 
      status, 
      verified, 
      featured 
    } = req.query;

    const query = {};

    if (type) query.workerType = type;
    if (category) query.category = { $in: [category] }; // Match if category array contains this value
    if (city) query.city = { $regex: city, $options: 'i' };
    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    const workers = await Worker.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Worker.countDocuments(query);

    res.status(200).json({
      success: true,
      data: workers,
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

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Private
export const getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id).select('-password');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve worker
// @route   POST /api/workers/:id/approve
// @access  Private
export const approveWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.status = 'Approved';
    worker.verified = true;
    
    // Auto-assign badges on approval
    if (!worker.badges.includes('Verified')) {
      worker.badges.push('Verified');
    }
    if (!worker.badges.includes('Trusted Pro')) {
      worker.badges.push('Trusted Pro');
    }
    
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker approved successfully with Verified and Trusted badges',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject worker
// @route   POST /api/workers/:id/reject
// @access  Private
export const rejectWorker = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.status = 'Rejected';
    worker.rejectionReason = reason;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker rejected',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block worker
// @route   POST /api/workers/:id/block
// @access  Private
export const blockWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.status = 'Blocked';
    worker.online = false;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker blocked successfully',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock worker
// @route   POST /api/workers/:id/unblock
// @access  Private
export const unblockWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.status = 'Approved';
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker unblocked successfully',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark worker as featured
// @route   POST /api/workers/:id/featured
// @access  Private
export const markFeatured = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'Weekly' or 'Monthly'
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    const duration = plan === 'Weekly' ? 7 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    worker.featured = true;
    worker.featuredPlan = plan;
    worker.featuredExpiresAt = expiresAt;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker marked as featured',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove featured status
// @route   DELETE /api/workers/:id/featured
// @access  Private
export const removeFeatured = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.featured = false;
    worker.featuredPlan = null;
    worker.featuredExpiresAt = null;
    worker.featuredPriority = 0;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Featured status removed',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign badge to worker
// @route   POST /api/workers/:id/badge
// @access  Private
export const assignBadge = async (req, res, next) => {
  try {
    const { badgeType } = req.body;
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    if (!worker.badges.includes(badgeType)) {
      worker.badges.push(badgeType);
      await worker.save();
    }

    res.status(200).json({
      success: true,
      message: 'Badge assigned successfully',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove badge from worker
// @route   DELETE /api/workers/:id/badge
// @access  Private
export const removeBadge = async (req, res, next) => {
  try {
    const { badgeType } = req.body;
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.badges = worker.badges.filter(badge => badge !== badgeType);
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Badge removed successfully',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve KYC
// @route   POST /api/workers/:id/kyc/approve
// @access  Private
export const approveKYC = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    worker.kycVerified = true;
    worker.verified = true;
    
    // Add verified badge if not already present
    if (!worker.badges.includes('Verified')) {
      worker.badges.push('Verified');
    }
    
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      data: worker
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private
export const deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    await worker.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
