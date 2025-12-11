import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';
import { searchJumiaProducts, closeBrowser } from './utils/jumiaScraperSimple';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Progress tracking file
const PROGRESS_FILE = path.join(__dirname, 'utils', '.jumia-image-progress.json');

interface ProgressData {
  processedProducts: Set<string>;
  lastProcessedIndex: Record<string, number>;
  failedProducts: Array<{ category: string; index: number; keywords: string; error: string }>;
}

/**
 * Load progress from file
 */
async function loadProgress(): Promise<ProgressData> {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      processedProducts: new Set(parsed.processedProducts || []),
      lastProcessedIndex: parsed.lastProcessedIndex || {},
      failedProducts: parsed.failedProducts || [],
    };
  } catch (error) {
    return {
      processedProducts: new Set(),
      lastProcessedIndex: {},
      failedProducts: [],
    };
  }
}

/**
 * Save progress to file
 */
async function saveProgress(progress: ProgressData): Promise<void> {
  const data = {
    processedProducts: Array.from(progress.processedProducts),
    lastProcessedIndex: progress.lastProcessedIndex,
    failedProducts: progress.failedProducts,
  };
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get product identifier for tracking
 */
function getProductId(category: string, index: number, product: any): string {
  return `${category}:${index}:${product.brand}:${product.model}`;
}

/**
 * Main function to scrape Amazon images for all products
 */
async function scrapeAmazonImages() {
  try {
    console.log('🛒 Starting Jumia image URL extraction for product templates...\n');
    console.log(`📎 Image URLs will be attached directly (no download)\n`);

    // Reset progress - start fresh each run
    // Delete progress file if it exists to start from scratch
    try {
      await fs.unlink(PROGRESS_FILE).catch(() => {});
    } catch (error) {
      // Ignore if file doesn't exist
    }
    
    // Initialize fresh progress
    const progress: ProgressData = {
      processedProducts: new Set(),
      lastProcessedIndex: {},
      failedProducts: [],
    };
    console.log(`🔄 Starting fresh - all products will be processed\n`);

    let totalProducts = 0;
    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Count total products
    for (const category in enhancedProductTemplates) {
      totalProducts += enhancedProductTemplates[category].length;
    }

    const CONCURRENT_LIMIT = 8; // Process 8 products simultaneously
    
    console.log(`📦 Total products: ${totalProducts}\n`);
    console.log('⚠️  Note: This will search Jumia for each product\n');
    console.log(`   Processing ${CONCURRENT_LIMIT} products concurrently for maximum speed\n`);
    console.log(`   Estimated time: ~${Math.ceil((totalProducts * 1.5) / CONCURRENT_LIMIT / 60)} minutes\n`);

    // Collect all products with their metadata
    interface ProductTask {
      category: string;
      index: number;
      product: any;
      productId: string;
    }
    
    const allProducts: ProductTask[] = [];
    for (const category in enhancedProductTemplates) {
      const products = enhancedProductTemplates[category];
      for (let i = 0; i < products.length; i++) {
        allProducts.push({
          category,
          index: i,
          product: products[i],
          productId: getProductId(category, i, products[i]),
        });
      }
    }

    // Process products in batches
    const processProduct = async (task: ProductTask, currentIndex: number): Promise<void> => {
      const { category, index, product, productId } = task;
      
      // First try: brand + baseName (e.g., "Logitech Wireless Mouse")
      const primaryKeywords = `${product.brand} ${product.baseName}`.toLowerCase();
      // Fallback: baseName only (e.g., "Wireless Mouse")
      const fallbackKeywords = product.baseName.toLowerCase();

      let jumiaProducts: any[] | null = null;
      let keywords = primaryKeywords;

      try {
        // First search attempt: brand + baseName
        jumiaProducts = await searchJumiaProducts(primaryKeywords, 1);

        // If no results or no image, try fallback search
        if (!jumiaProducts || jumiaProducts.length === 0 || !jumiaProducts[0]?.image) {
          keywords = fallbackKeywords;
          jumiaProducts = await searchJumiaProducts(fallbackKeywords, 1);
        }

        if (jumiaProducts && jumiaProducts.length > 0) {
          const jumiaProduct = jumiaProducts[0];
          
          if (jumiaProduct.image) {
            // Update product with image URL
            product.imageUrl = jumiaProduct.image;
            updatedCount++;
            
            // Mark as processed
            progress.processedProducts.add(productId);
            progress.lastProcessedIndex[category] = index;
            
            console.log(`✅ [${currentIndex}/${totalProducts}] ${product.brand} ${product.model} - Image found`);
          } else {
            failedCount++;
            const errorMsg = 'No image found in Jumia result (both attempts)';
            progress.failedProducts.push({
              category,
              index,
              keywords: `${primaryKeywords} → ${fallbackKeywords}`,
              error: errorMsg,
            });
            console.log(`⚠️  [${currentIndex}/${totalProducts}] ${product.brand} ${product.model} - ${errorMsg}`);
          }
        } else {
          failedCount++;
          const errorMsg = 'No products found on Jumia (both attempts)';
          progress.failedProducts.push({
            category,
            index,
            keywords: `${primaryKeywords} → ${fallbackKeywords}`,
            error: errorMsg,
          });
          console.log(`❌ [${currentIndex}/${totalProducts}] ${product.brand} ${product.model} - ${errorMsg}`);
        }
      } catch (error: any) {
        failedCount++;
        const errorMsg = error.message || 'Unknown error';
        progress.failedProducts.push({
          category,
          index,
          keywords,
          error: errorMsg,
        });
        console.log(`❌ [${currentIndex}/${totalProducts}] ${product.brand} ${product.model} - Error: ${errorMsg}`);
      }
    };

    // Process in concurrent batches
    for (let i = 0; i < allProducts.length; i += CONCURRENT_LIMIT) {
      const batch = allProducts.slice(i, i + CONCURRENT_LIMIT);
      
      // Process batch concurrently
      await Promise.allSettled(
        batch.map(async (task, batchIndex) => {
          const currentIndex = i + batchIndex + 1;
          return processProduct(task, currentIndex);
        })
      );
      
      processedCount += batch.length;
      
      // Save progress after each batch (not every product)
      await saveProgress(progress);
      
      // Small delay between batches to avoid overwhelming the server
      if (i + CONCURRENT_LIMIT < allProducts.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Close browser
    await closeBrowser();

    // Update templates file
    console.log('\n\n💾 Updating templates file...');
    const templatesPath = path.join(__dirname, 'utils', 'enhancedProductTemplates.ts');
    const templatesContent = await fs.readFile(templatesPath, 'utf-8');
    const updatedContent = await generateUpdatedTemplatesFile(
      enhancedProductTemplates,
      templatesContent
    );
    await fs.writeFile(templatesPath, updatedContent, 'utf-8');

    // Summary
    console.log('\n\n✅ Jumia image URL extraction complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   ✅ Updated with image URLs: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);

    if (progress.failedProducts.length > 0) {
      console.log(`\n⚠️  Failed products (${progress.failedProducts.length}):`);
      progress.failedProducts.slice(-10).forEach((item) => {
        console.log(`   - ${item.category}[${item.index}]: ${item.keywords}`);
      });
      if (progress.failedProducts.length > 10) {
        console.log(`   ... and ${progress.failedProducts.length - 10} more`);
      }
    }

    // Clean up progress file if everything succeeded
    if (failedCount === 0) {
      await fs.unlink(PROGRESS_FILE).catch(() => {});
      console.log('\n🧹 Progress file cleaned up');
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    // Make sure to close browser on error
    await closeBrowser().catch(() => {});
    process.exit(1);
  }
}

/**
 * Generate updated templates file with image URLs
 */
async function generateUpdatedTemplatesFile(
  templates: any,
  originalContent: string
): Promise<string> {
  const lines = originalContent.split('\n');
  const updatedLines: string[] = [];
  let currentCategory = '';
  let productIndex = -1;
  let inProductObject = false;
  let hasImageUrl = false;
  let currentProduct: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect category start
    if (trimmed.match(/^['"][^'"]+['"]:\s*\[/)) {
      const match = trimmed.match(/^['"]([^'"]+)['"]/);
      if (match) {
        currentCategory = match[1];
        productIndex = -1;
      }
      updatedLines.push(line);
      continue;
    }

    // Detect product object start
    if (trimmed === '{') {
      inProductObject = true;
      productIndex++;
      hasImageUrl = false;
      currentProduct = null;
      updatedLines.push(line);
      continue;
    }

    // Detect product object end
    if (trimmed === '},' || trimmed === '}') {
      if (inProductObject && currentProduct && currentProduct.imageUrl && !hasImageUrl) {
        const indent = '      ';
        updatedLines.push(`${indent}imageUrl: '${currentProduct.imageUrl}',`);
      }
      inProductObject = false;
      updatedLines.push(line);
      continue;
    }

    // Check if this line has imageUrl
    if (trimmed.includes('imageUrl:')) {
      hasImageUrl = true;
      if (currentProduct && currentProduct.imageUrl) {
        const imageUrlMatch = trimmed.match(/imageUrl:\s*['"]([^'"]*)['"]/);
        if (imageUrlMatch) {
          updatedLines.push(line.replace(imageUrlMatch[0], `imageUrl: '${currentProduct.imageUrl}'`));
          continue;
        }
      }
    }

    // Detect product properties
    if (inProductObject && trimmed.startsWith('brand:')) {
      const brandMatch = trimmed.match(/brand:\s*['"]([^'"]*)['"]/);
      if (brandMatch) {
        const brand = brandMatch[1];
        let model = '';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const modelMatch = lines[j].trim().match(/model:\s*['"]([^'"]*)['"]/);
          if (modelMatch) {
            model = modelMatch[1];
            break;
          }
        }
        
        if (currentCategory && productIndex >= 0) {
          const categoryProducts = templates[currentCategory];
          if (categoryProducts && categoryProducts[productIndex]) {
            const templateProduct = categoryProducts[productIndex];
            if (templateProduct.brand === brand && templateProduct.model === model) {
              currentProduct = templateProduct;
            }
          }
        }
      }
    }

    updatedLines.push(line);
  }

  return updatedLines.join('\n');
}

// Run the script
scrapeAmazonImages()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

