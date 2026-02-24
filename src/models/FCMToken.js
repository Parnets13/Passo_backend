import mongoose from 'mongoose';

const fcmTokenSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown'
  },
  deviceInfo: {
    model: String,
    osVersion: String,
    appVersion: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  failureCount: {
    type: Number,
    default: 0
  },
  lastFailure: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
fcmTokenSchema.index({ worker: 1, isActive: 1 });
fcmTokenSchema.index({ token: 1 });

// Method to mark token as failed
fcmTokenSchema.methods.markAsFailed = async function() {
  this.failureCount += 1;
  this.lastFailure = new Date();
  
  // Deactivate token after 3 consecutive failures
  if (this.failureCount >= 3) {
    this.isActive = false;
  }
  
  await this.save();
};

// Method to mark token as successful
fcmTokenSchema.methods.markAsSuccessful = async function() {
  this.failureCount = 0;
  this.lastFailure = null;
  this.lastUsed = new Date();
  this.isActive = true;
  await this.save();
};

export default mongoose.model('FCMToken', fcmTokenSchema);
