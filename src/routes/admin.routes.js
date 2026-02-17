import express from 'express';

const router = express.Router();

// ============================================
// PUBLIC ADMIN ROUTES (NO AUTHENTICATION)
// For admin panel to fetch data
// ============================================

// Get all workers for admin panel (POST method for admin panel compatibility)
router.post('/workers', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching all workers (POST)');
    const Worker = (await import('../models/Worker.js')).default;
    
    const {
      page = 1,
      limit = 50,
      status,
      verified,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.body; // Using req.body for POST

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true' || verified === true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const workers = await Worker.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(query);

    console.log(`✅ Admin: Found ${workers.length} workers (Total: ${total})`);

    res.status(200).json({
      success: true,
      data: workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Admin workers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers',
      error: error.message
    });
  }
});

// Get all workers for admin panel (GET method also supported)
router.get('/workers', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching all workers');
    const Worker = (await import('../models/Worker.js')).default;
    
    const {
      page = 1,
      limit = 50,
      status,
      verified,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const workers = await Worker.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Worker.countDocuments(query);

    console.log(`✅ Admin: Found ${workers.length} workers (Total: ${total})`);

    res.status(200).json({
      success: true,
      data: workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Admin workers fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers',
      error: error.message
    });
  }
});

// Get single worker details
router.get('/workers/:id', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching worker:', req.params.id);
    const Worker = (await import('../models/Worker.js')).default;
    
    const worker = await Worker.findById(req.params.id).select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ Admin: Worker found');
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error('❌ Admin worker fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker',
      error: error.message
    });
  }
});

// Get dashboard stats (POST method)
router.post('/stats', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching dashboard stats (POST)');
    const Worker = (await import('../models/Worker.js')).default;
    
    const totalWorkers = await Worker.countDocuments();
    const activeWorkers = await Worker.countDocuments({ status: 'active' });
    const pendingWorkers = await Worker.countDocuments({ status: 'pending' });
    const verifiedWorkers = await Worker.countDocuments({ verified: true });
    const onlineWorkers = await Worker.countDocuments({ online: true });

    console.log('✅ Admin: Stats fetched');
    res.status(200).json({
      success: true,
      data: {
        totalWorkers,
        activeWorkers,
        pendingWorkers,
        verifiedWorkers,
        onlineWorkers
      }
    });
  } catch (error) {
    console.error('❌ Admin stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

// Get dashboard stats (GET method also supported)
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Admin: Fetching dashboard stats');
    const Worker = (await import('../models/Worker.js')).default;
    
    const totalWorkers = await Worker.countDocuments();
    const activeWorkers = await Worker.countDocuments({ status: 'active' });
    const pendingWorkers = await Worker.countDocuments({ status: 'pending' });
    const verifiedWorkers = await Worker.countDocuments({ verified: true });
    const onlineWorkers = await Worker.countDocuments({ online: true });

    console.log('✅ Admin: Stats fetched');
    res.status(200).json({
      success: true,
      data: {
        totalWorkers,
        activeWorkers,
        pendingWorkers,
        verifiedWorkers,
        onlineWorkers
      }
    });
  } catch (error) {
    console.error('❌ Admin stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

// Update worker status (approve/reject/block)
router.put('/workers/:id/status', async (req, res) => {
  try {
    console.log('📊 Admin: Updating worker status:', req.params.id);
    const Worker = (await import('../models/Worker.js')).default;
    const { status } = req.body;

    if (!['pending', 'active', 'rejected', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ Admin: Worker status updated');
    res.status(200).json({
      success: true,
      message: 'Worker status updated',
      data: worker
    });
  } catch (error) {
    console.error('❌ Admin status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update worker status',
      error: error.message
    });
  }
});

// Delete worker
router.delete('/workers/:id', async (req, res) => {
  try {
    console.log('📊 Admin: Deleting worker:', req.params.id);
    const Worker = (await import('../models/Worker.js')).default;
    
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ Admin: Worker deleted');
    res.status(200).json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    console.error('❌ Admin delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete worker',
      error: error.message
    });
  }
});

export default router;
