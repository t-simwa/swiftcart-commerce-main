import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Indexes for performance
ReviewSchema.index({ product: 1, rating: -1 });
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });

// Pre-save validation
ReviewSchema.pre('save', function (next) {
  // Ensure rating is an integer between 1 and 5
  if (this.rating < 1 || this.rating > 5) {
    return next(new Error('Rating must be between 1 and 5'));
  }
  next();
});

export const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);

