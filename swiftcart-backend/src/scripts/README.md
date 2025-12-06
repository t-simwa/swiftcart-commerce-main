# Product Seeding Scripts

This directory contains scripts for seeding the database with product data.

## Amazon Product Scraper (Recommended)

The Amazon scraper fetches real product data directly from Amazon.com, including:
- Real product names and descriptions
- Actual product images (high-resolution)
- Real prices (converted to KES)
- Actual ratings and review counts
- Product specifications

### Usage

```bash
# Scrape products from Amazon for all categories
pnpm run seed:amazon
```

### Features

- ✅ Scrapes real products from Amazon.com
- ✅ Gets actual product images (high-resolution)
- ✅ Real product descriptions and specifications
- ✅ Actual ratings and review counts
- ✅ Handles rate limiting with delays
- ✅ Rotates user agents to avoid detection
- ✅ Creates inventory records automatically

### Configuration

Edit `seedProductsAmazon.ts` to customize:

- `PRODUCTS_PER_SUBCATEGORY`: Number of products to scrape per subcategory (default: 20)
- `SKIP_EXISTING`: Skip categories that already have products (default: false)

### Notes

- **This script may take several hours to complete** due to:
  - Rate limiting delays (3-5 seconds between products)
  - 10-second delay between subcategories
  - Network requests to Amazon
  
- **Amazon may block requests** if too many are made too quickly. The script includes:
  - Random delays between requests
  - User agent rotation
  - Error handling for blocked requests

- **Price Conversion**: Prices are automatically converted from USD to KES (approximate rate: 1 USD = 130 KES)

- **For Portfolio/Demonstration Use Only**: This scraper is intended for portfolio/demonstration purposes only, not commercial use.

---

## Product Generator (Alternative)

The product generator creates realistic product data with unique images for each product across all categories and subcategories.

### Usage

```bash
# Generate products using Faker.js and Unsplash
pnpm run seed:products
```

### Features

- ✅ Generates products for all categories and subcategories
- ✅ Each product gets a unique image from Unsplash based on product name/keywords
- ✅ Realistic product data (names, descriptions, prices, ratings, reviews)
- ✅ Configurable number of products per subcategory
- ✅ Handles duplicates gracefully
- ✅ Creates inventory records automatically

### Configuration

Edit `seedProducts.ts` to customize:

- `PRODUCTS_PER_SUBCATEGORY`: Number of products to generate per subcategory (default: 20)
- `SKIP_EXISTING`: Skip categories that already have products (default: false)

### Product Templates

Product templates are defined in `utils/productGenerator.ts`. Each subcategory can have specific product templates with:
- Product name patterns
- Price ranges
- Image search keywords
- Rating and review ranges
- Stock ranges
- Variant options

### Image Fetching

Images are fetched from Unsplash using the product name and category keywords. Each product gets:
- 1 main image
- 3 additional images (in the `images` array)

### Notes

- The script may take a while to run due to image fetching (200ms delay between products)
- Images are fetched from Unsplash Source API (no API key required)
- Products are generated with realistic variations using Faker.js
- Each product gets a unique SKU and slug
