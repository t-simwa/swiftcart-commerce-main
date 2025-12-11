import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { enhancedProductTemplates } from './utils/enhancedProductTemplates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output file for image URLs
const IMAGE_URLS_FILE = path.join(__dirname, 'utils', 'product-image-urls.json');

interface ProductImageEntry {
  category: string;
  index: number;
  brand: string;
  model: string;
  baseName: string;
  keywords: string;
  googleSearchUrl: string;
  selectedImageUrl?: string; // User will add this manually
  localImageUrl?: string; // Generated after download
}

/**
 * Generate Google Images search URL
 */
function generateGoogleImagesUrl(keywords: string): string {
  // URL encode the search query
  const encodedQuery = encodeURIComponent(keywords);
  return `https://www.google.com/search?tbm=isch&q=${encodedQuery}`;
}

/**
 * Generate image search URLs for all products
 */
async function generateImageSearchUrls() {
  try {
    console.log('🔍 Generating Google Images search URLs for all products...\n');

    const entries: ProductImageEntry[] = [];

    // Process each category
    for (const category in enhancedProductTemplates) {
      const products = enhancedProductTemplates[category];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const keywords = product.imageKeywords || `${product.brand} ${product.model} ${product.baseName}`;
        
        const entry: ProductImageEntry = {
          category,
          index: i,
          brand: product.brand,
          model: product.model,
          baseName: product.baseName,
          keywords,
          googleSearchUrl: generateGoogleImagesUrl(keywords),
        };

        entries.push(entry);
      }
    }

    // Save to JSON file
    await fs.writeFile(
      IMAGE_URLS_FILE,
      JSON.stringify(entries, null, 2),
      'utf-8'
    );

    console.log(`✅ Generated ${entries.length} search URLs`);
    console.log(`📁 Saved to: ${IMAGE_URLS_FILE}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Open the JSON file and review the Google Images search URLs');
    console.log('   2. For each product, visit the Google Images URL');
    console.log('   3. Right-click on a suitable image and "Copy image address"');
    console.log('   4. Add the image URL to the "selectedImageUrl" field in the JSON');
    console.log('   5. Run: npm run download:images\n');
    console.log('💡 Tip: You can open multiple URLs at once by copying them to your browser');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
generateImageSearchUrls()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

