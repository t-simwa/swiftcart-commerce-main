import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pixabay API configuration
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_API_URL = 'https://pixabay.com/api/';

// Rate limiting: 5,000 requests/hour = ~1 request per 0.72 seconds
// Using 1 second delay for safety and to be respectful
const RATE_LIMIT_DELAY_MS = 1000; // 1 second in milliseconds

// Image storage configuration
const IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const IMAGES_BASE_URL = '/uploads/products'; // URL path for serving images

// Progress tracking file
const PROGRESS_FILE = path.join(__dirname, 'utils', '.image-fetch-progress.json');

interface PixabayImage {
  id: number;
  webformatURL: string; // 640px width
  largeImageURL: string; // 1280px width
  fullHDURL: string; // 1920px width
  imageURL: string; // Full resolution
  previewURL: string; // 150px width
  tags: string;
  user: string;
}

interface PixabaySearchResponse {
  hits: PixabayImage[];
  total: number;
  totalHits: number;
}

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
    // File doesn't exist, return empty progress
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
 * Search Pixabay for an image and return the image object
 */
async function searchPixabayImage(
  keywords: string,
  retries: number = 3
): Promise<PixabayImage | null> {
  if (!PIXABAY_API_KEY) {
    throw new Error('PIXABAY_API_KEY is not set in environment variables');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get<PixabaySearchResponse>(PIXABAY_API_URL, {
        params: {
          key: PIXABAY_API_KEY,
          q: keywords,
          image_type: 'photo',
          orientation: 'horizontal', // Good for product images
          per_page: 3, // Get top 3 results, we'll use the first one
          safesearch: 'true',
          category: 'all', // Search all categories
        },
      });

      if (response.data.hits && response.data.hits.length > 0) {
        return response.data.hits[0];
      }

      return null;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 429) {
          console.error('❌ Rate limit exceeded');
          throw error;
        }

        if (status === 400 || status === 401) {
          throw new Error('Invalid Pixabay API key or bad request. Please check your PIXABAY_API_KEY.');
        }

        if (status >= 500 && attempt < retries) {
          console.warn(`⚠️  Server error (attempt ${attempt}/${retries}), retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      }

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }

  return null;
}

/**
 * Download image from URL and save to local storage
 */
async function downloadAndSaveImage(
  pixabayImage: PixabayImage,
  category: string,
  productId: string
): Promise<string> {
  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Choose best available image URL (prefer largeImageURL, fallback to webformatURL)
  const sourceUrl = pixabayImage.largeImageURL || pixabayImage.webformatURL || pixabayImage.imageURL;
  
  if (!sourceUrl) {
    throw new Error('No valid image URL found in Pixabay response');
  }

  // Generate filename: category-productId-pixabayId.jpg
  const sanitizedCategory = category.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const sanitizedProductId = productId.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const fileExtension = path.extname(new URL(sourceUrl).pathname) || '.jpg';
  const filename = `${sanitizedCategory}-${sanitizedProductId}-${pixabayImage.id}${fileExtension}`;
  const filePath = path.join(IMAGES_DIR, filename);

  // Check if file already exists (skip download if it does)
  try {
    await fs.access(filePath);
    console.log(`   📁 Image already exists: ${filename}`);
    return `${IMAGES_BASE_URL}/${filename}`;
  } catch {
    // File doesn't exist, proceed with download
  }

  try {
    // Download image
    const response = await axios.get(sourceUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });

    // Save to file
    await fs.writeFile(filePath, Buffer.from(response.data));

    // Return the URL path (not full path)
    return `${IMAGES_BASE_URL}/${filename}`;
  } catch (error: any) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Get product identifier for tracking
 */
function getProductId(category: string, index: number, product: any): string {
  return `${category}:${index}:${product.brand}:${product.model}`;
}

/**
 * Main function to fetch images for all products
 */
async function fetchProductImages() {
  try {
    // Validate API key
    if (!PIXABAY_API_KEY) {
      console.error('❌ Error: PIXABAY_API_KEY environment variable is not set');
      console.log('\n📝 To get an API key:');
      console.log('   1. Go to https://pixabay.com/api/docs/');
      console.log('   2. Sign up for a free account at https://pixabay.com/accounts/register/');
      console.log('   3. Get your API key from https://pixabay.com/api/docs/');
      console.log('   4. Add it to your .env file: PIXABAY_API_KEY=your_key_here\n');
      process.exit(1);
    }

    console.log('🖼️  Starting product image fetching from Pixabay...\n');
    console.log(`📁 Images will be saved to: ${IMAGES_DIR}`);
    console.log(`🌐 Images will be served from: ${IMAGES_BASE_URL}\n`);

    // Ensure images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log(`✅ Images directory ready\n`);

    // Load progress
    const progress = await loadProgress();
    console.log(`📊 Progress: ${progress.processedProducts.size} products already processed`);
    if (progress.failedProducts.length > 0) {
      console.log(`⚠️  ${progress.failedProducts.length} products failed previously\n`);
    }

    let totalProducts = 0;
    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Count total products
    for (const category in enhancedProductTemplates) {
      totalProducts += enhancedProductTemplates[category].length;
    }

    console.log(`📦 Total products to process: ${totalProducts}\n`);
    console.log(`⏱️  Rate limit: 1 request per second (5,000 requests/hour)\n`);
    console.log(`⏳ Estimated time: ~${Math.ceil(totalProducts / 60)} minutes\n`);

    // Process each category
    for (const category in enhancedProductTemplates) {
      const products = enhancedProductTemplates[category];
      const lastIndex = progress.lastProcessedIndex[category] || -1;

      console.log(`\n📁 Category: ${category} (${products.length} products)`);

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = getProductId(category, i, product);

        // Skip if already processed
        if (progress.processedProducts.has(productId)) {
          skippedCount++;
          continue;
        }

        // Skip if we're resuming and haven't reached the last processed index
        if (i <= lastIndex) {
          skippedCount++;
          continue;
        }

        processedCount++;
        const keywords = product.imageKeywords || `${product.brand} ${product.model} ${product.baseName}`;

        console.log(`\n[${processedCount}/${totalProducts}] Searching: ${keywords}`);

        try {
          // Search for image
          const pixabayImage = await searchPixabayImage(keywords);

          if (pixabayImage) {
            console.log(`   🔍 Found image on Pixabay (ID: ${pixabayImage.id})`);
            
            // Download and save image
            const localImageUrl = await downloadAndSaveImage(pixabayImage, category, productId);
            
            // Update product with local image URL
            product.imageUrl = localImageUrl;
            updatedCount++;
            console.log(`   ✅ Downloaded and saved: ${localImageUrl}`);

            // Mark as processed
            progress.processedProducts.add(productId);
            progress.lastProcessedIndex[category] = i;
          } else {
            failedCount++;
            const errorMsg = 'No images found';
            console.log(`   ⚠️  ${errorMsg}`);
            progress.failedProducts.push({
              category,
              index: i,
              keywords,
              error: errorMsg,
            });
          }

          // Save progress after each product
          await saveProgress(progress);

          // Rate limiting delay (except for the last product)
          if (processedCount < totalProducts) {
            await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
          }
        } catch (error: any) {
          failedCount++;
          const errorMsg = error.message || 'Unknown error';
          console.error(`   ❌ Error: ${errorMsg}`);
          progress.failedProducts.push({
            category,
            index: i,
            keywords,
            error: errorMsg,
          });
          await saveProgress(progress);

          // If rate limited, wait longer
          if (errorMsg.includes('Rate limit') || error.response?.status === 429) {
            console.log(`   ⏸️  Rate limit hit. Waiting 1 hour before continuing...`);
            await new Promise((resolve) => setTimeout(resolve, 60 * 60 * 1000));
          }
        }
      }
    }

    // Save updated templates to file
    console.log('\n\n💾 Saving updated templates to file...');
    const templatesPath = path.join(__dirname, 'utils', 'enhancedProductTemplates.ts');
    const templatesContent = await fs.readFile(templatesPath, 'utf-8');

    // Write updated templates
    // We'll need to reconstruct the file with updated imageUrl fields
    const updatedContent = await generateUpdatedTemplatesFile(
      enhancedProductTemplates,
      templatesContent
    );

    await fs.writeFile(templatesPath, updatedContent, 'utf-8');

    // Summary
    console.log('\n\n✅ Image fetching complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Failed: ${failedCount}`);

    if (progress.failedProducts.length > 0) {
      console.log(`\n⚠️  Failed products (${progress.failedProducts.length}):`);
      progress.failedProducts.forEach((item) => {
        console.log(`   - ${item.category}[${item.index}]: ${item.keywords} (${item.error})`);
      });
    }

    // Clean up progress file if everything succeeded
    if (failedCount === 0) {
      await fs.unlink(PROGRESS_FILE).catch(() => {});
      console.log('\n🧹 Progress file cleaned up');
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Generate updated templates file with image URLs
 * Uses line-by-line parsing to find and update product objects
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
  let productStartLine = -1;
  let lastPropertyLine = -1;
  let hasImageUrl = false;
  let currentProduct: any = null;

  // Build a map of products by category and index
  const productMap = new Map<string, any>();
  for (const category in templates) {
    templates[category].forEach((product: any, index: number) => {
      if (product.imageUrl) {
        productMap.set(`${category}:${index}`, product);
      }
    });
  }

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
      productStartLine = i;
      productIndex++;
      hasImageUrl = false;
      currentProduct = null;
      updatedLines.push(line);
      continue;
    }

    // Detect product object end
    if (trimmed === '},' || trimmed === '}') {
      if (inProductObject && currentProduct && currentProduct.imageUrl && !hasImageUrl) {
        // Insert imageUrl before closing brace
        const indent = '      '; // 6 spaces
        updatedLines.push(`${indent}imageUrl: '${currentProduct.imageUrl}',`);
      }
      inProductObject = false;
      updatedLines.push(line);
      continue;
    }

    // Check if this line has imageUrl
    if (trimmed.includes('imageUrl:')) {
      hasImageUrl = true;
      // Update existing imageUrl if we have a new one
      if (currentProduct && currentProduct.imageUrl) {
        const imageUrlMatch = trimmed.match(/imageUrl:\s*['"]([^'"]*)['"]/);
        if (imageUrlMatch) {
          // Replace the URL
          updatedLines.push(line.replace(imageUrlMatch[0], `imageUrl: '${currentProduct.imageUrl}'`));
          continue;
        }
      }
    }

    // Detect product properties to identify the product
    if (inProductObject && trimmed.startsWith('brand:')) {
      const brandMatch = trimmed.match(/brand:\s*['"]([^'"]*)['"]/);
      if (brandMatch) {
        const brand = brandMatch[1];
        // Look ahead for model
        let model = '';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const modelMatch = lines[j].trim().match(/model:\s*['"]([^'"]*)['"]/);
          if (modelMatch) {
            model = modelMatch[1];
            break;
          }
        }
        
        // Find matching product in templates
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

    // Track last property line (before closing brace)
    if (inProductObject && trimmed && !trimmed.startsWith('//')) {
      lastPropertyLine = updatedLines.length;
    }

    updatedLines.push(line);
  }

  return updatedLines.join('\n');
}

// Run the script
fetchProductImages()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

