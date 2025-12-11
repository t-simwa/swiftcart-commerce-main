# Manual Product Collection Guide

Since Amazon has strong bot detection, we'll collect products manually. Here's how to do it efficiently:

## Method 1: Using the JSON File (Recommended)

1. **Open** `swiftcart-backend/src/scripts/data/manualProducts.json`

2. **For each product on Amazon**, copy this template and fill it in:

```json
{
  "name": "Product Name from Amazon",
  "description": "Copy the product description and key features from Amazon",
  "priceUsd": 29.99,
  "originalPriceUsd": 39.99,
  "imageUrl": "https://m.media-amazon.com/images/I/...",
  "images": [
    "https://m.media-amazon.com/images/I/...",
    "https://m.media-amazon.com/images/I/...",
    "https://m.media-amazon.com/images/I/..."
  ],
  "rating": 4.5,
  "reviewCount": 1234,
  "category": "electronics",
  "subcategory": "computers-accessories",
  "amazonUrl": "https://www.amazon.com/dp/..."
}
```

3. **How to get the data from Amazon:**

   - **Name**: Copy the product title
   - **Description**: Copy the "About this item" section or key features
   - **Price**: Look for the price (e.g., $29.99) - enter as number without $
   - **Original Price**: If there's a strikethrough price, use that
   - **Image URL**: 
     - Right-click on the main product image → "Copy image address"
     - Or inspect element and copy the `src` attribute
   - **Additional Images**: 
     - Scroll through the product images
     - Right-click each → "Copy image address"
   - **Rating**: The star rating (e.g., 4.5 out of 5)
   - **Review Count**: Number of reviews (e.g., "1,234 reviews" → 1234)
   - **Category/Subcategory**: Use the slugs from your categories file
   - **Amazon URL**: Copy the full product URL

4. **Save the file** and run:
   ```bash
   pnpm run seed:manual
   ```

## Method 2: Quick Collection Tips

### Efficient Workflow:

1. **Open Amazon in one tab**
2. **Open `manualProducts.json` in your editor**
3. **Navigate to a category** (e.g., Electronics → Computers & Accessories)
4. **For each product:**
   - Click on the product
   - Copy all the details
   - Paste into the JSON file
   - Go back to search results
   - Repeat

### Quick Copy Tips:

- **Image URLs**: Right-click → Copy image address (works for all images)
- **Description**: Select the "About this item" section → Copy
- **Price**: Just copy the number (e.g., "29.99" from "$29.99")
- **Rating**: Usually visible as "4.5 out of 5 stars"

### Categories Reference:

Use these category slugs (from `swiftcart-backend/src/scripts/data/categories.ts`):

- `electronics` → `computers-accessories`, `cell-phones`, `tv-video`, etc.
- `computers` → `laptops`, `desktops`, `tablets`, etc.
- `womens-fashion` → `womens-clothing`, `womens-shoes`, etc.
- `mens-fashion` → `mens-clothing`, `mens-shoes`, etc.
- And so on...

## Method 3: Batch Collection

If you want to collect many products:

1. Create separate JSON files per category:
   - `electronics-products.json`
   - `fashion-products.json`
   - etc.

2. Then merge them all into `manualProducts.json` before seeding

## Running the Seed

Once you've added products to `manualProducts.json`:

```bash
cd swiftcart-backend
pnpm run seed:manual
```

This will:
- Read all products from the JSON file
- Convert USD prices to KES automatically
- Generate SKUs and slugs
- Create inventory records
- Insert everything into your database

## Example Product Entry

```json
{
  "name": "Logitech MX Master 3S Wireless Mouse",
  "description": "Advanced wireless mouse with Darkfield high-precision sensor, comfortable ergonomic design, and multi-device connectivity. Features quiet clicks and customizable buttons.",
  "priceUsd": 99.99,
  "originalPriceUsd": 129.99,
  "imageUrl": "https://m.media-amazon.com/images/I/61ni3t1RYQL._AC_SL1500_.jpg",
  "images": [
    "https://m.media-amazon.com/images/I/61ni3t1RYQL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/61B84ep+tmL._AC_SL1500_.jpg",
    "https://m.media-amazon.com/images/I/61XDeaOrbYL._AC_SL1500_.jpg"
  ],
  "rating": 4.7,
  "reviewCount": 45231,
  "category": "electronics",
  "subcategory": "computers-accessories",
  "amazonUrl": "https://www.amazon.com/dp/B09HM94VDS"
}
```

## Tips

- **Start with 5-10 products per subcategory** to test
- **Use browser extensions** like "Copy All URLs" to quickly get image URLs
- **Focus on popular products** with good ratings and reviews
- **Keep the JSON file valid** - make sure all brackets and commas are correct
- **Use a JSON validator** if you're unsure about syntax

