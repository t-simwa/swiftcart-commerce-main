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

// User agents to rotate
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
        headless: 'new',
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
 * Search Jumia for products by search query
 */
export async function searchJumiaProducts(
  searchQuery: string,
  maxProducts: number = 1
): Promise<ScrapedProduct[]> {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    // Block unnecessary resources to speed up loading (fonts, stylesheets)
    // Keep images enabled as we need them for product pages
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      // Block fonts and stylesheets to speed up - we need HTML, scripts, and images
      if (['font', 'stylesheet'].indexOf(resourceType) !== -1) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
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
    
    // Remove webdriver property (using function instead of arrow function)
    await page.evaluateOnNewDocument(function() {
      Object.defineProperty(navigator, 'webdriver', {
        get: function() { return false; },
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: function() { return [1, 2, 3, 4, 5]; },
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: function() { return ['en-US', 'en']; },
      });
    });
    
    // Navigate to Jumia search
    const searchUrl = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(searchQuery)}`;
    console.log(`  🔍 Searching Jumia for: ${searchQuery}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    
    // Wait for page to load and for dynamic content (reduced delay)
    await delay(1000 + Math.random() * 500);
    
    // Scroll to trigger lazy loading (faster scrolling)
    await page.evaluate(function() {
      window.scrollTo(0, 500);
    });
    await delay(300);
    
    await page.evaluate(function() {
      window.scrollTo(0, 1000);
    });
    await delay(300);
    
    // Wait for products to load - try multiple selectors based on actual Jumia structure
    let productsFound = false;
    const possibleSelectors = [
      'article.prd',
      'article[class*="prd"]',
      'article a.core',
      'a[href*=".html"]',
      '[data-sku]',
    ];
    
    for (const selector of possibleSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        productsFound = true;
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }
    
    if (!productsFound) {
      console.log(`    ⚠️  Products might be loading dynamically, waiting longer...`);
      await delay(1500); // Reduced wait time for AJAX content
    }
    
    // Extract product links using page.evaluate (runs in browser context)
    const productLinks: string[] = [];
    
    const linksFromPage = await page.evaluate(function(max) {
      const links = [];
      const seen = new Set();
      
      // Function to clean and validate URL (using indexOf for compatibility)
      const cleanUrl = function(href) {
        if (!href) return null;
        let url = href;
        
        // Remove query parameters and fragments
        if (url.indexOf('?') !== -1) url = url.split('?')[0];
        if (url.indexOf('#') !== -1) url = url.split('#')[0];
        
        // Make absolute URL
        if (url.indexOf('http') !== 0) {
          if (url.indexOf('//') === 0) {
            url = 'https:' + url;
          } else if (url.indexOf('/') === 0) {
            url = 'https://www.jumia.co.ke' + url;
          } else {
            return null;
          }
        }
        
        // Jumia product URLs end with .html (e.g., /logitech-m171-wireless-mouse-306250489.html)
        // Must be a product page URL (ends with .html and is not a category page)
        if (url.indexOf('.html') === -1 || url.indexOf('/catalog/') !== -1 || url.indexOf('/all-products/') !== -1) {
          return null;
        }
        
        return url;
      };
      
      // Method 1: Look for article tags with class "prd" (product cards)
      const articles = document.querySelectorAll('article.prd, article[class*="prd"]');
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        // Find the product link inside the article (usually has class "core")
        const link = article.querySelector('a.core, a[href*=".html"]');
        if (link && link.href) {
          const url = cleanUrl(link.href);
          if (url && !seen.has(url)) {
            seen.add(url);
            links.push(url);
            if (links.length >= max) break;
          }
        }
      }
      
      if (links.length < max) {
        // Method 2: Look for all links ending with .html (product pages)
        const allLinks = document.querySelectorAll('a[href*=".html"]');
        for (let i = 0; i < allLinks.length; i++) {
          if (links.length >= max) break;
          const link = allLinks[i];
          if (link && link.href) {
            const url = cleanUrl(link.href);
            if (url && !seen.has(url) && url.indexOf('/catalog/') === -1) {
              seen.add(url);
              links.push(url);
            }
          }
        }
      }
      
      return links.slice(0, max);
    }, maxProducts);
    
    productLinks.push(...linksFromPage);
    
    console.log(`  📦 Found ${productLinks.length} products`);
    
    if (productLinks.length === 0) {
      // Try one more time with a different approach - check page source
      console.log(`    🔄 Retrying with alternative method...`);
      await delay(1000);
      
      const retryLinks = await page.evaluate(function() {
        const links = [];
        // Look for any links that contain product identifiers
        const allLinks = document.querySelectorAll('a[href]');
        for (let i = 0; i < allLinks.length; i++) {
          const link = allLinks[i];
          if (link && link.href) {
            const href = link.href;
            if (href && (href.indexOf('/products/') !== -1 || (href.indexOf('/catalog/') !== -1 && href.indexOf('.html') !== -1))) {
              let cleanUrl = href.split('?')[0];
              if (cleanUrl.indexOf('http') !== 0) {
                cleanUrl = 'https://www.jumia.co.ke' + cleanUrl;
              }
              if (links.indexOf(cleanUrl) === -1 && cleanUrl.indexOf('/products/') !== -1) {
                links.push(cleanUrl);
              }
            }
          }
        }
        return links.slice(0, 5); // Get first 5
      });
      
      if (retryLinks.length > 0) {
        productLinks.push(...retryLinks);
        console.log(`    ✅ Found ${retryLinks.length} products on retry`);
      }
    }
    
    // Extract images directly from search results page (no need to navigate to product pages)
    const products = await page.evaluate(function(max) {
      const results = [];
      const seen = new Set();
      
      // Look for product cards (article.prd)
      const articles = document.querySelectorAll('article.prd, article[class*="prd"]');
      
      for (let i = 0; i < articles.length && results.length < max; i++) {
        const article = articles[i];
        
        // Find product link
        const linkElement = article.querySelector('a.core, a[href*=".html"]');
        if (!linkElement || !linkElement.href) continue;
        
        let productUrl = linkElement.href;
        // Clean URL
        if (productUrl.indexOf('?') !== -1) productUrl = productUrl.split('?')[0];
        if (productUrl.indexOf('#') !== -1) productUrl = productUrl.split('#')[0];
        if (productUrl.indexOf('http') !== 0) {
          if (productUrl.indexOf('//') === 0) {
            productUrl = 'https:' + productUrl;
          } else if (productUrl.indexOf('/') === 0) {
            productUrl = 'https://www.jumia.co.ke' + productUrl;
          } else {
            continue;
          }
        }
        
        // Skip if not a product page URL
        if (productUrl.indexOf('.html') === -1 || productUrl.indexOf('/catalog/') !== -1) {
          continue;
        }
        
        // Skip duplicates
        if (seen.has(productUrl)) continue;
        seen.add(productUrl);
        
        // Extract product name
        const nameElement = article.querySelector('h3.name, .name, h3');
        const name = nameElement ? nameElement.textContent.trim() : '';
        
        // Extract price
        const priceElement = article.querySelector('.prc, [class*="prc"]');
        let price = 0;
        if (priceElement) {
          const priceText = priceElement.textContent || '';
          const priceMatch = priceText.replace(/[^\d.]/g, '').match(/[\d.]+/);
          if (priceMatch) {
            const priceStr = priceMatch[0].replace(/,/g, '');
            price = Math.round(parseFloat(priceStr) * 100); // Convert to cents
          }
        }
        
        // Extract image from search results
        let image = '';
        const imgElement = article.querySelector('img[data-src], img[src*="jumia.is"]');
        if (imgElement) {
          const imgSrc = imgElement.getAttribute('data-src') || imgElement.getAttribute('src') || '';
          if (imgSrc && imgSrc.indexOf('jumia.is') !== -1) {
            image = imgSrc.split('?')[0];
            // Ensure full URL
            if (image.indexOf('http') !== 0) {
              image = image.indexOf('//') === 0 ? 'https:' + image : 'https:' + image;
            }
            // Try to get higher resolution
            image = image.replace(/fit-in\/\d+x\d+\//, 'fit-in/1500x1500/');
          }
        }
        
        if (name && image) {
          results.push({
            name: name.substring(0, 200),
            description: name + ' - High-quality product with excellent features.',
            price: price || 500000, // Default 5000 KES in cents
            image: image,
            images: [image],
            rating: 4.0,
            reviewCount: 0,
            url: productUrl,
          });
        }
      }
      
      return results;
    }, maxProducts);
    
    if (products.length === 0) {
      console.log(`    ⚠️  No products found. Page might have different structure.`);
      // Log page title for debugging
      const pageTitle = await page.title();
      console.log(`    📄 Page title: ${pageTitle}`);
      return [];
    }
    
    return products;
  } catch (error: any) {
    console.error(`  ❌ Error searching Jumia: ${error.message}`);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Scrape a single Jumia product page
 */
async function scrapeProductPage(page: Page, productUrl: string): Promise<ScrapedProduct | null> {
  try {
    // Navigate to product page (using networkidle2 for faster loading)
    // Request interception is already set from searchJumiaProducts
    await page.goto(productUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Wait for page to load (reduced delay)
    await delay(800 + Math.random() * 400);
    
    // Simulate human behavior - scroll (minimal delay)
    await page.evaluate(function() {
      window.scrollTo(0, Math.floor(Math.random() * 800));
    });
    await delay(300);
    
    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Extract product name - Jumia uses various selectors
    const name = 
      $('h1.-fs20.-pts.-pbxs').text().trim() ||
      $('h1[data-name]').text().trim() ||
      $('h1.-m.-fs24').text().trim() ||
      $('.name').text().trim() ||
      $('h1').first().text().trim() ||
      '';
    
    if (!name) {
      return null;
    }
    
    // Extract price (Jumia prices are in KES)
    let price = 0;
    const priceText = 
      $('span.-b.-ltr.-tal.-fs24').text().trim() ||
      $('span[data-price]').attr('data-price') ||
      $('.price').first().text().trim() ||
      $('.-fs24.-b').text().trim() ||
      '';
    
    if (priceText) {
      // Extract number from price string (handles formats like KSh 2,999, 1,234.56, etc.)
      const priceMatch = priceText.replace(/[^\d.]/g, '').match(/[\d.]+/);
      if (priceMatch) {
        const priceStr = priceMatch[0].replace(/,/g, '');
        const kesPrice = parseFloat(priceStr) || 0;
        // Convert to cents (multiply by 100)
        price = Math.round(kesPrice * 100);
      }
    }
    
    // Extract original price (if on sale)
    let originalPrice: number | undefined;
    const originalPriceText = 
      $('span.-tal.-gy5.-ltr.-fs16').text().trim() ||
      $('span.-gy5.-ltr').text().trim() ||
      $('.old-price').text().trim() ||
      '';
    
    if (originalPriceText) {
      const originalPriceMatch = originalPriceText.replace(/[^\d.]/g, '').match(/[\d.]+/);
      if (originalPriceMatch) {
        const originalPriceStr = originalPriceMatch[0].replace(/,/g, '');
        const originalKes = parseFloat(originalPriceStr) || 0;
        const originalCents = Math.round(originalKes * 100);
        if (originalCents > price && price > 0) {
          originalPrice = originalCents;
        }
      }
    }
    
    // If no price found, set a default
    if (price === 0) {
      price = 500000; // Default 5000 KES in cents
    }
    
    // Extract description
    const description = 
      $('div.markup.-mhm.-pvl.-oxa.-sc').text().trim() ||
      $('div[data-name="description"]').text().trim() ||
      $('.product-description').text().trim() ||
      $('.-pvs').text().trim() ||
      'High-quality product with excellent features and performance.';
    
    // Extract rating
    let rating = 4.0;
    const ratingText = 
      $('div.stars._m._al').attr('style') ||
      $('[data-rating]').attr('data-rating') ||
      $('.stars').attr('style') ||
      '';
    
    if (ratingText) {
      // Jumia uses percentage in style attribute like "width: 80%"
      const ratingMatch = ratingText.match(/(\d+)/);
      if (ratingMatch) {
        const percentage = parseInt(ratingMatch[1]) || 0;
        rating = (percentage / 100) * 5; // Convert percentage to 5-star rating
      }
    }
    
    // Extract review count
    let reviewCount = 0;
    const reviewCountText = 
      $('a.-plxs').text().trim() ||
      $('a[href*="#reviews"]').text().trim() ||
      $('.reviews').text().trim() ||
      '';
    
    if (reviewCountText) {
      const reviewMatch = reviewCountText.replace(/[^0-9]/g, '');
      reviewCount = parseInt(reviewMatch) || 0;
    }
    
    // Extract main image - Jumia uses data-src for lazy loading
    let image = '';
    const imageSelectors = [
      'div.img-c img[data-src]',
      'img[data-src*="ke.jumia.is"]',
      'img[data-src*="jumia.is"]',
      'img[data-src]',
      'img[src*="ke.jumia.is"]',
      '.img-c img',
    ];
    
    for (const selector of imageSelectors) {
      const imgSrc = $(selector).first().attr('data-src') || $(selector).first().attr('src');
      if (imgSrc && imgSrc.indexOf('jumia.is') !== -1) {
        // Get full resolution image - remove size constraints from URL
        // Jumia URLs look like: https://ke.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/98/4052603/1.jpg
        // We want to get higher resolution by removing fit-in/300x300
        image = imgSrc.split('?')[0]; // Remove query parameters
        // Ensure it's a full URL
        if (image.indexOf('http') !== 0) {
          image = image.indexOf('//') === 0 ? 'https:' + image : 'https:' + image;
        }
        // Try to get higher resolution by modifying the URL
        // Replace fit-in/300x300 with fit-in/1500x1500 or remove it
        image = image.replace(/fit-in\/\d+x\d+\//, 'fit-in/1500x1500/');
        break;
      }
    }
    
    // Extract additional images
    const images: string[] = [];
    const imageElements = $('div.img-c img[data-src], img[data-src*="ke.jumia.is"], img[data-src*="jumia.is"]');
    
    imageElements.each(function(_, el) {
      const imgSrc = $(el).attr('data-src') || $(el).attr('src');
      if (imgSrc && imgSrc.indexOf('jumia.is') !== -1) {
        let fullUrl = imgSrc.indexOf('http') === 0 ? imgSrc : (imgSrc.indexOf('//') === 0 ? 'https:' + imgSrc : 'https:' + imgSrc);
        const cleanUrl = fullUrl.split('?')[0];
        // Try to get higher resolution
        const highResUrl = cleanUrl.replace(/fit-in\/\d+x\d+\//, 'fit-in/1500x1500/');
        if (highResUrl && images.indexOf(highResUrl) === -1 && images.length < 5) {
          images.push(highResUrl);
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
    if (!name || !image) {
      return null;
    }
    
    return {
      name: name.substring(0, 200),
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
  const cleanSubcategory = subcategoryName.replace(/^All\s+/i, '');
  return `${categoryName} ${cleanSubcategory}`;
}

