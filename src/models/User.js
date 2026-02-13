import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  unlocks: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  freeCredits: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },
  unlockHistory: [{
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    category: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  paymentHistory: [{
    transactionId: String,
    amount: Number,
    type: String,
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ mobile: 1 });
userSchema.index({ status: 1 });

export default mongoose.model('User', userSchema);
