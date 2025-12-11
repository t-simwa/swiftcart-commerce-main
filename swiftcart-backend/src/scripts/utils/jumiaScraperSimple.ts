import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';

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
const pagePool: any[] = [];
const MAX_POOL_SIZE = 10; // Maximum number of pages to keep in pool

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
          '--window-size=1920,1080',
        ],
        ignoreHTTPSErrors: true,
      });
    } catch (error: any) {
      if (error.message && error.message.indexOf('Could not find Chrome') !== -1) {
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
 * Get a page from pool or create new one
 */
async function getPage(): Promise<any> {
  await initBrowser();
  if (pagePool.length > 0) {
    return pagePool.pop();
  }
  return browser!.newPage();
}

/**
 * Return page to pool
 */
function returnPage(page: any): void {
  try {
    if (pagePool.length < MAX_POOL_SIZE && page && !page.isClosed()) {
      pagePool.push(page);
    } else if (page && !page.isClosed()) {
      page.close().catch(() => {});
    }
  } catch (error) {
    // Page might be closed or invalid, ignore
    try {
      if (page && !page.isClosed()) {
        page.close().catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  // Close all pages in pool
  for (const page of pagePool) {
    try {
      if (!page.isClosed()) {
        await page.close();
      }
    } catch (error) {
      // Ignore errors
    }
  }
  pagePool.length = 0;
  
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
 * Wait for a delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

/**
 * Clean and validate URL
 */
function cleanUrl(href: string): string | null {
  if (!href) return null;
  let url = href;
  
  // Remove query parameters and fragments
  const qIndex = url.indexOf('?');
  if (qIndex !== -1) url = url.substring(0, qIndex);
  const hIndex = url.indexOf('#');
  if (hIndex !== -1) url = url.substring(0, hIndex);
  
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
  
  // Jumia product URLs end with .html
  if (url.indexOf('.html') === -1 || url.indexOf('/catalog/') !== -1) {
    return null;
  }
  
  return url;
}

/**
 * Extract products from HTML using Cheerio (runs in Node.js context, no serialization issues)
 */
function extractProductsFromHtml(html: string, maxProducts: number): ScrapedProduct[] {
  const $ = cheerio.load(html);
  const results: ScrapedProduct[] = [];
  const seenUrls = new Set<string>();
  
  // Find all product articles
  const articles = $('article.prd, article[class*="prd"]');
  
  for (let i = 0; i < articles.length && results.length < maxProducts; i++) {
    const article = $(articles[i]);
    
    // Find product link
    const linkElement = article.find('a.core, a[href*=".html"]').first();
    if (linkElement.length === 0) continue;
    
    const href = linkElement.attr('href');
    if (!href) continue;
    
    const productUrl = cleanUrl(href);
    if (!productUrl || seenUrls.has(productUrl)) continue;
    seenUrls.add(productUrl);
    
    // Extract product name
    const nameElement = article.find('h3.name, .name, h3').first();
    const name = nameElement.text().trim();
    if (!name) continue;
    
    // Extract price
    const priceElement = article.find('.prc, [class*="prc"]').first();
    let price = 0;
    if (priceElement.length > 0) {
      const priceText = priceElement.text();
      const priceMatch = priceText.replace(/[^\d.]/g, '').match(/[\d.]+/);
      if (priceMatch) {
        const priceStr = priceMatch[0].replace(/,/g, '');
        price = Math.round(parseFloat(priceStr) * 100); // Convert to cents
      }
    }
    
    // Extract image from search results
    let image = '';
    const imgElement = article.find('img[data-src], img[src*="jumia.is"]').first();
    if (imgElement.length > 0) {
      // Get the full data-src attribute value (this should contain the complete URL)
      let imgSrc = imgElement.attr('data-src') || imgElement.attr('src') || '';
      
      // If data-src is empty or doesn't contain jumia.is, try to get it from the element's outerHTML
      if (!imgSrc || imgSrc.indexOf('jumia.is') === -1) {
        const outerHtml = imgElement.toString();
        // Extract URL from data-src="..." in the HTML
        const dataSrcMatch = outerHtml.match(/data-src=["']([^"']*jumia\.is[^"']*)["']/);
        if (dataSrcMatch && dataSrcMatch[1]) {
          imgSrc = dataSrcMatch[1];
        }
      }
      
      if (imgSrc && imgSrc.indexOf('jumia.is') !== -1) {
        // Remove query parameters but preserve the complete path including filename
        const qIndex = imgSrc.indexOf('?');
        image = qIndex !== -1 ? imgSrc.substring(0, qIndex) : imgSrc;
        
        // Ensure full URL
        if (image.indexOf('http') !== 0) {
          if (image.indexOf('//') === 0) {
            image = 'https:' + image;
          } else {
            image = 'https:' + image;
          }
        }
        
        // Try to get higher resolution - replace fit-in size but preserve the entire filename
        // URL format: https://ke.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/98/4052603/1.jpg
        // We want: https://ke.jumia.is/unsafe/fit-in/1500x1500/filters:fill(white)/product/98/4052603/1.jpg
        image = image.replace(/fit-in\/\d+x\d+\//, 'fit-in/1500x1500/');
        
        // Ensure the URL ends with a file extension (.jpg, .jpeg, or .png)
        // Jumia product image URLs follow pattern: /product/[num]/[num]/[num].jpg
        // But sometimes we get incomplete URLs like: /product/[num]/[num] (missing final number and extension)
        if (image.indexOf('.jpg') === -1 && image.indexOf('.jpeg') === -1 && image.indexOf('.png') === -1) {
          // Check if we have the complete product path pattern: /product/[num]/[num]/[num]
          const completePathMatch = image.match(/\/product\/(\d+)\/(\d+)\/(\d+)$/);
          if (completePathMatch) {
            // Has 3 numbers but missing extension - add .jpg
            image = image + '.jpg';
          } else {
            // Check if we have incomplete path: /product/[num]/[num] (missing final number and extension)
            const incompletePathMatch = image.match(/\/product\/(\d+)\/(\d+)$/);
            if (incompletePathMatch) {
              // Append /1.jpg to complete the URL
              image = image + '/1.jpg';
            } else {
              // Check if URL ends with a number (might be the final segment)
              const numberAtEndMatch = image.match(/\/product\/\d+\/\d+\/(\d+)$/);
              if (numberAtEndMatch) {
                // Has number but missing extension - add .jpg
                image = image + '.jpg';
              }
            }
          }
        }
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
}

/**
 * Search Jumia for products by search query
 * This version avoids all browser context code to prevent __name errors
 * Optimized for concurrent use with page pooling
 */
export async function searchJumiaProducts(
  searchQuery: string,
  maxProducts: number = 1
): Promise<ScrapedProduct[]> {
  const page = await getPage();
  
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
    
    // Navigate to Jumia search
    const searchUrl = 'https://www.jumia.co.ke/catalog/?q=' + encodeURIComponent(searchQuery);
    
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    
    // Reduced wait time for faster processing
    await delay(500 + Math.floor(Math.random() * 300));
    
    // Simple scroll using basic JavaScript (no complex logic)
    await page.evaluate(function() {
      window.scrollTo(0, 500);
    });
    await delay(200);
    
    await page.evaluate(function() {
      window.scrollTo(0, 1000);
    });
    await delay(200);
    
    // Reduced wait for dynamic content
    await delay(300);
    
    // Get HTML content and parse with Cheerio (runs in Node.js, no serialization issues)
    const html = await page.content();
    const products = extractProductsFromHtml(html, maxProducts);
    
    return products;
  } catch (error: any) {
    // If page is closed or error, don't return to pool
    if (error.message && error.message.indexOf('Target closed') === -1) {
      console.error('  ❌ Error searching Jumia: ' + (error.message || 'Unknown error'));
    }
    return [];
  } finally {
    // Return page to pool for reuse
    returnPage(page);
  }
}

/**
 * Get search query for a category/subcategory
 */
export function getSearchQuery(categoryName: string, subcategoryName: string): string {
  const cleanSubcategory = subcategoryName.replace(/^All\s+/i, '');
  return categoryName + ' ' + cleanSubcategory;
}

