export interface Product {
  _id?: string; // MongoDB ID
  id?: string; // Fallback ID for compatibility
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
  variants?: ProductVariant[];
  featured?: boolean;
  createdAt: string | Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}
