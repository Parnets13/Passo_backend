import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  type: {
    type: String,
    enum: ['Wrong Number', 'Not Reachable', 'Fraud', 'Misleading Profile', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Admin actions
  adminAction: {
    type: String,
    enum: ['None', 'Warning Issued', 'Refund Issued', 'Worker Blocked'],
    default: 'None'
  },
  adminNotes: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolvedAt: Date,
  
  // Refund if applicable
  refunded: {
    type: Boolean,
    default: false
  },
  refundAmount: Number,
  refundTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ userId: 1 });
complaintSchema.index({ workerId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ type: 1 });

export default mongoose.model('Complaint', complaintSchema);
