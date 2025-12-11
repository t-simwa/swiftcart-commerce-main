import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image storage configuration
const IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const IMAGES_BASE_URL = '/uploads/products';

// Image URLs file
const IMAGE_URLS_FILE = path.join(__dirname, 'utils', 'product-image-urls.json');

interface ProductImageEntry {
  category: string;
  index: number;
  brand: string;
  model: string;
  baseName: string;
  keywords: string;
  googleSearchUrl: string;
  selectedImageUrl?: string;
  localImageUrl?: string;
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

  // Generate filename: category-productId-index.jpg
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
    // If URL parsing fails, default to .jpg
  }

  const filename = `${sanitizedCategory}-${sanitizedProductId}-${entryIndex}${fileExtension}`;
  const filePath = path.join(IMAGES_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(filePath);
    console.log(`   📁 Image already exists: ${filename}`);
    return `${IMAGES_BASE_URL}/${filename}`;
  } catch {
    // File doesn't exist, proceed with download
  }

  try {
    // Download image with proper headers to avoid blocking
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.google.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      maxRedirects: 5,
    });

    // Validate that it's actually an image
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Save to file
    await fs.writeFile(filePath, Buffer.from(response.data));

    console.log(`   ✅ Downloaded: ${filename}`);
    return `${IMAGES_BASE_URL}/${filename}`;
  } catch (error: any) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Download all selected images
 */
async function downloadSelectedImages() {
  try {
    console.log('📥 Starting image download from selected URLs...\n');

    // Read the image URLs file
    let entries: ProductImageEntry[];
    try {
      const fileContent = await fs.readFile(IMAGE_URLS_FILE, 'utf-8');
      entries = JSON.parse(fileContent);
    } catch (error: any) {
      console.error('❌ Error reading image URLs file:', error.message);
      console.log('\n💡 Run "npm run generate:image-urls" first to create the file\n');
      process.exit(1);
    }

    // Filter entries that have selectedImageUrl
    const entriesToDownload = entries.filter(entry => entry.selectedImageUrl);
    
    if (entriesToDownload.length === 0) {
      console.log('⚠️  No images selected for download.');
      console.log('   Please add "selectedImageUrl" entries to the JSON file first.\n');
      process.exit(0);
    }

    console.log(`📦 Found ${entriesToDownload.length} images to download\n`);
    console.log(`📁 Images will be saved to: ${IMAGES_DIR}\n`);

    // Ensure images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    let successCount = 0;
    let failCount = 0;
    const failedEntries: ProductImageEntry[] = [];

    // Download each image
    for (let i = 0; i < entriesToDownload.length; i++) {
      const entry = entriesToDownload[i];
      const productId = `${entry.brand}-${entry.model}`;
      
      console.log(`\n[${i + 1}/${entriesToDownload.length}] ${entry.brand} ${entry.model}`);
      console.log(`   🔗 URL: ${entry.selectedImageUrl?.substring(0, 80)}...`);

      try {
        const localImageUrl = await downloadAndSaveImage(
          entry.selectedImageUrl!,
          entry.category,
          productId,
          entry.index
        );

        // Update entry with local URL
        entry.localImageUrl = localImageUrl;

        // Update the product template
        const categoryProducts = enhancedProductTemplates[entry.category];
        if (categoryProducts && categoryProducts[entry.index]) {
          categoryProducts[entry.index].imageUrl = localImageUrl;
        }

        successCount++;

        // Small delay to be respectful
        if (i < entriesToDownload.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        failCount++;
        failedEntries.push(entry);
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    // Save updated entries back to file
    await fs.writeFile(
      IMAGE_URLS_FILE,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );

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
    console.log('\n\n✅ Download complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total images: ${entriesToDownload.length}`);
    console.log(`   ✅ Successfully downloaded: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    if (failedEntries.length > 0) {
      console.log(`\n⚠️  Failed downloads:`);
      failedEntries.forEach((entry) => {
        console.log(`   - ${entry.category}[${entry.index}]: ${entry.brand} ${entry.model}`);
      });
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

    // Detect product properties to identify the product
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
downloadSelectedImages()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

