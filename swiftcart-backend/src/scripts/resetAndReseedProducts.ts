import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import logger from '../utils/logger';
import { departmentCategories } from './data/categories';
import { generateProductsForSubcategory } from './utils/productGenerator';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

/**
 * Reset and reseed products with Jumia images
 * This script will:
 * 1. Delete all existing products and inventory
 * 2. Regenerate products using templates with imageUrl (Jumia URLs)
 */
const resetAndReseedProducts = async () => {
  try {
    logger.info('🔄 Starting product reset and reseed...');
    console.log('🔄 Starting product reset and reseed...');
    console.log('⚠️  WARNING: This will delete ALL existing products and inventory!\n');

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

    // Clear existing data
    console.log('🗑️  Clearing existing products and inventory...');
    await Inventory.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data\n');

    let totalProductsCreated = 0;
    let totalCategoriesProcessed = 0;
    let totalSubcategoriesProcessed = 0;

    // Process each category
    for (const category of departmentCategories) {
      totalCategoriesProcessed++;
      console.log(`\n📁 Category: ${category.name} (${category.slug})`);

      for (const subcategory of category.subcategories) {
        // Get templates for this subcategory
        const templates = enhancedProductTemplates[subcategory.slug] || [];

        if (templates.length === 0) {
          console.log(`  ⏭️  Skipping ${subcategory.name} - no templates found`);
          continue;
        }

        console.log(`  🔄 Generating ${templates.length} products for: ${subcategory.name}...`);

        try {
          // Generate products for this subcategory - exact count from templates
          const products = await generateProductsForSubcategory(
            category.name,
            category.slug,
            subcategory.name,
            subcategory.slug,
            templates.length
          );

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

          totalProductsCreated += createdProducts.length;
          totalSubcategoriesProcessed++;

          console.log(`    ✅ Created ${createdProducts.length} products`);

          // Small delay between subcategories to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error: any) {
          // Handle duplicate key errors gracefully
          if (error.code === 11000) {
            console.log(`    ⚠️  Some products already exist, skipping duplicates`);
            // Count how many were actually inserted
            const inserted = error.insertedDocs?.length || 0;
            totalProductsCreated += inserted;
          } else {
            console.error(`    ❌ Error generating products for ${subcategory.name}:`, error.message);
            logger.error('Error generating products', {
              category: category.slug,
              subcategory: subcategory.slug,
              error: error.message,
            });
          }
        }
      }
    }

    // Summary
    logger.info('Product reset and reseed completed', {
      totalProductsCreated,
      totalCategoriesProcessed,
      totalSubcategoriesProcessed,
    });

    console.log('\n\n✅ Product reset and reseed complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Categories processed: ${totalCategoriesProcessed}`);
    console.log(`   Subcategories processed: ${totalSubcategoriesProcessed}`);
    console.log(`   Products created: ${totalProductsCreated}`);
    console.log(`\n✨ All products now have Jumia images from templates!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    logger.error('Fatal error in reset and reseed', { error: error.message });
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

// Run the script
resetAndReseedProducts();

export default resetAndReseedProducts;

