import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  variants?: IProductVariant[];
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true }, // Removed unique: true - uniqueness is enforced at product level
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  attributes: { type: Map, of: String, default: {} },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
// Note: slug and sku already have indexes from 'unique: true'
ProductSchema.index({ category: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Text search index
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual for checking if product is low stock
ProductSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Pre-save middleware to ensure slug is set from name if not provided
ProductSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

