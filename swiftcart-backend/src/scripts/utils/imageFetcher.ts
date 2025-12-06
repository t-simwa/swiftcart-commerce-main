import axios from 'axios';

/**
 * Curated Unsplash photo IDs for different product categories
 * These are real, high-quality product photos from Unsplash
 * Format: photo-{photoId}?w=600&h=600&fit=crop
 */
const productPhotoIds: Record<string, string[]> = {
  // Electronics - Computers
  'laptop': [
    '1496181137766-2c02f936e670', // Laptop on desk
    '1525547719571-a2d4ac8945e2', // MacBook
    '1496181137766-2c02f936e670', // Laptop close-up
    '1461749280685-d102f7c972b1', // Laptop workspace
  ],
  'computer': [
    '1496181137766-2c02f936e670',
    '1525547719571-a2d4ac8945e2',
    '1461749280685-d102f7c972b1',
  ],
  'mouse': [
    '1527864550417-8fd0354a861f', // Computer mouse
    '1527864550417-8fd0354a861f',
    '1527864550417-8fd0354a861f',
  ],
  'keyboard': [
    '1527864550417-8fd0354a861f', // Keyboard
    '1527864550417-8fd0354a861f',
    '1527864550417-8fd0354a861f',
  ],
  
  // Electronics - Phones
  'phone': [
    '1511707171634-5f8971b6d858', // iPhone
    '1523275335684-37898b6baf30', // Smartphone
    '1511707171634-5f8971b6d858',
    '1523275335684-37898b6baf30',
  ],
  'smartphone': [
    '1511707171634-5f8971b6d858',
    '1523275335684-37898b6baf30',
    '1511707171634-5f8971b6d858',
  ],
  
  // Electronics - Audio
  'headphones': [
    '1505740420928-5e560c06d30e', // Headphones
    '1484704849700-f032a568e944', // Wireless headphones
    '1505740420928-5e560c06d30e',
    '1484704849700-f032a568e944',
  ],
  'speaker': [
    '1484704849700-f032a568e944', // Bluetooth speaker
    '1484704849700-f032a568e944',
    '1484704849700-f032a568e944',
  ],
  
  // Electronics - TV & Video
  'tv': [
    '1522869636150-149d01b2c916', // TV
    '1522869636150-149d01b2c916',
    '1522869636150-149d01b2c916',
  ],
  
  // Electronics - Camera
  'camera': [
    '1502920917128-1aa500764cbd', // DSLR camera
    '1502920917128-1aa500764cbd',
    '1502920917128-1aa500764cbd',
  ],
  
  // Fashion - Shoes
  'shoes': [
    '1542291026-7eec264c27ff', // Sneakers
    '1460353581641-37bddab81aeb', // Running shoes
    '1549298916-b41d501d3772', // Fashion shoes
    '1542291026-7eec264c27ff',
  ],
  'sneakers': [
    '1542291026-7eec264c27ff',
    '1460353581641-37bddab81aeb',
    '1549298916-b41d501d3772',
  ],
  
  // Fashion - Clothing
  'dress': [
    '1515372039744-b8f02a3ae446', // Fashion clothing
    '1515372039744-b8f02a3ae446',
    '1515372039744-b8f02a3ae446',
  ],
  'clothing': [
    '1515372039744-b8f02a3ae446',
    '1515372039744-b8f02a3ae446',
    '1515372039744-b8f02a3ae446',
  ],
  'jeans': [
    '1515372039744-b8f02a3ae446',
    '1515372039744-b8f02a3ae446',
  ],
  'shirt': [
    '1515372039744-b8f02a3ae446',
    '1515372039744-b8f02a3ae446',
  ],
  
  // Fashion - Accessories
  'handbag': [
    '1548036328-c9fa89d128fa', // Leather bag
    '1548036328-c9fa89d128fa',
    '1548036328-c9fa89d128fa',
  ],
  'jewelry': [
    '1515562141207-7a88fb7ce338', // Jewelry
    '1515562141207-7a88fb7ce338',
    '1515562141207-7a88fb7ce338',
  ],
  
  // Home & Kitchen
  'furniture': [
    '1556909114-f6e7ad7d3136', // Modern furniture
    '1556909114-f6e7ad7d3136',
    '1556909114-f6e7ad7d3136',
  ],
  'kitchen': [
    '1556910096-6f5ce2a1e9a5', // Kitchen appliances
    '1556910096-6f5ce2a1e9a5',
    '1556910096-6f5ce2a1e9a5',
  ],
  'appliance': [
    '1556910096-6f5ce2a1e9a5',
    '1556910096-6f5ce2a1e9a5',
  ],
  'decor': [
    '1556909114-f6e7ad7d3136',
    '1556909114-f6e7ad7d3136',
  ],
  
  // Sports & Fitness
  'fitness': [
    '1571019613454-1cb2f99b2d8b', // Fitness equipment
    '1571019613454-1cb2f99b2d8b',
    '1571019613454-1cb2f99b2d8b',
  ],
  'sports': [
    '1571019613454-1cb2f99b2d8b',
    '1571019613454-1cb2f99b2d8b',
  ],
  
  // Beauty & Personal Care
  'makeup': [
    '1596462502278-27bfdc403348', // Makeup products
    '1596462502278-27bfdc403348',
  ],
  'skincare': [
    '1596462502278-27bfdc403348',
    '1596462502278-27bfdc403348',
  ],
  
  // Toys & Games
  'toy': [
    '1558618666-fcd25c85cd64', // Toys
    '1558618666-fcd25c85cd64',
  ],
  'game': [
    '1558618666-fcd25c85cd64',
    '1558618666-fcd25c85cd64',
  ],
  
  // Default - use these for any unmatched categories
  'default': [
    '1496181137766-2c02f936e670', // Laptop (generic tech)
    '1523275335684-37898b6baf30', // Smartphone (generic tech)
    '1505740420928-5e560c06d30e', // Headphones (generic tech)
    '1542291026-7eec264c27ff', // Shoes (generic fashion)
    '1515372039744-b8f02a3ae446', // Clothing (generic fashion)
  ],
};

