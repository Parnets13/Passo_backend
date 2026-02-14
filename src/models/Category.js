import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  workerTypes: {
    type: [String],
    enum: ['Worker', 'Crew / Team', 'Contractor', 'Service Provider'],
    default: [],
    required: [true, 'At least one worker type is required']
  },
  icon: String,
  description: String,
  totalWorkers: {
    type: Number,
    default: 0
  },
  totalUnlocks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

categorySchema.index({ active: 1 });

export default mongoose.model('Category', categorySchema);
