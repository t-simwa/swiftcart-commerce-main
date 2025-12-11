import { faker } from '@faker-js/faker';
import { fetchProductImage, fetchProductImages } from './imageFetcher';
import { enhancedProductTemplates, EnhancedProductTemplate } from './enhancedProductTemplates';

export interface ProductTemplate {
  name: string;
  description: string;
  priceRange: { min: number; max: number };
  imageKeywords: string;
  ratingRange?: { min: number; max: number };
  reviewCountRange?: { min: number; max: number };
  stockRange?: { min: number; max: number };
  hasVariants?: boolean;
  variantTypes?: string[];
}

// Product templates for different subcategories
const productTemplates: Record<string, ProductTemplate[]> = {
  // Electronics
  'computers-accessories': [
    { name: 'Laptop', description: 'High-performance laptop', priceRange: { min: 50000, max: 200000 }, imageKeywords: 'laptop computer' },
    { name: 'Gaming Laptop', description: 'Powerful gaming laptop', priceRange: { min: 80000, max: 300000 }, imageKeywords: 'gaming laptop' },
    { name: 'Ultrabook', description: 'Sleek and lightweight ultrabook', priceRange: { min: 60000, max: 180000 }, imageKeywords: 'ultrabook thin laptop' },
    { name: 'Laptop Stand', description: 'Ergonomic laptop stand', priceRange: { min: 2000, max: 8000 }, imageKeywords: 'laptop stand' },
    { name: 'Laptop Bag', description: 'Professional laptop bag', priceRange: { min: 3000, max: 12000 }, imageKeywords: 'laptop bag' },
    { name: 'USB-C Hub', description: 'Multi-port USB-C hub', priceRange: { min: 1500, max: 6000 }, imageKeywords: 'usb hub adapter' },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', priceRange: { min: 1000, max: 5000 }, imageKeywords: 'wireless mouse' },
    { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', priceRange: { min: 5000, max: 20000 }, imageKeywords: 'mechanical keyboard' },
  ],
  'cell-phones': [
    { name: 'Smartphone', description: 'Latest generation smartphone', priceRange: { min: 20000, max: 150000 }, imageKeywords: 'smartphone mobile phone' },
    { name: 'Phone Case', description: 'Protective phone case', priceRange: { min: 500, max: 3000 }, imageKeywords: 'phone case' },
    { name: 'Screen Protector', description: 'Tempered glass screen protector', priceRange: { min: 300, max: 2000 }, imageKeywords: 'screen protector' },
    { name: 'Phone Charger', description: 'Fast charging cable', priceRange: { min: 500, max: 2500 }, imageKeywords: 'phone charger cable' },
    { name: 'Power Bank', description: 'Portable power bank', priceRange: { min: 2000, max: 8000 }, imageKeywords: 'power bank portable charger' },
    { name: 'Wireless Earbuds', description: 'True wireless earbuds', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'wireless earbuds' },
  ],
  'tv-video': [
    { name: 'Smart TV', description: '4K Ultra HD Smart TV', priceRange: { min: 30000, max: 200000 }, imageKeywords: 'smart tv 4k' },
    { name: 'TV Stand', description: 'Modern TV stand', priceRange: { min: 5000, max: 25000 }, imageKeywords: 'tv stand furniture' },
    { name: 'Soundbar', description: 'Premium soundbar system', priceRange: { min: 8000, max: 50000 }, imageKeywords: 'soundbar speaker' },
    { name: 'Streaming Device', description: '4K streaming device', priceRange: { min: 3000, max: 15000 }, imageKeywords: 'streaming device' },
  ],
  'audio-headphones': [
    { name: 'Wireless Headphones', description: 'Noise-cancelling headphones', priceRange: { min: 5000, max: 40000 }, imageKeywords: 'wireless headphones' },
    { name: 'Gaming Headset', description: 'Professional gaming headset', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'gaming headset' },
    { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker', priceRange: { min: 2000, max: 15000 }, imageKeywords: 'bluetooth speaker' },
    { name: 'Earbuds', description: 'Premium wireless earbuds', priceRange: { min: 2000, max: 20000 }, imageKeywords: 'wireless earbuds' },
  ],
  'camera-photo': [
    { name: 'DSLR Camera', description: 'Professional DSLR camera', priceRange: { min: 50000, max: 300000 }, imageKeywords: 'dslr camera' },
    { name: 'Camera Lens', description: 'Professional camera lens', priceRange: { min: 15000, max: 150000 }, imageKeywords: 'camera lens' },
    { name: 'Camera Bag', description: 'Professional camera bag', priceRange: { min: 3000, max: 15000 }, imageKeywords: 'camera bag' },
    { name: 'Tripod', description: 'Professional camera tripod', priceRange: { min: 2000, max: 20000 }, imageKeywords: 'camera tripod' },
  ],
  'gaming-consoles': [
    { name: 'Gaming Console', description: 'Latest gaming console', priceRange: { min: 40000, max: 60000 }, imageKeywords: 'gaming console' },
    { name: 'Gaming Controller', description: 'Wireless gaming controller', priceRange: { min: 3000, max: 10000 }, imageKeywords: 'gaming controller' },
    { name: 'Gaming Chair', description: 'Ergonomic gaming chair', priceRange: { min: 15000, max: 50000 }, imageKeywords: 'gaming chair' },
  ],
  'wearable-tech': [
    { name: 'Smartwatch', description: 'Advanced smartwatch', priceRange: { min: 10000, max: 80000 }, imageKeywords: 'smartwatch' },
    { name: 'Fitness Tracker', description: 'Activity fitness tracker', priceRange: { min: 3000, max: 20000 }, imageKeywords: 'fitness tracker' },
  ],
  'smart-home': [
    { name: 'Smart Speaker', description: 'Voice-controlled smart speaker', priceRange: { min: 5000, max: 30000 }, imageKeywords: 'smart speaker' },
    { name: 'Smart Light Bulb', description: 'WiFi smart light bulb', priceRange: { min: 1000, max: 5000 }, imageKeywords: 'smart light bulb' },
    { name: 'Smart Thermostat', description: 'Programmable smart thermostat', priceRange: { min: 8000, max: 25000 }, imageKeywords: 'smart thermostat' },
  ],
  
  // Computers
  'laptops': [
    { name: 'Business Laptop', description: 'Professional business laptop', priceRange: { min: 60000, max: 180000 }, imageKeywords: 'business laptop' },
    { name: 'Student Laptop', description: 'Affordable student laptop', priceRange: { min: 40000, max: 100000 }, imageKeywords: 'student laptop' },
  ],
  'desktops': [
    { name: 'Desktop Computer', description: 'Powerful desktop computer', priceRange: { min: 80000, max: 250000 }, imageKeywords: 'desktop computer' },
    { name: 'All-in-One PC', description: 'Sleek all-in-one PC', priceRange: { min: 70000, max: 200000 }, imageKeywords: 'all in one computer' },
  ],
  'tablets': [
    { name: 'Tablet', description: 'High-performance tablet', priceRange: { min: 20000, max: 100000 }, imageKeywords: 'tablet' },
    { name: 'Tablet Stand', description: 'Adjustable tablet stand', priceRange: { min: 1500, max: 6000 }, imageKeywords: 'tablet stand' },
  ],
  'monitors': [
    { name: '4K Monitor', description: 'Ultra HD 4K monitor', priceRange: { min: 20000, max: 80000 }, imageKeywords: '4k monitor' },
    { name: 'Gaming Monitor', description: 'High refresh rate gaming monitor', priceRange: { min: 25000, max: 100000 }, imageKeywords: 'gaming monitor' },
  ],
  
  // Fashion
  'womens-clothing': [
    { name: 'Women\'s Dress', description: 'Elegant women\'s dress', priceRange: { min: 2000, max: 15000 }, imageKeywords: 'womens dress fashion' },
    { name: 'Women\'s Blouse', description: 'Professional women\'s blouse', priceRange: { min: 1500, max: 8000 }, imageKeywords: 'womens blouse' },
    { name: 'Women\'s Jeans', description: 'Classic women\'s jeans', priceRange: { min: 2500, max: 12000 }, imageKeywords: 'womens jeans' },
  ],
  'womens-shoes': [
    { name: 'Women\'s Heels', description: 'Elegant high heels', priceRange: { min: 3000, max: 20000 }, imageKeywords: 'womens high heels' },
    { name: 'Women\'s Sneakers', description: 'Comfortable women\'s sneakers', priceRange: { min: 2500, max: 15000 }, imageKeywords: 'womens sneakers' },
  ],
  'mens-clothing': [
    { name: 'Men\'s Shirt', description: 'Classic men\'s shirt', priceRange: { min: 1500, max: 8000 }, imageKeywords: 'mens shirt' },
    { name: 'Men\'s Jeans', description: 'Premium men\'s jeans', priceRange: { min: 2500, max: 12000 }, imageKeywords: 'mens jeans' },
    { name: 'Men\'s Suit', description: 'Professional men\'s suit', priceRange: { min: 8000, max: 50000 }, imageKeywords: 'mens suit' },
  ],
  'mens-shoes': [
    { name: 'Men\'s Dress Shoes', description: 'Classic dress shoes', priceRange: { min: 4000, max: 25000 }, imageKeywords: 'mens dress shoes' },
    { name: 'Men\'s Sneakers', description: 'Sporty men\'s sneakers', priceRange: { min: 3000, max: 18000 }, imageKeywords: 'mens sneakers' },
  ],
  
  // Sports & Outdoors
  'exercise-fitness': [
    { name: 'Dumbbells', description: 'Adjustable dumbbells', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'dumbbells weights' },
    { name: 'Yoga Mat', description: 'Premium yoga mat', priceRange: { min: 1500, max: 8000 }, imageKeywords: 'yoga mat' },
    { name: 'Resistance Bands', description: 'Exercise resistance bands', priceRange: { min: 500, max: 3000 }, imageKeywords: 'resistance bands' },
  ],
  'outdoor-recreation': [
    { name: 'Camping Tent', description: '4-person camping tent', priceRange: { min: 8000, max: 40000 }, imageKeywords: 'camping tent' },
    { name: 'Hiking Backpack', description: 'Durable hiking backpack', priceRange: { min: 3000, max: 20000 }, imageKeywords: 'hiking backpack' },
  ],
  
  // Home & Kitchen
  'kitchen-dining': [
    { name: 'Coffee Maker', description: 'Programmable coffee maker', priceRange: { min: 5000, max: 30000 }, imageKeywords: 'coffee maker' },
    { name: 'Blender', description: 'High-speed blender', priceRange: { min: 3000, max: 20000 }, imageKeywords: 'blender kitchen' },
    { name: 'Air Fryer', description: 'Digital air fryer', priceRange: { min: 4000, max: 25000 }, imageKeywords: 'air fryer' },
  ],
  'furniture': [
    { name: 'Office Chair', description: 'Ergonomic office chair', priceRange: { min: 8000, max: 50000 }, imageKeywords: 'office chair' },
    { name: 'Dining Table', description: 'Modern dining table', priceRange: { min: 15000, max: 100000 }, imageKeywords: 'dining table' },
  ],
  
  // Toys & Games
  'action-figures': [
    { name: 'Action Figure', description: 'Collectible action figure', priceRange: { min: 500, max: 5000 }, imageKeywords: 'action figure toy' },
  ],
  'building-toys': [
    { name: 'Building Blocks', description: 'Educational building blocks', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'building blocks toys' },
  ],
  
  // Books
  'books': [
    { name: 'Fiction Book', description: 'Bestselling fiction novel', priceRange: { min: 500, max: 3000 }, imageKeywords: 'book novel' },
    { name: 'Non-Fiction Book', description: 'Educational non-fiction book', priceRange: { min: 800, max: 4000 }, imageKeywords: 'book non fiction' },
  ],
  
  // More subcategories - expanded templates
  'car-electronics': [
    { name: 'Car Charger', description: 'Fast car charger', priceRange: { min: 500, max: 3000 }, imageKeywords: 'car charger' },
    { name: 'Car Mount', description: 'Phone car mount', priceRange: { min: 1000, max: 5000 }, imageKeywords: 'car phone mount' },
    { name: 'Dash Cam', description: 'HD dash camera', priceRange: { min: 3000, max: 20000 }, imageKeywords: 'dash cam' },
  ],
  'data-storage': [
    { name: 'External Hard Drive', description: 'Portable external hard drive', priceRange: { min: 5000, max: 30000 }, imageKeywords: 'external hard drive' },
    { name: 'USB Flash Drive', description: 'High-speed USB flash drive', priceRange: { min: 500, max: 5000 }, imageKeywords: 'usb flash drive' },
    { name: 'SSD Drive', description: 'Solid state drive', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'ssd drive' },
  ],
  'networking': [
    { name: 'WiFi Router', description: 'High-speed WiFi router', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'wifi router' },
    { name: 'Network Switch', description: 'Gigabit network switch', priceRange: { min: 2000, max: 15000 }, imageKeywords: 'network switch' },
  ],
  'art-supplies': [
    { name: 'Paint Set', description: 'Professional paint set', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'paint set art' },
    { name: 'Sketchbook', description: 'Artist sketchbook', priceRange: { min: 500, max: 3000 }, imageKeywords: 'sketchbook' },
    { name: 'Paint Brushes', description: 'Professional paint brushes', priceRange: { min: 800, max: 5000 }, imageKeywords: 'paint brushes' },
  ],
  'car-care': [
    { name: 'Car Wash Kit', description: 'Complete car wash kit', priceRange: { min: 2000, max: 10000 }, imageKeywords: 'car wash kit' },
    { name: 'Car Wax', description: 'Premium car wax', priceRange: { min: 1000, max: 5000 }, imageKeywords: 'car wax' },
  ],
  'baby-toys': [
    { name: 'Baby Rattle', description: 'Colorful baby rattle', priceRange: { min: 300, max: 2000 }, imageKeywords: 'baby rattle toy' },
    { name: 'Baby Teether', description: 'Silicone baby teether', priceRange: { min: 200, max: 1500 }, imageKeywords: 'baby teether' },
  ],
  'diapering': [
    { name: 'Diapers', description: 'Premium baby diapers', priceRange: { min: 1000, max: 5000 }, imageKeywords: 'baby diapers' },
    { name: 'Diaper Bag', description: 'Stylish diaper bag', priceRange: { min: 2000, max: 12000 }, imageKeywords: 'diaper bag' },
  ],
  'makeup': [
    { name: 'Lipstick', description: 'Long-lasting lipstick', priceRange: { min: 500, max: 5000 }, imageKeywords: 'lipstick makeup' },
    { name: 'Foundation', description: 'Full coverage foundation', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'foundation makeup' },
    { name: 'Eyeshadow Palette', description: 'Professional eyeshadow palette', priceRange: { min: 1500, max: 10000 }, imageKeywords: 'eyeshadow palette' },
  ],
  'skin-care': [
    { name: 'Face Moisturizer', description: 'Hydrating face moisturizer', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'face moisturizer' },
    { name: 'Face Cleanser', description: 'Gentle face cleanser', priceRange: { min: 800, max: 5000 }, imageKeywords: 'face cleanser' },
  ],
  'womens-jewelry': [
    { name: 'Necklace', description: 'Elegant women\'s necklace', priceRange: { min: 2000, max: 50000 }, imageKeywords: 'womens necklace jewelry' },
    { name: 'Earrings', description: 'Beautiful earrings', priceRange: { min: 1000, max: 30000 }, imageKeywords: 'womens earrings' },
  ],
  'womens-handbags': [
    { name: 'Handbag', description: 'Designer handbag', priceRange: { min: 3000, max: 50000 }, imageKeywords: 'womens handbag' },
    { name: 'Wallet', description: 'Leather wallet', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'womens wallet' },
  ],
  'household-supplies': [
    { name: 'Cleaning Supplies', description: 'All-purpose cleaner', priceRange: { min: 500, max: 3000 }, imageKeywords: 'cleaning supplies' },
    { name: 'Paper Towels', description: 'Premium paper towels', priceRange: { min: 300, max: 2000 }, imageKeywords: 'paper towels' },
  ],
  'bedding': [
    { name: 'Bed Sheets', description: 'Luxury bed sheets', priceRange: { min: 2000, max: 15000 }, imageKeywords: 'bed sheets' },
    { name: 'Pillow', description: 'Memory foam pillow', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'pillow' },
  ],
  'home-decor': [
    { name: 'Wall Art', description: 'Modern wall art', priceRange: { min: 1500, max: 20000 }, imageKeywords: 'wall art decor' },
    { name: 'Vase', description: 'Decorative vase', priceRange: { min: 1000, max: 10000 }, imageKeywords: 'vase decor' },
  ],
  'lighting': [
    { name: 'Table Lamp', description: 'Modern table lamp', priceRange: { min: 2000, max: 15000 }, imageKeywords: 'table lamp' },
    { name: 'Floor Lamp', description: 'Stylish floor lamp', priceRange: { min: 3000, max: 25000 }, imageKeywords: 'floor lamp' },
  ],
  'dogs': [
    { name: 'Dog Food', description: 'Premium dog food', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'dog food' },
    { name: 'Dog Toy', description: 'Interactive dog toy', priceRange: { min: 500, max: 3000 }, imageKeywords: 'dog toy' },
  ],
  'cats': [
    { name: 'Cat Food', description: 'Premium cat food', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'cat food' },
    { name: 'Cat Litter', description: 'Clumping cat litter', priceRange: { min: 800, max: 5000 }, imageKeywords: 'cat litter' },
  ],
  'power-hand-tools': [
    { name: 'Drill', description: 'Cordless power drill', priceRange: { min: 5000, max: 30000 }, imageKeywords: 'power drill' },
    { name: 'Circular Saw', description: 'Professional circular saw', priceRange: { min: 8000, max: 40000 }, imageKeywords: 'circular saw' },
  ],
  'games-puzzles': [
    { name: 'Board Game', description: 'Classic board game', priceRange: { min: 1000, max: 8000 }, imageKeywords: 'board game' },
    { name: 'Jigsaw Puzzle', description: '1000 piece puzzle', priceRange: { min: 500, max: 3000 }, imageKeywords: 'jigsaw puzzle' },
  ],
  'pc-games': [
    { name: 'PC Game', description: 'Latest PC game', priceRange: { min: 2000, max: 8000 }, imageKeywords: 'pc game video game' },
  ],
  'ps5': [
    { name: 'PS5 Game', description: 'PlayStation 5 game', priceRange: { min: 3000, max: 10000 }, imageKeywords: 'playstation 5 game' },
  ],
  'nintendo-switch': [
    { name: 'Nintendo Switch Game', description: 'Nintendo Switch game', priceRange: { min: 3000, max: 10000 }, imageKeywords: 'nintendo switch game' },
  ],
  
  // Default template for any category
  'default': [
    { name: 'Product', description: 'Quality product', priceRange: { min: 1000, max: 10000 }, imageKeywords: 'product' },
  ],
};

/**
 * Gets product templates for a specific subcategory
 */
function getTemplatesForSubcategory(subcategorySlug: string): ProductTemplate[] {
  return productTemplates[subcategorySlug] || productTemplates['default'];
}

/**
 * Gets enhanced product templates for a specific subcategory
 */
function getEnhancedTemplatesForSubcategory(subcategorySlug: string): EnhancedProductTemplate[] {
  return enhancedProductTemplates[subcategorySlug] || [];
}

/**
 * Generates a product-specific, marketing-style description
 */
function generateProductDescription(
  productName: string,
  categoryName: string,
  subcategoryName: string,
  subcategorySlug: string,
  template: ProductTemplate,
  index: number
): string {
  const adjectives = [
    'Premium', 'Professional', 'High-Quality', 'Advanced', 'Innovative',
    'Durable', 'Reliable', 'Stylish', 'Modern', 'Elegant', 'Sophisticated',
    'Cutting-Edge', 'State-of-the-Art', 'Top-of-the-Line', 'Exceptional'
  ];
  
  const features = [
    'designed for superior performance',
    'crafted with attention to detail',
    'built to last',
    'engineered for excellence',
    'designed with the user in mind',
    'featuring the latest technology',
    'combining style and functionality',
    'offering unmatched quality',
    'delivering exceptional value',
    'providing outstanding results'
  ];
  
  const benefits = [
    'perfect for everyday use',
    'ideal for professionals',
    'great for home and office',
    'suitable for all skill levels',
    'perfect for beginners and experts alike',
    'designed for comfort and convenience',
    'optimized for maximum efficiency',
    'created for the modern lifestyle'
  ];
  
  // Helper function to get random element
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Category-specific description template functions
  const descriptionTemplateFunctions: Record<string, Array<() => string>> = {
    // Electronics & Computers
    'laptops': [
      () => `Experience powerful performance with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${randomInt(8, 32)}GB RAM, ${randomInt(256, 2000)}GB storage, and a ${randomInt(13, 17)}-inch ${random(['HD', 'Full HD', '4K'])} display. ${random(features)} and ${random(benefits)}. Perfect for work, gaming, and creative projects.`,
      () => `Upgrade your computing experience with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Powered by the latest ${random(['Intel', 'AMD', 'Apple'])} processor, this device delivers ${random(['blazing-fast', 'smooth', 'seamless'])} performance. With ${randomInt(8, 16)} hours of battery life and ${random(['ultra-fast', 'lightning-quick'])} ${random(['WiFi 6', '5G', 'USB-C'])} connectivity. ${random(features)}.`,
      () => `Boost your productivity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Equipped with ${randomInt(8, 16)}GB RAM, ${randomInt(512, 2000)}GB SSD storage, and a ${randomInt(13, 17)}-inch ${random(['Full HD', '4K UHD', 'Retina'])} display. ${random(features)}. ${random(benefits)}.`,
    ],
    'computers-accessories': [
      () => `Enhance your productivity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)} and ${random(benefits)}. Made from ${faker.commerce.productMaterial()} for durability and style.`,
      () => `Transform your workspace with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Compatible with most devices and ${random(benefits)}.`,
      () => `Boost efficiency with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Features ${random(['plug-and-play setup', 'universal compatibility', 'sleek design'])}. ${random(benefits)}.`,
    ],
    'cell-phones': [
      () => `Stay connected with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring a ${randomInt(6, 7)}-inch ${random(['OLED', 'AMOLED', 'LCD'])} display, ${randomInt(64, 512)}GB storage, and ${randomInt(8, 16)}MP camera. ${random(features)} and ${random(benefits)}.`,
      () => `Discover the future of mobile technology with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. With ${randomInt(4000, 6000)}mAh battery, ${random(['5G', '4G LTE'])} connectivity, and ${random(['fast', 'wireless'])} charging. ${random(features)}.`,
      () => `Experience cutting-edge technology with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${randomInt(12, 48)}MP ${random(['triple', 'dual', 'quad'])} camera system, ${randomInt(128, 512)}GB storage, and ${random(['face unlock', 'fingerprint sensor', 'both'])}. ${random(features)}.`,
    ],
    'tv-video': [
      () => `Immerse yourself in stunning visuals with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['4K Ultra HD', '8K', 'OLED'])} resolution, ${random(['HDR10', 'Dolby Vision'])} support, and ${randomInt(43, 85)}-inch screen. ${random(features)} and ${random(benefits)}.`,
      () => `Transform your entertainment experience with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['smart', 'voice'])} controls and ${random(['built-in streaming', 'multiple HDMI ports'])}. ${random(benefits)}.`,
      () => `Enjoy cinematic viewing with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${randomInt(50, 85)}-inch ${random(['QLED', 'OLED', 'LED'])} display with ${random(['local dimming', 'quantum dot technology', 'full array backlight'])}. ${random(features)}.`,
    ],
    'audio-headphones': [
      () => `Experience crystal-clear audio with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['active noise cancellation', 'premium drivers', 'surround sound'])} and ${randomInt(20, 40)}-hour battery life. ${random(features)} and ${random(benefits)}.`,
      () => `Elevate your listening experience with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['comfortable', 'memory foam'])} ear cushions and ${random(['wireless', 'Bluetooth 5.0'])} connectivity. ${random(benefits)}.`,
      () => `Immerse yourself in premium sound with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${randomInt(30, 50)}mm drivers deliver ${random(['rich bass', 'crisp highs', 'balanced audio'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'camera-photo': [
      () => `Capture life's moments with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${randomInt(20, 50)}MP sensor, ${random(['4K', '1080p'])} video recording, and ${random(['optical', 'digital'])} image stabilization. ${random(features)} and ${random(benefits)}.`,
      () => `Unleash your creativity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['fast autofocus', 'multiple shooting modes', 'professional-grade optics'])}. ${random(benefits)}.`,
      () => `Professional photography made easy with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${randomInt(24, 50)}MP ${random(['full-frame', 'APS-C', 'micro four-thirds'])} sensor with ${random(['ISO range up to 25600', '5-axis stabilization', 'weather-sealed body'])}. ${random(features)}.`,
    ],
    'gaming-consoles': [
      () => `Enter the next generation of gaming with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['ray tracing', '4K gaming', '120fps support'])} and ${randomInt(500, 2000)}GB storage. ${random(features)} and ${random(benefits)}.`,
      () => `Experience gaming like never before with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['backward compatibility', 'exclusive titles', 'online multiplayer'])}. ${random(benefits)}.`,
      () => `Power up your gaming sessions with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Custom AMD processor', 'High-speed SSD', 'Advanced cooling system'])} delivers ${random(['smooth gameplay', 'fast loading', 'stunning graphics'])}. ${random(features)}.`,
    ],
    'wearable-tech': [
      () => `Track your fitness and stay connected with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['heart rate monitoring', 'GPS tracking', 'sleep analysis'])} and ${randomInt(5, 14)}-day battery life. ${random(features)} and ${random(benefits)}.`,
      () => `Stay active and informed with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['water resistance', 'multiple sport modes', 'smart notifications'])}. ${random(benefits)}.`,
      () => `Monitor your health 24/7 with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Continuous heart rate', 'SpO2 monitoring', 'Stress tracking'])} and ${randomInt(7, 14)} days battery. ${random(features)}.`,
    ],
    'smart-home': [
      () => `Make your home smarter with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Compatible with ${random(['Alexa', 'Google Assistant', 'Apple HomeKit'])} and ${random(benefits)}.`,
      () => `Upgrade your living space with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['voice control', 'app integration', 'automated scheduling'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Automate your home with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['WiFi enabled', 'Energy efficient', 'Easy installation'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Fashion
    'womens-clothing': [
      () => `Look elegant and stylish in this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} fabric for ${random(['comfort', 'durability', 'breathability'])}. ${random(features)} and ${random(benefits)}. Available in multiple sizes and colors.`,
      () => `Elevate your wardrobe with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Perfect for ${random(['casual wear', 'office', 'special occasions'])}. ${random(benefits)}.`,
      () => `Discover timeless style with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Classic design', 'Modern fit', 'Versatile styling'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'womens-shoes': [
      () => `Step out in style with these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['comfortable', 'cushioned', 'supportive'])} insoles and ${faker.commerce.productMaterial()} construction. ${random(features)} and ${random(benefits)}.`,
      () => `Experience comfort and style with these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['slip-resistant', 'breathable', 'flexible'])} design. ${random(benefits)}.`,
      () => `Walk in confidence with these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Arch support', 'Shock absorption', 'Lightweight design'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'mens-clothing': [
      () => `Dress sharp with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Crafted from ${faker.commerce.productMaterial()} for ${random(['durability', 'comfort', 'style'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Add sophistication to your wardrobe with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Perfect for ${random(['business', 'casual', 'formal'])} occasions. ${random(benefits)}.`,
      () => `Elevate your style with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Tailored fit', 'Premium materials', 'Classic design'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'mens-shoes': [
      () => `Step up your style with these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Built with ${faker.commerce.productMaterial()} and ${random(['premium', 'durable', 'flexible'])} construction. ${random(features)} and ${random(benefits)}.`,
      () => `Experience premium quality with these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Featuring ${random(['comfortable', 'supportive', 'breathable'])} design. ${random(benefits)}.`,
      () => `Walk with confidence in these ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Durable sole', 'Comfortable fit', 'Classic style'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Home & Kitchen
    'kitchen-dining': [
      () => `Transform your kitchen with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Made from ${faker.commerce.productMaterial()} for ${random(['durability', 'easy cleaning', 'long-lasting performance'])}. ${random(benefits)}.`,
      () => `Upgrade your cooking experience with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['multiple functions', 'easy-to-use controls', 'energy-efficient design'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Cook like a chef with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Precision controls', 'Non-stick surface', 'Easy cleanup'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'furniture': [
      () => `Furnish your space with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} and ${random(features)}. ${random(benefits)}. Perfect for ${random(['home', 'office', 'dorm'])}.`,
      () => `Add style and comfort with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['ergonomic design', 'modern aesthetics', 'durable construction'])}. ${random(benefits)}.`,
      () => `Create the perfect space with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Contemporary design', 'Sturdy build', 'Easy assembly'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Sports & Outdoors
    'exercise-fitness': [
      () => `Achieve your fitness goals with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Made from ${faker.commerce.productMaterial()} for ${random(['durability', 'comfort', 'performance'])}. ${random(benefits)}.`,
      () => `Enhance your workout routine with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['adjustable', 'portable', 'versatile'])} design. ${random(features)} and ${random(benefits)}.`,
      () => `Take your fitness to the next level with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Professional grade', 'Space-saving design', 'Multi-functional'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'outdoor-recreation': [
      () => `Explore the great outdoors with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Made from ${faker.commerce.productMaterial()} for ${random(['weather resistance', 'durability', 'lightweight'])}. ${random(benefits)}.`,
      () => `Adventure awaits with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Featuring ${random(['waterproof', 'compact', 'multi-functional'])} design. ${random(features)} and ${random(benefits)}.`,
      () => `Conquer the outdoors with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Weatherproof construction', 'Lightweight design', 'Easy setup'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Beauty & Personal Care
    'makeup': [
      () => `Enhance your natural beauty with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. ${random(['Long-lasting', 'Smudge-proof', 'Water-resistant'])} formula that ${random(benefits)}. Available in multiple shades.`,
      () => `Discover your perfect look with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made with ${random(['high-quality', 'premium', 'natural'])} ingredients. ${random(features)} and ${random(benefits)}.`,
      () => `Create stunning looks with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Pigmented formula', 'Smooth application', 'All-day wear'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'skin-care': [
      () => `Nourish your skin with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Formulated with ${random(['vitamins', 'antioxidants', 'natural extracts'])}. ${random(features)} and ${random(benefits)}. Suitable for ${random(['all skin types', 'sensitive skin', 'dry skin'])}.`,
      () => `Transform your skincare routine with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. ${random(['Hydrating', 'Anti-aging', 'Brightening'])} formula that ${random(benefits)}.`,
      () => `Reveal radiant skin with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Dermatologist tested', 'Non-comedogenic', 'Cruelty-free'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Toys & Games
    'action-figures': [
      () => `Bring adventure to life with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['articulated joints', 'detailed design', 'authentic accessories'])}. ${random(benefits)}. Perfect for collectors and kids.`,
      () => `Collect this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Made from ${faker.commerce.productMaterial()} for ${random(['durability', 'detailed sculpting'])}. ${random(benefits)}.`,
      () => `Add to your collection with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Highly detailed', 'Multiple points of articulation', 'Includes accessories'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'building-toys': [
      () => `Spark creativity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${randomInt(50, 500)} pieces and ${random(['multiple build options', 'colorful design', 'educational value'])}. ${random(benefits)}.`,
      () => `Build endless possibilities with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} and ${random(features)}. ${random(benefits)}. Perfect for ${random(['kids', 'teens', 'adults'])}.`,
      () => `Encourage creativity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Compatible pieces', 'Step-by-step instructions', 'STEM learning'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Additional subcategories
    'data-storage': [
      () => `Store your data safely with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${randomInt(500, 5000)}GB capacity with ${random(['USB 3.0', 'USB-C', 'Thunderbolt'])} connectivity. ${random(features)} and ${random(benefits)}.`,
      () => `Backup and transfer files easily with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Fast transfer speeds', 'Compact design', 'Plug-and-play'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'networking': [
      () => `Connect seamlessly with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['WiFi 6', 'Gigabit Ethernet', 'Dual-band'])} support. ${random(features)} and ${random(benefits)}.`,
      () => `Upgrade your network with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['High-speed performance', 'Easy setup', 'Secure connection'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'art-supplies': [
      () => `Unleash your creativity with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Professional quality', 'Vibrant colors', 'Long-lasting'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Create masterpieces with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Artist-grade materials', 'Smooth application', 'Rich pigments'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'car-care': [
      () => `Keep your vehicle looking ${random(adjectives).toLowerCase()} with this ${productName.toLowerCase()}. ${random(['Protective formula', 'Easy application', 'Long-lasting shine'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Maintain your car's appearance with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Safe for all surfaces', 'Professional results', 'Time-saving'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'baby-toys': [
      () => `Delight your little one with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Safe materials', 'Educational', 'Age-appropriate'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Stimulate development with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Sensory play', 'Colorful design', 'Easy to clean'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'diapering': [
      () => `Keep your baby comfortable with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Hypoallergenic', 'Absorbent', 'Soft materials'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Essential for your baby with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Reliable protection', 'Comfortable fit', 'Easy to use'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'womens-jewelry': [
      () => `Add elegance with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} with ${random(['precious stones', 'intricate design', 'timeless style'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Complete your look with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Handcrafted', 'Hypoallergenic', 'Gift-ready'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'womens-handbags': [
      () => `Carry in style with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} with ${random(['spacious interior', 'multiple compartments', 'adjustable strap'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Elevate your style with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Designer-inspired', 'Durable construction', 'Versatile design'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'household-supplies': [
      () => `Keep your home clean with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Effective cleaning', 'Safe ingredients', 'Multi-purpose'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Maintain your home with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Long-lasting', 'Economical', 'Easy to use'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'bedding': [
      () => `Sleep comfortably with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. Made from ${faker.commerce.productMaterial()} for ${random(['softness', 'breathability', 'durability'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Transform your bedroom with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Luxury feel', 'Easy care', 'Multiple sizes'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'home-decor': [
      () => `Decorate your space with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Modern design', 'Versatile styling', 'Quality materials'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Add character to your home with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Unique design', 'Easy to display', 'Gift-worthy'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'lighting': [
      () => `Illuminate your space with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['LED technology', 'Energy efficient', 'Adjustable brightness'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Create ambiance with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Modern design', 'Warm light', 'Easy installation'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'dogs': [
      () => `Keep your furry friend happy with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Nutritious', 'Vet recommended', 'All-natural ingredients'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Spoil your dog with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Durable', 'Interactive', 'Safe materials'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'cats': [
      () => `Pamper your cat with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Premium quality', 'Odor control', 'Easy cleanup'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Keep your cat healthy with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Complete nutrition', 'Grain-free', 'Vet approved'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'power-hand-tools': [
      () => `Tackle any project with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Powerful motor', 'Ergonomic design', 'Long battery life'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Professional results with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Cordless convenience', 'Precision control', 'Durable construction'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'games-puzzles': [
      () => `Entertain for hours with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Family-friendly', 'Challenging', 'Replayable'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Test your skills with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['High-quality pieces', 'Clear instructions', 'Satisfying challenge'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'pc-games': [
      () => `Immerse yourself in this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Stunning graphics', 'Engaging storyline', 'Hours of gameplay'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Experience epic adventures with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Open world', 'Multiplayer support', 'Regular updates'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'ps5': [
      () => `Play the latest with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['4K graphics', 'Haptic feedback', 'Exclusive content'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Next-gen gaming with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Ray tracing', 'Fast loading', 'Immersive audio'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    'nintendo-switch': [
      () => `Gaming on the go with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Portable design', 'Family-friendly', 'Exclusive titles'])}. ${random(features)} and ${random(benefits)}.`,
      () => `Fun for everyone with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(['Local multiplayer', 'Creative gameplay', 'Nostalgic appeal'])}. ${random(features)}. ${random(benefits)}.`,
    ],
    
    // Default template
    'default': [
      () => `Discover this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. Made from ${faker.commerce.productMaterial()} and ${random(benefits)}. Perfect for ${random(['home', 'office', 'personal use'])}.`,
      () => `Experience quality with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. With ${random(['durable', 'stylish', 'functional'])} design. ${random(benefits)}.`,
      () => `Upgrade your collection with this ${random(adjectives).toLowerCase()} ${productName.toLowerCase()}. ${random(features)}. ${random(['Versatile', 'Reliable', 'Modern'])} design. ${random(benefits)}.`,
    ],
  };
  
  // Get templates for this subcategory or use default
  const templates = descriptionTemplateFunctions[subcategorySlug] || descriptionTemplateFunctions['default'];
  
  // Select and execute template function based on index to ensure variety
  const templateFunction = templates[index % templates.length];
  let selectedDescription = templateFunction();
  
  // Add unique variations to make each description different
  const callToActions = [
    ' Order now and experience the difference.',
    ' Limited stock available.',
    ' Free shipping on orders over KES 5,000.',
    ' 30-day money-back guarantee.',
    ' Perfect gift for any occasion.',
    ' Trusted by thousands of satisfied customers.',
  ];
  
  // Add variation based on index to ensure uniqueness
  if (index % 3 === 0) {
    selectedDescription += random(callToActions);
  }
  
  return selectedDescription;
}

/**
 * Generates a single product based on category and subcategory
 */
export async function generateProduct(
  _categoryName: string,
  categorySlug: string,
  _subcategoryName: string,
  subcategorySlug: string,
  index: number
) {
  // Only use enhanced templates - no fallback to regular templates
  const enhancedTemplates = getEnhancedTemplatesForSubcategory(subcategorySlug);
  
  // If no enhanced templates exist, throw error (should not happen if all categories have templates)
  if (enhancedTemplates.length === 0) {
    throw new Error(`No enhanced templates found for subcategory: ${subcategorySlug}`);
  }
  
  // Get the specific template for this index
  const enhancedTemplate = enhancedTemplates[index % enhancedTemplates.length] || enhancedTemplates[0];
  const template = enhancedTemplate;
  const brand = enhancedTemplate.brand;
  const specifications = enhancedTemplate.specifications || [];
  const features = enhancedTemplate.features || [];
  
  // Generate product name with brand and model
  const nameVariations = [
    `${brand} ${enhancedTemplate.model} ${enhancedTemplate.baseName}`,
    `${brand} ${enhancedTemplate.baseName} ${enhancedTemplate.model}`,
    `${brand} ${enhancedTemplate.model}`,
    `${brand} ${enhancedTemplate.baseName} ${faker.helpers.arrayElement(['Pro', 'Plus', 'Max', 'Elite'])}`,
  ];
  const productName = nameVariations[index % nameVariations.length];
  
  // Use the unique description from the template, or generate a fallback
  const description = enhancedTemplate.description || `${productName}. ${specifications.join(', ')}. ${features.join(', ')}. Perfect for everyday use and professional applications.`;
  
  // Generate price
  const priceRange = (template as any).priceRange || template.priceRange;
  const price = faker.number.int(priceRange);
  const hasDiscount = faker.datatype.boolean({ probability: 0.3 });
  const originalPrice = hasDiscount 
    ? Math.round(price * faker.number.float({ min: 1.1, max: 1.5 }))
    : undefined;
  
  // Generate rating and reviews
  const ratingRange = (template as any).ratingRange || template.ratingRange;
  const reviewCountRange = (template as any).reviewCountRange || template.reviewCountRange;
  const rating = faker.number.float({ 
    min: ratingRange?.min || 3.5, 
    max: ratingRange?.max || 5.0,
    fractionDigits: 1 
  });
  const reviewCount = faker.number.int({ 
    min: reviewCountRange?.min || 10, 
    max: reviewCountRange?.max || 5000 
  });
  
  // Generate stock
  const stock = faker.number.int({ 
    min: 0, 
    max: 200 
  });
  const lowStockThreshold = Math.max(5, Math.floor(stock * 0.1));
  
  // Generate SKU
  const sku = `${categorySlug.toUpperCase().substring(0, 3)}-${subcategorySlug.toUpperCase().substring(0, 3)}-${faker.string.alphanumeric(6).toUpperCase()}`;
  
  // Generate slug
  const slug = `${categorySlug}-${subcategorySlug}-${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${faker.string.alphanumeric(4)}`;
  
  // Use imageUrl from template if available (from Jumia scraping), otherwise fetch from Pixabay
  const templateImageUrl = (enhancedTemplate as any).imageUrl || enhancedTemplate.imageUrl;
  
  let image: string;
  let images: string[];
  
  if (templateImageUrl) {
    // Use the scraped Jumia image URL
    image = templateImageUrl;
    // Use the same image for the images array, or fetch additional images as fallback
    const imageKeywords = (template as any).imageKeywords || template.imageKeywords || `${brand} ${productName}`;
    const additionalImages = await fetchProductImages(imageKeywords, 2).catch(() => []);
    images = [templateImageUrl, ...additionalImages];
  } else {
    // Fallback to fetching from Pixabay if no imageUrl in template
    const imageKeywords = (template as any).imageKeywords || template.imageKeywords || `${brand} ${productName}`;
    image = await fetchProductImage(imageKeywords);
    images = await fetchProductImages(imageKeywords, 3);
  }
  
  // Generate variants if needed
  let variants;
  const variantTypes = (template as any).variantTypes || template.variantTypes;
  const hasVariants = (template as any).hasVariants || template.hasVariants;
  
  if (hasVariants && variantTypes) {
    variants = variantTypes.map((type: string, idx: number) => {
      let variantValue: string;
      if (type.toLowerCase() === 'color') {
        variantValue = faker.helpers.arrayElement(['Black', 'White', 'Silver', 'Blue', 'Red', 'Gray', 'Space Gray']);
      } else if (type.toLowerCase() === 'size') {
        variantValue = faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
      } else if (type.toLowerCase() === 'storage') {
        variantValue = faker.helpers.arrayElement(['128GB', '256GB', '512GB', '1TB']);
      } else if (type.toLowerCase() === 'ram') {
        variantValue = faker.helpers.arrayElement(['8GB', '16GB', '32GB']);
      } else {
        variantValue = faker.color.human();
      }
      
      return {
        id: faker.string.uuid(),
        name: `${type} - ${variantValue}`,
        sku: `${sku}-V${idx + 1}`,
        price: price + faker.number.int({ min: -500, max: 1000 }),
        stock: faker.number.int({ min: 0, max: 50 }),
        attributes: { [type.toLowerCase()]: variantValue },
      };
    });
  }
  
  // Determine if featured (10% chance)
  const featured = faker.datatype.boolean({ probability: 0.1 });
  
  return {
    name: productName,
    slug,
    description,
    price,
    originalPrice,
    category: subcategorySlug, // Store subcategory slug since products belong to subcategories
    image,
    images,
    rating,
    reviewCount,
    stock,
    lowStockThreshold,
    sku,
    variants,
    featured,
    createdAt: faker.date.recent({ days: 90 }),
  };
}

/**
 * Generates multiple products for a category/subcategory
 */
export async function generateProductsForSubcategory(
  categoryName: string,
  categorySlug: string,
  subcategoryName: string,
  subcategorySlug: string,
  count: number = 20
) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const product = await generateProduct(
      categoryName,
      categorySlug,
      subcategoryName,
      subcategorySlug,
      i
    );
    products.push(product);
    
    // Small delay to avoid rate limiting on image fetching
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return products;
}

