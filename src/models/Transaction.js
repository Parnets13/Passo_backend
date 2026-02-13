import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  type: {
    type: String,
    enum: ['Unlock', 'Onboarding', 'Featured', 'Subscription', 'Refund', 'Credit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentGateway: {
    type: String,
    enum: ['Razorpay', 'Manual', 'Free'],
    default: 'Razorpay'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // For unlock transactions
  category: String,
  
  // For featured/subscription
  plan: String,
  duration: String,
  
  // Refund details
  refundReason: String,
  refundedAt: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Credit details
  creditReason: String,
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ workerId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);
