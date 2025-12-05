import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  user: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date;
  replacedBy?: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedBy: {
      type: Schema.Types.ObjectId,
      ref: 'RefreshToken',
      default: null,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
RefreshTokenSchema.index({ user: 1, revokedAt: 1 });
RefreshTokenSchema.index({ token: 1, revokedAt: 1 });

// Method to check if token is valid
RefreshTokenSchema.methods.isValid = function (): boolean {
  return !this.revokedAt && this.expiresAt > new Date();
};

export const RefreshToken: Model<IRefreshToken> = mongoose.model<IRefreshToken>(
  'RefreshToken',
  RefreshTokenSchema
);

