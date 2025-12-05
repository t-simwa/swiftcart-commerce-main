import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrder extends Document {
  user: Types.ObjectId;
  status: OrderStatus;
  items: IOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  transactionId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'Kenya' },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
OrderSchema.index({ user: 1, createdAt: -1 }); // Compound index for user orders
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 }); // Compound index for status filtering with date sorting
OrderSchema.index({ transactionId: 1 }); // For transaction lookups

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

