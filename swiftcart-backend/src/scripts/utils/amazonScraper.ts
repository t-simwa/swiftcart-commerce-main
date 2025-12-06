import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

export interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  url?: string;
}

// User agents to rotate - more realistic and recent
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
];

let browser: Browser | null = null;

/**
 * Initialize browser instance
 */
async function initBrowser(): Promise<Browser> {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: 'new', // Use new headless mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--window-size=1920,1080',
          '--start-maximized',
          '--disable-infobars',
          '--disable-extensions',
        ],
        ignoreHTTPSErrors: true,
      });
    } catch (error: any) {
      if (error.message.includes('Could not find Chrome')) {
        console.error('\n❌ Chrome browser not found!');
        console.error('Please run: pnpm exec puppeteer browsers install chrome');
        console.error('Or: npx puppeteer browsers install chrome\n');
        throw error;
      }
      throw error;
    }
  }
  return browser;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Get random user agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Wait for a random delay to avoid rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search Amazon for products by category/subcategory
 */
export async function searchAmazonProducts(
  searchQuery: string,
  maxProducts: number = 20
): Promise<ScrapedProduct[]> {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    // Set user agent
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    // Remove webdriver property and other automation indicators
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as any) :
          originalQuery(parameters)
      );
    });
    
    // Navigate to Amazon search
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&ref=sr_pg_1`;
    console.log(`  🔍 Searching Amazon for: ${searchQuery}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });
    
    // Wait a bit for page to load - longer delay
    await delay(5000 + Math.random() * 3000);
    
    // Simulate human-like behavior - scroll a bit
    await page.evaluate(() => {
      window.scrollTo(0, Math.floor(Math.random() * 500));
    });
    await delay(1000 + Math.random() * 1000);
    
    // Check if we got blocked or captcha
    const pageContent = await page.content();
    const pageTitle = await page.title();
    
    if (
      pageContent.includes('captcha') || 
      pageContent.includes('robot') || 
      pageContent.includes('Try different keywords') ||
      pageTitle.includes('Sorry') ||
      pageContent.includes('Sorry, we just need to make sure')
    ) {
      console.log(`    ⚠️  Bot detection detected, waiting longer and retrying...`);
      await delay(10000 + Math.random() * 5000);
      
      // Try navigating to homepage first, then search
      await page.goto('https://www.amazon.com', { waitUntil: 'networkidle0', timeout: 60000 });
      await delay(3000 + Math.random() * 2000);
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 60000 });
      await delay(5000 + Math.random() * 3000);
    }
    
    // Get product links from search results
    const productLinks = await page.evaluate((max) => {
      const links: string[] = [];
      // Try multiple selectors
      const selectors = [
        'h2 a[href*="/dp/"]',
        'h2 a[href*="/gp/product/"]',
        'a[href*="/dp/"]',
        'a[href*="/gp/product/"]',
        '[data-component-type="s-search-result"] h2 a',
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          const href = (el as HTMLAnchorElement).href;
          if (href && href.includes('/dp/') && !links.includes(href)) {
            // Extract clean product URL
            const match = href.match(/\/dp\/[A-Z0-9]+/);
            if (match) {
              const cleanUrl = `https://www.amazon.com${match[0]}`;
              if (!links.includes(cleanUrl)) {
                links.push(cleanUrl);
              }
            }
          }
        });
        if (links.length >= max) break;
      }
      return links.slice(0, max);
    }, maxProducts);
    
    console.log(`  📦 Found ${productLinks.length} products`);
    
    const products: ScrapedProduct[] = [];
    
    // Scrape each product
    for (let i = 0; i < productLinks.length; i++) {
      try {
        const product = await scrapeProductPage(page, productLinks[i]);
        if (product) {
          products.push(product);
          console.log(`    ✅ Scraped: ${product.name.substring(0, 50)}...`);
        }
        
        // Delay between products - longer to avoid detection
        if (i < productLinks.length - 1) {
          await delay(5000 + Math.random() * 5000); // 5-10 seconds between products
        }
      } catch (error: any) {
        console.log(`    ⚠️  Error scraping product ${i + 1}: ${error.message}`);
        continue;
      }
    }
    
    return products;
  } catch (error: any) {
    console.error(`  ❌ Error searching Amazon: ${error.message}`);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Scrape a single product page
 */
async function scrapeProductPage(page: Page, productUrl: string): Promise<ScrapedProduct | null> {
  try {
    // Navigate to product page
    await page.goto(productUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });
    
    // Longer delay for product pages
    await delay(4000 + Math.random() * 3000);
    
    // Simulate human behavior - scroll
    await page.evaluate(() => {
      window.scrollTo(0, Math.floor(Math.random() * 800));
    });
    await delay(1000 + Math.random() * 1000);
    
    // Check for captcha or blocking
    const pageContent = await page.content();
    const pageTitle = await page.title();
    
    if (
      pageContent.includes('captcha') || 
      pageContent.includes('robot') ||
      pageTitle.includes('Sorry') ||
      pageContent.includes('Sorry, we just need to make sure') ||
      pageContent.includes('Enter the characters you see')
    ) {
      console.log(`    ⚠️  Bot detection on product page, skipping...`);
      // Wait longer before next attempt
      await delay(10000);
      return null;
    }
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Extract product name
    const name = 
      $('#productTitle').text().trim() ||
      $('h1.a-size-large').text().trim() ||
      $('h1 span.a-size-large').text().trim() ||
      '';
    
    if (!name) {
      return null;
    }
    
    // Extract price - try multiple selectors
    let price = 0;
    let originalPrice: number | undefined;
    
    const priceSelectors = [
      '.a-price .a-offscreen',
      '.a-price-whole',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price.a-text-price .a-offscreen',
      'span.a-price[data-a-color="base"] .a-offscreen',
      'span.a-price[data-a-color="price"] .a-offscreen',
    ];
    
    let priceText = '';
    for (const selector of priceSelectors) {
      priceText = $(selector).first().text().trim();
      if (priceText) break;
    }
    
    // Also try to get price from data attributes
    if (!priceText) {
      const priceElement = $('[data-a-color="price"]').first();
      priceText = priceElement.find('.a-offscreen').text() || priceElement.text();
    }
    
    if (priceText) {
      // Extract number from price string (handles formats like $29.99, $1,234.56, etc.)
      const priceMatch = priceText.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        const priceStr = priceMatch[0].replace(/,/g, '');
        const usdPrice = parseFloat(priceStr) || 0;
        // Convert USD to KES (approximate rate: 1 USD = 130 KES)
        // Store price in cents (multiply by 100)
        price = Math.round(usdPrice * 130 * 100);
      }
    }
    
    // If still no price, try to get from JSON data
    if (price === 0) {
      const jsonScripts = $('script[type="application/json"]');
      jsonScripts.each((_, el) => {
        try {
          const jsonText = $(el).html();
          if (jsonText) {
            const data = JSON.parse(jsonText);
            // Look for price in various possible locations
            const priceValue = data?.price || data?.buyingPrice || data?.displayPrice;
            if (priceValue) {
              const usdPrice = parseFloat(priceValue) || 0;
              price = Math.round(usdPrice * 130 * 100);
              return false; // Break loop
            }
          }
        } catch (e) {
          // Continue to next script
        }
      });
    }
    
    // Extract original price (if on sale)
    const originalPriceSelectors = [
      '.a-price.a-text-price .a-offscreen',
      '.basisPrice .a-offscreen',
      '.a-text-price .a-offscreen',
      'span.a-price[data-a-strike="true"] .a-offscreen',
    ];
    
    let originalPriceText = '';
    for (const selector of originalPriceSelectors) {
      originalPriceText = $(selector).first().text().trim();
      if (originalPriceText) break;
    }
    
    if (originalPriceText) {
      const originalPriceMatch = originalPriceText.match(/[\d,]+\.?\d*/);
      if (originalPriceMatch) {
        const originalPriceStr = originalPriceMatch[0].replace(/,/g, '');
        const originalUsd = parseFloat(originalPriceStr) || 0;
        const originalKes = Math.round(originalUsd * 130 * 100);
        if (originalKes > price && price > 0) {
          originalPrice = originalKes;
        }
      }
    }
    
    // If no price found, set a default based on category (fallback)
    if (price === 0) {
      price = 500000; // Default 5000 KES in cents
    }
    
    // Extract description
    const description = 
      $('#feature-bullets ul li span.a-list-item')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text && !text.includes('Make sure'))
        .slice(0, 5)
        .join(' ') ||
      $('#productDescription p').text().trim() ||
      $('div#productDescription_feature_div').text().trim() ||
      'High-quality product with excellent features and performance.';
    
    // Extract rating
    let rating = 4.0;
    const ratingText = 
      $('#acrPopover span.a-icon-alt').text() ||
      $('span.a-icon-alt').first().text() ||
      '';
    
    if (ratingText) {
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      if (ratingMatch) {
        rating = parseFloat(ratingMatch[1]) || 4.0;
      }
    }
    
    // Extract review count
    let reviewCount = 0;
    const reviewCountText = 
      $('#acrCustomerReviewText').text() ||
      $('a[href*="#customerReviews"]').text() ||
      '';
    
    if (reviewCountText) {
      const reviewMatch = reviewCountText.replace(/[^0-9]/g, '');
      reviewCount = parseInt(reviewMatch) || 0;
    }
    
    // Extract main image
    let image = '';
    const imageSrc = 
      $('#landingImage').attr('src') ||
      $('#imgBlkFront').attr('src') ||
      $('img#main-image').attr('src') ||
      $('div#main-image-container img').first().attr('src') ||
      '';
    
    if (imageSrc) {
      // Get high-res version
      image = imageSrc.replace(/._.*_\./, '._AC_SL1500_.').split('._')[0] + '._AC_SL1500_.jpg';
    }
    
    // Extract additional images
    const images: string[] = [];
    $('div#altImages ul li img').each((_, el) => {
      const imgSrc = $(el).attr('src');
      if (imgSrc) {
        const highRes = imgSrc.replace(/._.*_\./, '._AC_SL1500_.').split('._')[0] + '._AC_SL1500_.jpg';
        if (highRes && !images.includes(highRes) && images.length < 5) {
          images.push(highRes);
        }
      }
    });
    
    // If no additional images, use main image
    if (images.length === 0 && image) {
      images.push(image);
    }
    
    // Ensure we have at least one image
    if (!image && images.length > 0) {
      image = images[0];
    }
    
    // Validate we have essential data
    if (!name || !image || price === 0) {
      return null;
    }
    
    return {
      name: name.substring(0, 200), // Limit name length
      description: description.substring(0, 2000) || 'High-quality product with excellent features and performance.',
      price,
      originalPrice,
      image,
      images: images.slice(0, 5),
      rating: Math.min(5.0, Math.max(1.0, rating)),
      reviewCount: Math.max(0, reviewCount),
      url: productUrl,
    };
  } catch (error: any) {
    console.error(`    Error scraping product page: ${error.message}`);
    return null;
  }
}

/**
 * Get search query for a category/subcategory
 */
export function getSearchQuery(categoryName: string, subcategoryName: string): string {
  // Remove "All" prefix from subcategory names
  const cleanSubcategory = subcategoryName.replace(/^All\s+/i, '');
  
  // Create search query
  return `${categoryName} ${cleanSubcategory}`;
}

