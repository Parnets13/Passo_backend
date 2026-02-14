import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  languages: [{
    type: String,
    trim: true
  }],
  workerType: {
    type: String,
    enum: ['Worker', 'Crew / Team', 'Contractor', 'Service Provider'],
    required: true
  },
  category: {
    type: [String],
    required: [true, 'At least one category is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one category must be selected'
    }
  },
  serviceArea: {
    type: String,
    required: [true, 'Service area is required']
  },
  city: {
    type: String,
    required: true
  },
  pincode: String,
  teamSize: {
    type: Number,
    min: 2
  },
  profilePhoto: String,
  
  // Documents
  aadhaarDoc: String,
  panCard: String,
  electricityBill: String,
  cancelledCheque: String,
  gstCertificate: String,
  gstNumber: String,
  msmeCertificate: String,
  msmeNumber: String,
  
  // Status & Verification
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Blocked'],
    default: 'Pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  
  // Badges
  badges: [{
    type: String,
    enum: ['Verified', 'Trusted Pro', 'Business Verified']
  }],
  
  // Featured
  featured: {
    type: Boolean,
    default: false
  },
  featuredPlan: {
    type: String,
    enum: ['Weekly', 'Monthly', null],
    default: null
  },
  featuredExpiresAt: Date,
  featuredPriority: {
    type: Number,
    default: 0
  },
  
  // Online Status
  online: {
    type: Boolean,
    default: false
  },
  lastSeen: Date,
  
  // Payment Info
  onboardingFee: {
    paid: {
      type: Boolean,
      default: false
    },
    amount: Number,
    transactionId: String,
    paidAt: Date
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Starter', 'Pro', 'Business'],
      default: 'Free'
    },
    expiresAt: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  
  // Stats
  totalUnlocks: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Rejection reason
  rejectionReason: String,
  
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workerSchema.index({ status: 1 });
workerSchema.index({ category: 1 });
workerSchema.index({ city: 1 });
workerSchema.index({ verified: 1 });
workerSchema.index({ featured: 1 });

// Hash password before saving
workerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.default.genSalt(10);
  this.password = await bcrypt.default.hash(this.password, salt);
  next();
});

// Compare password method
workerSchema.methods.comparePassword = async function(enteredPassword) {
  const bcrypt = await import('bcryptjs');
  return await bcrypt.default.compare(enteredPassword, this.password);
};

export default mongoose.model('Worker', workerSchema);
