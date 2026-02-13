import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Push', 'Banner', 'Announcement'],
    default: 'Push'
  },
  targetAudience: {
    type: String,
    enum: ['All', 'City', 'Category', 'Custom'],
    default: 'All'
  },
  
  // Filters
  cities: [String],
  categories: [String],
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Banner specific
  bannerImage: String,
  bannerPosition: {
    type: String,
    enum: ['Top', 'Middle', 'Bottom']
  },
  bannerLink: String,
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sent', 'Failed'],
    default: 'Draft'
  },
  scheduledAt: Date,
  sentAt: Date,
  
  // Stats
  totalRecipients: {
    type: Number,
    default: 0
  },
  deliveredCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
