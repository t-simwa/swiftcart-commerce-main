import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';

const productsData = [
  {
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    description: "Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions for all-day wear.",
    price: 12999,
    originalPrice: 15999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 2456,
    stock: 45,
    lowStockThreshold: 10,
    sku: "WH-PRO-001",
    featured: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    name: "Smart Watch Pro",
    slug: "smart-watch-pro",
    description: "Stay connected and track your fitness with our advanced smartwatch. Features heart rate monitoring, GPS, and a stunning AMOLED display.",
    price: 24999,
    originalPrice: 29999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    rating: 4.6,
    reviewCount: 1823,
    stock: 28,
    lowStockThreshold: 15,
    sku: "SW-PRO-002",
    featured: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    name: "Designer Leather Bag",
    slug: "designer-leather-bag",
    description: "Handcrafted genuine leather bag with premium stitching and brass hardware. Perfect for professionals who appreciate quality.",
    price: 8999,
    originalPrice: 11999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    rating: 4.9,
    reviewCount: 567,
    stock: 12,
    lowStockThreshold: 5,
    sku: "LB-DES-003",
    featured: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    description: "Powerful 360° sound in a compact design. Waterproof, dustproof, and ready for any adventure with 20 hours of playtime.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    rating: 4.5,
    reviewCount: 3421,
    stock: 156,
    lowStockThreshold: 30,
    sku: "BS-PORT-004",
    createdAt: new Date("2024-02-10"),
  },
  {
    name: "Running Shoes Elite",
    slug: "running-shoes-elite",
    description: "Engineered for performance with responsive cushioning and breathable mesh upper. Perfect for marathon training or daily runs.",
    price: 7499,
    originalPrice: 8999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    rating: 4.7,
    reviewCount: 892,
    stock: 67,
    lowStockThreshold: 20,
    sku: "RS-ELT-005",
    featured: true,
    createdAt: new Date("2024-02-15"),
  },
  {
    name: "Minimalist Desk Lamp",
    slug: "minimalist-desk-lamp",
    description: "Sleek LED desk lamp with adjustable brightness and color temperature. USB charging port included.",
    price: 3499,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
    rating: 4.4,
    reviewCount: 234,
    stock: 89,
    lowStockThreshold: 25,
    sku: "DL-MIN-006",
    createdAt: new Date("2024-02-20"),
  },
  {
    name: "Organic Cotton T-Shirt",
    slug: "organic-cotton-tshirt",
    description: "Ultra-soft organic cotton t-shirt with a relaxed fit. Sustainably sourced and ethically made.",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    rating: 4.3,
    reviewCount: 1567,
    stock: 234,
    lowStockThreshold: 50,
    sku: "TS-ORG-007",
    createdAt: new Date("2024-02-25"),
  },
  {
    name: "Professional Camera Lens",
    slug: "professional-camera-lens",
    description: "50mm f/1.4 prime lens for stunning portraits and low-light photography. Sharp, fast autofocus.",
    price: 45999,
    originalPrice: 52999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&h=600&fit=crop",
    rating: 4.9,
    reviewCount: 189,
    stock: 8,
    lowStockThreshold: 5,
    sku: "CL-PRO-008",
    createdAt: new Date("2024-03-01"),
  },
];

const seedProducts = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDatabase();

    // Drop problematic index if it exists
    try {
      await Product.collection.dropIndex('variants.sku_1');
      console.log('🗑️  Dropped old variants.sku index');
    } catch (error: any) {
      // Index doesn't exist or already dropped - that's fine
      if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
        console.log('⚠️  Could not drop index (may not exist):', error.message);
      }
    }

    // Clear existing products and inventory
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Inventory.deleteMany({});

    // Insert products
    console.log('📦 Inserting products...');
    const createdProducts = await Product.insertMany(productsData);

    // Create inventory records
    console.log('📊 Creating inventory records...');
    const inventoryRecords = createdProducts.map((product) => ({
      product: product._id,
      sku: product.sku,
      quantity: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    }));

    await Inventory.insertMany(inventoryRecords);

    console.log(`✅ Successfully seeded ${createdProducts.length} products`);
    console.log(`✅ Successfully created ${inventoryRecords.length} inventory records`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
seedProducts();

export default seedProducts;

