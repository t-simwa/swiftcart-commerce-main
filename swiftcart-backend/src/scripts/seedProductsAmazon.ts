import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import logger from '../utils/logger';
import { departmentCategories } from './data/categories';
import { searchAmazonProducts, closeBrowser, getSearchQuery } from './utils/amazonScraper';
import { faker } from '@faker-js/faker';

// Configuration
const PRODUCTS_PER_SUBCATEGORY = 20; // Number of products to scrape per subcategory
const SKIP_EXISTING = false; // Set to true to skip categories that already have products

const seedProductsFromAmazon = async () => {
  try {
    logger.info('🌱 Starting Amazon product scraping...');
    console.log('🌱 Starting Amazon product scraping...');
    console.log(`📊 Scraping ${PRODUCTS_PER_SUBCATEGORY} products per subcategory\n`);
    console.log('⚠️  Note: This may take a while due to rate limiting and delays\n');

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

        console.log(`  🔄 Scraping products for: ${subcategory.name}...`);

        try {
          // Get search query
          const searchQuery = getSearchQuery(category.name, subcategory.name);
          
          // Scrape products from Amazon
          const scrapedProducts = await searchAmazonProducts(searchQuery, PRODUCTS_PER_SUBCATEGORY);

          if (scrapedProducts.length === 0) {
            console.log(`    ⚠️  No products found for ${subcategory.name}`);
            continue;
          }

          // Convert scraped products to our product format
          const products = scrapedProducts.map((scraped) => {
            // Generate slug from name
            const slug = `${category.slug}-${subcategory.slug}-${scraped.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')}-${faker.string.alphanumeric(4)}`;

            // Generate SKU
            const sku = `${category.slug.toUpperCase().substring(0, 3)}-${subcategory.slug
              .toUpperCase()
              .substring(0, 3)}-${faker.string.alphanumeric(6).toUpperCase()}`;

            // Generate stock
            const stock = faker.number.int({ min: 10, max: 200 });
            const lowStockThreshold = Math.max(5, Math.floor(stock * 0.1));

            // Determine if featured (10% chance)
            const featured = faker.datatype.boolean({ probability: 0.1 });

            return {
              name: scraped.name,
              slug,
              description: scraped.description,
              price: scraped.price,
              originalPrice: scraped.originalPrice,
              category: category.slug,
              image: scraped.image,
              images: scraped.images.length > 0 ? scraped.images : [scraped.image],
              rating: scraped.rating,
              reviewCount: scraped.reviewCount,
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

          totalProductsCreated += createdProducts.length;
          totalSubcategoriesProcessed++;

          console.log(`    ✅ Created ${createdProducts.length} products from Amazon`);

          // Longer delay between subcategories to avoid rate limiting
          const delaySeconds = 15 + Math.floor(Math.random() * 10); // 15-25 seconds
          console.log(`    ⏳ Waiting ${delaySeconds} seconds before next subcategory...`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        } catch (error: any) {
          // Handle duplicate key errors gracefully
          if (error.code === 11000) {
            console.log(`    ⚠️  Some products already exist, skipping duplicates`);
            // Count how many were actually inserted
            const inserted = error.insertedDocs?.length || 0;
            totalProductsCreated += inserted;
          } else {
            console.error(`    ❌ Error scraping products for ${subcategory.name}:`, error.message);
            logger.error('Error scraping products', {
              category: category.slug,
              subcategory: subcategory.slug,
              error: error.message,
            });
          }
        }
      }
    }

    // Close browser
    await closeBrowser();

    // Summary
    logger.info('Amazon product scraping completed', {
      totalProducts: totalProductsCreated,
      categories: totalCategoriesProcessed,
      subcategories: totalSubcategoriesProcessed,
    });

    console.log(`\n✅ Amazon product scraping completed!`);
    console.log(`   📦 Total products created: ${totalProductsCreated}`);
    console.log(`   📁 Categories processed: ${totalCategoriesProcessed}`);
    console.log(`   📂 Subcategories processed: ${totalSubcategoriesProcessed}`);
    console.log(`\n💡 All products have been scraped from Amazon with real data and images.\n`);

    process.exit(0);
  } catch (error: any) {
    // Close browser on error
    await closeBrowser();
    
    logger.error('Error scraping products from Amazon', {
      error: error.message,
      stack: error.stack,
    });
    console.error('❌ Error scraping products from Amazon:', error);
    process.exit(1);
  }
};

// Run seed if called directly
seedProductsFromAmazon();

export default seedProductsFromAmazon;

