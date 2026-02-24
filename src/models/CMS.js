import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['terms', 'privacy', 'consent', 'about', 'help'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

export default mongoose.model('CMS', cmsSchema);
