import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';
export type PaymentGateway = 'mpesa' | 'card' | 'bank';

export interface ITransaction extends Document {
  order: Types.ObjectId;
  txnRef: string;
  gateway: PaymentGateway;
  amount: number;
  status: TransactionStatus;
  phoneNumber?: string; // For M-Pesa
  mpesaReceiptNumber?: string;
  mpesaCheckoutRequestId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    txnRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    gateway: {
      type: String,
      enum: ['mpesa', 'card', 'bank'],
      required: true,
      default: 'mpesa',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    mpesaReceiptNumber: {
      type: String,
      trim: true,
    },
    mpesaCheckoutRequestId: {
      type: String,
      trim: true,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TransactionSchema.index({ txnRef: 1 });
TransactionSchema.index({ order: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ createdAt: -1 });

// Generate unique transaction reference
TransactionSchema.pre('save', async function (next) {
  if (!this.txnRef) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.txnRef = `TXN-${timestamp}-${random}`;
  }
  next();
});

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', TransactionSchema);

