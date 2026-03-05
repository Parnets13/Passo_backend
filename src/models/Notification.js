import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['Push', 'Banner', 'Both'],
    default: 'Push'
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Specific', 'City', 'Category'],
    default: 'All'
  },
  cities: [{
    type: String
  }],
  categories: [{
    type: String
  }],
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }],
  bannerImage: {
    type: String
  },
  bannerPosition: {
    type: String,
    enum: ['Top', 'Middle', 'Bottom'],
    default: 'Top'
  },
  bannerLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sent', 'Failed'],
    default: 'Draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  sentCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for delivery rate
notificationSchema.virtual('deliveryRate').get(function() {
  const total = this.sentCount + this.failedCount;
  if (total === 0) return 0;
  return ((this.sentCount / total) * 100).toFixed(2);
});

// Virtual for click-through rate
notificationSchema.virtual('clickThroughRate').get(function() {
  if (this.sentCount === 0) return 0;
  return ((this.clickCount / this.sentCount) * 100).toFixed(2);
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
