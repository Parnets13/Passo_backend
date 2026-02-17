import express from 'express';
import { protect } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Worker from '../models/Worker.js';

const router = express.Router();
router.use(protect);

// Get all transactions (admin)
router.get('/', async (req, res) => {
  try {
    const { type, status, userId, workerId, startDate, endDate } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (workerId) filter.workerId = workerId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(filter)
      .populate('userId', 'name email mobile')
      .populate('workerId', 'name mobile')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get worker's transactions
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    
    const transactions = await Transaction.find({ workerId })
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get Worker Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Get my transactions (for logged-in worker)
router.get('/me', async (req, res) => {
  try {
    const workerId = req.admin.id || req.user?.id;
    
    const transactions = await Transaction.find({ workerId })
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Get My Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Create subscription transaction
router.post('/subscription', async (req, res) => {
  try {
    const { plan, duration, amount, paymentGateway = 'Razorpay' } = req.body;
    const workerId = req.admin.id || req.user?.id;
    
    if (!plan || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Plan and amount are required'
      });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      workerId,
      userId: workerId, // For worker subscriptions, userId is same as workerId
      type: 'Subscription',
      amount,
      plan,
      duration: duration || 'monthly',
      paymentGateway,
      status: 'Pending'
    });
    
    res.json({
      success: true,
      message: 'Transaction created',
      transaction
    });
  } catch (error) {
    console.error('Create Subscription Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// Confirm subscription payment
router.post('/subscription/confirm', async (req, res) => {
  try {
    const { transactionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const workerId = req.admin.id || req.user?.id;
    
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.workerId.toString() !== workerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Update transaction
    transaction.status = 'Success';
    transaction.razorpayOrderId = razorpayOrderId;
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.razorpaySignature = razorpaySignature;
    await transaction.save();
    
    // Update worker subscription
    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.subscription.plan = transaction.plan;
      
      // Calculate expiry date
      const expiryDate = new Date();
      if (transaction.duration === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      
      worker.subscription.expiresAt = expiryDate;
      await worker.save();
    }
    
    res.json({
      success: true,
      message: 'Subscription activated',
      transaction,
      subscription: worker.subscription
    });
  } catch (error) {
    console.error('Confirm Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm subscription'
    });
  }
});

// Create featured listing transaction
router.post('/featured', async (req, res) => {
  try {
    const { plan, duration, amount, paymentGateway = 'Razorpay' } = req.body;
    const workerId = req.admin.id || req.user?.id;
    
    if (!plan || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Plan and amount are required'
      });
    }
    
    const transaction = await Transaction.create({
      workerId,
      userId: workerId,
      type: 'Featured',
      amount,
      plan,
      duration: duration || 'weekly',
      paymentGateway,
      status: 'Pending'
    });
    
    res.json({
      success: true,
      message: 'Transaction created',
      transaction
    });
  } catch (error) {
    console.error('Create Featured Transaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// Get revenue reports
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const filter = { status: 'Success' };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(filter);
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const byType = {};
    
    transactions.forEach(t => {
      if (!byType[t.type]) {
        byType[t.type] = { count: 0, amount: 0 };
      }
      byType[t.type].count++;
      byType[t.type].amount += t.amount;
    });
    
    res.json({
      success: true,
      totalRevenue,
      transactionCount: transactions.length,
      byType
    });
  } catch (error) {
    console.error('Get Revenue Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue'
    });
  }
});

// Issue refund
router.post('/refund', async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.status !== 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Only successful transactions can be refunded'
      });
    }
    
    transaction.status = 'Refunded';
    transaction.refundReason = reason;
    transaction.refundedAt = new Date();
    transaction.refundedBy = req.admin.id;
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Refund issued successfully',
      transaction
    });
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue refund'
    });
  }
});

export default router;