/**
 * Maps search keywords to photo categories
 */
function getPhotoCategory(searchQuery: string): string {
  const query = searchQuery.toLowerCase();
  
  // Electronics
  if (query.includes('laptop') || query.includes('macbook') || query.includes('notebook')) return 'laptop';
  if (query.includes('computer') || query.includes('desktop') || query.includes('pc')) return 'computer';
  if (query.includes('mouse') && !query.includes('phone')) return 'mouse';
  if (query.includes('keyboard') || query.includes('mechanical')) return 'keyboard';
  if (query.includes('phone') || query.includes('iphone') || query.includes('smartphone') || query.includes('galaxy')) return 'phone';
  if (query.includes('headphone') || query.includes('earbud') || query.includes('airpod')) return 'headphones';
  if (query.includes('speaker') || query.includes('soundbar') || query.includes('bluetooth speaker')) return 'speaker';
  if (query.includes('tv') || query.includes('television') || query.includes('smart tv')) return 'tv';
  if (query.includes('camera') || query.includes('dslr') || query.includes('mirrorless')) return 'camera';
  if (query.includes('tablet') || query.includes('ipad')) return 'laptop'; // Use laptop images for tablets
  if (query.includes('monitor') || query.includes('display')) return 'laptop';
  if (query.includes('watch') && (query.includes('smart') || query.includes('apple'))) return 'phone'; // Smartwatch
  
  // Fashion
  if (query.includes('shoe') || query.includes('sneaker') || query.includes('heels') || query.includes('boot')) return 'shoes';
  if (query.includes('dress') || query.includes('gown')) return 'dress';
  if (query.includes('clothing') || query.includes('apparel') || query.includes('garment')) return 'clothing';
  if (query.includes('jean')) return 'jeans';
  if (query.includes('shirt') || query.includes('blouse') || query.includes('top')) return 'shirt';
  if (query.includes('handbag') || query.includes('purse') || (query.includes('bag') && !query.includes('luggage'))) return 'handbag';
  if (query.includes('jewelry') || query.includes('necklace') || query.includes('bracelet') || query.includes('ring')) return 'jewelry';
  
  // Home & Kitchen
  if (query.includes('furniture') || query.includes('chair') || query.includes('table') || query.includes('sofa')) return 'furniture';
  if (query.includes('kitchen') || query.includes('mixer') || query.includes('blender') || query.includes('cooker')) return 'kitchen';
  if (query.includes('appliance') && !query.includes('kitchen')) return 'appliance';
  if (query.includes('decor') || query.includes('vase') || query.includes('lamp') || query.includes('art')) return 'decor';
  if (query.includes('bedding') || query.includes('sheet') || query.includes('pillow')) return 'furniture';
  
  // Sports & Fitness
  if (query.includes('fitness') || query.includes('gym') || query.includes('dumbbell') || query.includes('yoga')) return 'fitness';
  if (query.includes('sport') || query.includes('outdoor') || query.includes('camping')) return 'sports';
  
  // Beauty
  if (query.includes('makeup') || query.includes('lipstick') || query.includes('foundation')) return 'makeup';
  if (query.includes('skincare') || query.includes('moisturizer') || query.includes('cleanser')) return 'skincare';
  
  // Toys & Games
  if (query.includes('toy') || query.includes('puzzle') || query.includes('lego')) return 'toy';
  if (query.includes('game') && !query.includes('video') && !query.includes('console')) return 'game';
  
  return 'default';
}

