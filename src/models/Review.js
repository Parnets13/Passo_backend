import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Worker reference is required']
  },
  workerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional - can be anonymous
  },
  userName: {
    type: String,
    default: 'Anonymous'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
reviewSchema.index({ worker: 1 });
reviewSchema.index({ category: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Update worker's rating when review is approved
reviewSchema.post('save', async function() {
  if (this.status === 'Approved') {
    const Worker = mongoose.model('Worker');
    const worker = await Worker.findById(this.worker);
    
    if (worker) {
      // Calculate new average rating
      const Review = mongoose.model('Review');
      const reviews = await Review.find({ 
        worker: this.worker, 
        status: 'Approved' 
      });
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      worker.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
      worker.totalReviews = reviews.length;
      await worker.save();
    }
  }
});

export default mongoose.model('Review', reviewSchema);
