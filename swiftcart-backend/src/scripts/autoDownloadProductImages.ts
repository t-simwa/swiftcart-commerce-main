import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// API Configuration - Try SerpAPI first, fallback to Bing
const SERPAPI_KEY = process.env.SERPAPI_KEY; // Optional - for Google Images via SerpAPI
const BING_API_KEY = process.env.BING_IMAGE_SEARCH_API_KEY; // Optional - for Bing Image Search
const SERPAPI_URL = 'https://serpapi.com/search.json';
const BING_API_URL = 'https://api.bing.microsoft.com/v7.0/images/search';

// Image storage configuration
const IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const IMAGES_BASE_URL = '/uploads/products';

// Rate limiting
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between requests

// Progress tracking file
const PROGRESS_FILE = path.join(__dirname, 'utils', '.auto-image-progress.json');

interface ProgressData {
  processedProducts: Set<string>;
  lastProcessedIndex: Record<string, number>;
  failedProducts: Array<{ category: string; index: number; keywords: string; error: string }>;
}

interface ImageSearchResult {
  imageUrl: string;
  thumbnailUrl?: string;
  source?: string;
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
 * Search Google Images via SerpAPI
 */
async function searchGoogleImagesViaSerpAPI(keywords: string): Promise<ImageSearchResult | null> {
  if (!SERPAPI_KEY) {
    return null;
  }

  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_images',
        q: keywords,
        api_key: SERPAPI_KEY,
        num: 5, // Get top 5 results
        safe: 'active',
      },
      timeout: 10000,
    });

    if (response.data.images_results && response.data.images_results.length > 0) {
      // Select the first result (usually the most relevant)
      const image = response.data.images_results[0];
      return {
        imageUrl: image.original || image.link,
        thumbnailUrl: image.thumbnail,
        source: 'SerpAPI (Google Images)',
      };
    }

    return null;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('   ⚠️  SerpAPI authentication failed, trying Bing...');
    }
    return null;
  }
}

/**
 * Search Bing Images API
 */
async function searchBingImages(keywords: string): Promise<ImageSearchResult | null> {
  if (!BING_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(BING_API_URL, {
      params: {
        q: keywords,
        count: 5, // Get top 5 results
        safeSearch: 'Strict',
        imageType: 'Photo',
        size: 'Large', // Prefer larger images
      },
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY,
      },
      timeout: 10000,
    });

    if (response.data.value && response.data.value.length > 0) {
      // Select the first result
      const image = response.data.value[0];
      return {
        imageUrl: image.contentUrl,
        thumbnailUrl: image.thumbnailUrl,
        source: 'Bing Image Search',
      };
    }

    return null;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('   ⚠️  Bing API authentication failed');
    }
    return null;
  }
}

/**
 * Search for product image using available APIs
 */
async function searchProductImage(keywords: string): Promise<ImageSearchResult | null> {
  // Try SerpAPI first (Google Images)
  const serpResult = await searchGoogleImagesViaSerpAPI(keywords);
  if (serpResult) {
    return serpResult;
  }

  // Fallback to Bing Image Search
  const bingResult = await searchBingImages(keywords);
  if (bingResult) {
    return bingResult;
  }

  return null;
}

/**
 * Download image from URL and save to local storage
 */
async function downloadAndSaveImage(
  imageUrl: string,
  category: string,
  productId: string,
  entryIndex: number
): Promise<string> {
  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Generate filename
  const sanitizedCategory = category.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const sanitizedProductId = productId.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  
  // Try to get file extension from URL
  let fileExtension = '.jpg';
  try {
    const urlPath = new URL(imageUrl).pathname;
    const ext = path.extname(urlPath);
    if (ext && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase())) {
      fileExtension = ext.toLowerCase();
    }
  } catch {
    // Default to .jpg
  }

  const filename = `${sanitizedCategory}-${sanitizedProductId}-${entryIndex}${fileExtension}`;
  const filePath = path.join(IMAGES_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(filePath);
    return `${IMAGES_BASE_URL}/${filename}`;
  } catch {
    // File doesn't exist, proceed with download
  }

  try {
    // Download image with proper headers
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.google.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Accept 2xx and 3xx
    });

    // Validate content type
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Save to file
    await fs.writeFile(filePath, Buffer.from(response.data));

    return `${IMAGES_BASE_URL}/${filename}`;
  } catch (error: any) {
    throw new Error(`Failed to download: ${error.message}`);
  }
}

/**
 * Get product identifier for tracking
 */
function getProductId(category: string, index: number, product: any): string {
  return `${category}:${index}:${product.brand}:${product.model}`;
}

/**
 * Main function to automatically fetch and download images
 */
async function autoDownloadProductImages() {
  try {
    // Check for API keys
    if (!SERPAPI_KEY && !BING_API_KEY) {
      console.error('❌ Error: No API keys configured');
      console.log('\n📝 You need at least one API key:');
      console.log('\nOption 1: SerpAPI (Google Images) - Recommended');
      console.log('   1. Sign up at https://serpapi.com/ (100 free searches/month)');
      console.log('   2. Get your API key from dashboard');
      console.log('   3. Add to .env: SERPAPI_KEY=your_key_here\n');
      console.log('Option 2: Bing Image Search API');
      console.log('   1. Go to https://portal.azure.com/');
      console.log('   2. Create a Bing Search v7 resource');
      console.log('   3. Get your API key');
      console.log('   4. Add to .env: BING_IMAGE_SEARCH_API_KEY=your_key_here\n');
      process.exit(1);
    }

    console.log('🤖 Starting automatic image download...\n');
    
    if (SERPAPI_KEY) {
      console.log('✅ SerpAPI (Google Images) configured');
    }
    if (BING_API_KEY) {
      console.log('✅ Bing Image Search API configured');
    }
    console.log(`📁 Images will be saved to: ${IMAGES_DIR}\n`);

    // Ensure images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Load progress
    const progress = await loadProgress();
    console.log(`📊 Progress: ${progress.processedProducts.size} products already processed\n`);

    let totalProducts = 0;
    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Count total products
    for (const category in enhancedProductTemplates) {
      totalProducts += enhancedProductTemplates[category].length;
    }

    console.log(`📦 Total products: ${totalProducts}\n`);

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

        // Skip if resuming
        if (i <= lastIndex) {
          skippedCount++;
          continue;
        }

        processedCount++;
        const keywords = product.imageKeywords || `${product.brand} ${product.model} ${product.baseName}`;

        console.log(`\n[${processedCount}/${totalProducts}] ${product.brand} ${product.model}`);
        console.log(`   🔍 Searching: ${keywords}`);

        try {
          // Search for image
          const searchResult = await searchProductImage(keywords);

          if (searchResult && searchResult.imageUrl) {
            console.log(`   ✅ Found via ${searchResult.source}`);
            console.log(`   📥 Downloading: ${searchResult.imageUrl.substring(0, 60)}...`);

            // Download and save image
            const localImageUrl = await downloadAndSaveImage(
              searchResult.imageUrl,
              category,
              productId,
              i
            );

            // Update product with local image URL
            product.imageUrl = localImageUrl;
            updatedCount++;
            console.log(`   ✅ Saved: ${localImageUrl}`);

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

          // Rate limiting delay
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
        }
      }
    }

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
    console.log('\n\n✅ Automatic download complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total products: ${totalProducts}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   ✅ Updated: ${updatedCount}`);
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
autoDownloadProductImages()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