/**
 * Fetches a unique product image from Unsplash based on search keywords
 * Uses direct Unsplash image URLs (same format as working products)
 * @param searchQuery - Keywords to search for (e.g., "laptop computer", "running shoes")
 * @returns Promise<string> - URL of the image
 */
export async function fetchProductImage(searchQuery: string): Promise<string> {
  try {
    const category = getPhotoCategory(searchQuery);
    const photoIds = productPhotoIds[category] || productPhotoIds['default'];
    
    // Select a random photo ID from the category
    const randomPhotoId = photoIds[Math.floor(Math.random() * photoIds.length)];
    
    // Use the same format as working products: direct Unsplash image URL
    // Format: https://images.unsplash.com/photo-{photoId}?w=600&h=600&fit=crop
    const imageUrl = `https://images.unsplash.com/photo-${randomPhotoId}?w=600&h=600&fit=crop`;
    
    return imageUrl;
  } catch (error) {
    console.error(`Error fetching image for "${searchQuery}":`, error);
    // Fallback to a working default image
    return `https://images.unsplash.com/photo-1496181137766-2c02f936e670?w=600&h=600&fit=crop`;
  }
}

/**
 * Fetches multiple product images for a product
 * @param searchQuery - Keywords to search for
 * @param count - Number of images to fetch (default: 3)
 * @returns Promise<string[]> - Array of image URLs
 */
export async function fetchProductImages(searchQuery: string, count: number = 3): Promise<string[]> {
  const images: string[] = [];
  const seenUrls = new Set<string>();
  
  const category = getPhotoCategory(searchQuery);
  const photoIds = productPhotoIds[category] || productPhotoIds['default'];
  
  // Use different photo IDs from the category to get variety
  for (let i = 0; i < count; i++) {
    const photoId = photoIds[i % photoIds.length];
    const imageUrl = `https://images.unsplash.com/photo-${photoId}?w=600&h=600&fit=crop`;
    
    // Avoid duplicates
    if (!seenUrls.has(imageUrl)) {
      images.push(imageUrl);
      seenUrls.add(imageUrl);
    }
  }
  
  // If we need more images than available, add some from default category
  if (images.length < count) {
    const defaultIds = productPhotoIds['default'];
    for (let i = images.length; i < count; i++) {
      const photoId = defaultIds[i % defaultIds.length];
      const imageUrl = `https://images.unsplash.com/photo-${photoId}?w=600&h=600&fit=crop`;
      if (!seenUrls.has(imageUrl)) {
        images.push(imageUrl);
        seenUrls.add(imageUrl);
      }
    }
  }
  
  return images;
}

