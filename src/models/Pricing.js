import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Subscription', 'Addon', 'Badge'],
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'star'
  },
  color: {
    type: String,
    default: '#667eea'
  },
  monthlyPrice: {
    type: Number,
    default: 0
  },
  yearlyPrice: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  period: {
    type: String,
    default: ''
  },
  features: [{
    text: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  popular: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  // For addons
  savings: String,
  
  // For badges
  requirements: [String],
  benefits: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
pricingSchema.index({ type: 1, active: 1 });
pricingSchema.index({ id: 1 });

export default mongoose.model('Pricing', pricingSchema);
