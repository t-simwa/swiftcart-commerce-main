import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import logger from '../utils/logger';
import { departmentCategories } from './data/categories';
import { generateProductsForSubcategory } from './utils/productGenerator';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

// Configuration
const SKIP_EXISTING = false; // Set to true to skip categories that already have products

const seedProducts = async () => {
  try {
    logger.info('🌱 Starting product seed...');
    console.log('🌱 Starting product seed...');
    console.log(`📊 Generating products from enhanced templates (exact count per subcategory)\n`);

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

    let totalProductsCreated = 0;
    let totalCategoriesProcessed = 0;
    let totalSubcategoriesProcessed = 0;

    // Process each category
    for (const category of departmentCategories) {
      console.log(`\n📦 Processing category: ${category.name}`);
      totalCategoriesProcessed++;

      // Process each subcategory (skip "All" subcategories)
      const subcategories = category.subcategories.filter(
        sub => !sub.slug.startsWith('all-')
      );

      for (const subcategory of subcategories) {
        // Check if we should skip existing products
        if (SKIP_EXISTING) {
          const existingCount = await Product.countDocuments({
            category: category.slug,
          });
          if (existingCount > 0) {
            console.log(`  ⏭️  Skipping ${subcategory.name} (products already exist)`);
            continue;
          }
        }

        // Get the number of templates for this subcategory
        const templates = enhancedProductTemplates[subcategory.slug] || [];
        if (templates.length === 0) {
          console.log(`  ⏭️  Skipping ${subcategory.name} (no enhanced templates available)`);
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
    logger.info('Product seeding completed', {
      totalProducts: totalProductsCreated,
      categories: totalCategoriesProcessed,
      subcategories: totalSubcategoriesProcessed,
    });

    console.log(`\n✅ Product seeding completed!`);
    console.log(`   📦 Total products created: ${totalProductsCreated}`);
    console.log(`   📁 Categories processed: ${totalCategoriesProcessed}`);
    console.log(`   📂 Subcategories processed: ${totalSubcategoriesProcessed}`);
    console.log(`\n💡 Note: This may take a while due to image fetching.`);
    console.log(`   Each product gets unique images from Unsplash.\n`);

    process.exit(0);
  } catch (error: any) {
    logger.error('Error seeding products', {
      error: error.message,
      stack: error.stack,
    });
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run seed if called directly
seedProducts();

export default seedProducts;

