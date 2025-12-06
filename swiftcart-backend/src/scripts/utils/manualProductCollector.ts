import { faker } from '@faker-js/faker';

export interface ManualProduct {
  name: string;
  description: string;
  price: number; // in cents (KES)
  originalPrice?: number; // in cents (KES)
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  subcategory: string;
  url?: string;
}

/**
 * Helper function to convert USD price to KES (in cents)
 */
export function usdToKesCents(usdPrice: number): number {
  // 1 USD ≈ 130 KES, convert to cents
  return Math.round(usdPrice * 130 * 100);
}

/**
 * Helper function to create a product from manual input
 */
export function createProductFromManualInput(
  name: string,
  description: string,
  priceUsd: number,
  originalPriceUsd?: number,
  imageUrl: string = '',
  images: string[] = [],
  rating: number = 4.0,
  reviewCount: number = 0,
  category: string = '',
  subcategory: string = '',
  amazonUrl?: string
): ManualProduct {
  return {
    name,
    description,
    price: usdToKesCents(priceUsd),
    originalPrice: originalPriceUsd ? usdToKesCents(originalPriceUsd) : undefined,
    image: imageUrl,
    images: images.length > 0 ? images : [imageUrl],
    rating: Math.min(5.0, Math.max(1.0, rating)),
    reviewCount: Math.max(0, reviewCount),
    category,
    subcategory,
    url: amazonUrl,
  };
}

/**
 * Template for manual product collection
 * Copy this structure and fill in the details from Amazon
 */
export const manualProductTemplate = {
  name: 'Product Name from Amazon',
  description: 'Product description from Amazon (copy the key features)',
  priceUsd: 29.99, // Price in USD from Amazon
  originalPriceUsd: 39.99, // Original price if on sale (optional)
  imageUrl: 'https://m.media-amazon.com/images/I/...', // Main product image URL
  images: [
    'https://m.media-amazon.com/images/I/...', // Additional image 1
    'https://m.media-amazon.com/images/I/...', // Additional image 2
    'https://m.media-amazon.com/images/I/...', // Additional image 3
  ],
  rating: 4.5, // Star rating (1-5)
  reviewCount: 1234, // Number of reviews
  category: 'electronics', // Category slug
  subcategory: 'computers-accessories', // Subcategory slug
  amazonUrl: 'https://www.amazon.com/dp/...', // Amazon product URL
};

