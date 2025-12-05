import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInventoryHistory {
  sku: string;
  change: number; // Positive for addition, negative for deduction
  reason: string; // 'order', 'restock', 'adjustment', 'return'
  orderId?: Types.ObjectId;
  userId?: Types.ObjectId; // Admin who made the change
  timestamp: Date;
}

export interface IInventory extends Document {
  product: Types.ObjectId;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  reserved: number; // Quantity reserved for pending orders
  history: IInventoryHistory[];
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryHistorySchema = new Schema<IInventoryHistory>({
  sku: { type: String, required: true },
  change: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['order', 'restock', 'adjustment', 'return'],
    required: true,
  },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const InventorySchema = new Schema<IInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    history: {
      type: [InventoryHistorySchema],
      default: [],
    },
    lastRestocked: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Note: sku and product already have indexes from 'unique: true'
InventorySchema.index({ quantity: 1 });

// Virtual for available quantity (quantity - reserved)
InventorySchema.virtual('available').get(function () {
  return Math.max(0, this.quantity - this.reserved);
});

// Virtual for checking if low stock
InventorySchema.virtual('isLowStock').get(function () {
  return this.quantity > 0 && this.quantity <= this.lowStockThreshold;
});

// Virtual for checking if out of stock
InventorySchema.virtual('isOutOfStock').get(function () {
  return this.quantity === 0;
});

export const Inventory: Model<IInventory> = mongoose.model<IInventory>('Inventory', InventorySchema);

