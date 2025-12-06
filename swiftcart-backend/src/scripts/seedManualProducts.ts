import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import logger from '../utils/logger';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ManualProductInput {
  name: string;
  description: string;
  priceUsd: number;
  originalPriceUsd?: number;
  imageUrl: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  category: string;
  subcategory: string;
  amazonUrl?: string;
}

const seedManualProducts = async () => {
  try {
    logger.info('🌱 Starting manual product seed...');
    console.log('🌱 Starting manual product seed...\n');

    // Connect to database
    await connectDatabase();

    // Drop problematic index if it exists
    try {
      await Product.collection.dropIndex('variants.sku_1');
      logger.info('Dropped old variants.sku index');
    } catch (error: any) {
      if (error.code !== 27 && error.codeName !== 'IndexNotFound') {
        logger.warn('Could not drop index', { error: error.message });
      }
    }

    // Read manual products JSON file
    const manualProductsPath = path.join(__dirname, 'data', 'manualProducts.json');
    
    if (!fs.existsSync(manualProductsPath)) {
      console.error('❌ manualProducts.json file not found!');
      console.error(`   Expected location: ${manualProductsPath}`);
      console.error('   Please create the file and add your products.\n');
      process.exit(1);
    }

    const manualProductsData = JSON.parse(
      fs.readFileSync(manualProductsPath, 'utf-8')
    ) as ManualProductInput[];

    if (!Array.isArray(manualProductsData) || manualProductsData.length === 0) {
      console.error('❌ No products found in manualProducts.json!');
      console.error('   Please add products to the file.\n');
      process.exit(1);
    }

    console.log(`📦 Found ${manualProductsData.length} products to import\n`);

    const products = manualProductsData.map((product) => {
      // Convert USD to KES (in cents)
      const price = Math.round(product.priceUsd * 130 * 100);
      const originalPrice = product.originalPriceUsd
        ? Math.round(product.originalPriceUsd * 130 * 100)
        : undefined;

      // Generate slug
      const slug = `${product.category}-${product.subcategory}-${product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${faker.string.alphanumeric(4)}`;

      // Generate SKU
      const sku = `${product.category.toUpperCase().substring(0, 3)}-${product.subcategory
        .toUpperCase()
        .substring(0, 3)}-${faker.string.alphanumeric(6).toUpperCase()}`;

      // Generate stock
      const stock = faker.number.int({ min: 10, max: 200 });
      const lowStockThreshold = Math.max(5, Math.floor(stock * 0.1));

      // Determine if featured (10% chance)
      const featured = faker.datatype.boolean({ probability: 0.1 });

      return {
        name: product.name,
        slug,
        description: product.description,
        price,
        originalPrice,
        category: product.category,
        image: product.imageUrl,
        images: product.images && product.images.length > 0 ? product.images : [product.imageUrl],
        rating: Math.min(5.0, Math.max(1.0, product.rating)),
        reviewCount: Math.max(0, product.reviewCount),
        stock,
        lowStockThreshold,
        sku,
        featured,
        createdAt: faker.date.recent({ days: 90 }),
      };
    });

    // Insert products into database
    const createdProducts = await Product.insertMany(products, {
      ordered: false, // Continue on duplicate key errors
    });

    // Create inventory records
    const inventoryRecords = createdProducts.map((product) => ({
      product: product._id,
      sku: product.sku,
      quantity: product.stock,
      lowStockThreshold: product.lowStockThreshold,
    }));

    await Inventory.insertMany(inventoryRecords, {
      ordered: false,
    });

    // Summary
    logger.info('Manual product seeding completed', {
      totalProducts: createdProducts.length,
    });

    console.log(`✅ Manual product seeding completed!`);
    console.log(`   📦 Total products created: ${createdProducts.length}\n`);

    process.exit(0);
  } catch (error: any) {
    logger.error('Error seeding manual products', {
      error: error.message,
      stack: error.stack,
    });
    console.error('❌ Error seeding manual products:', error);
    process.exit(1);
  }
};

// Run seed if called directly
seedManualProducts();

export default seedManualProducts;

