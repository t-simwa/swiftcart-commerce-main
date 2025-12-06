# Product Data Generation Prompt

Copy and paste this entire prompt to your AI service:

---

## Task: Generate Comprehensive Product Data for E-commerce Platform

I need you to generate a complete JSON file containing product data for an e-commerce platform. The file should include products for ALL categories and subcategories listed below.

### Output Format

Generate a single JSON file with the following structure:

```json
{
  "products": [
    {
      "name": "Brand Model Product Name",
      "slug": "brand-model-product-name",
      "description": "Detailed marketing-style product description (150-300 words) that includes specifications, features, and benefits. Should be specific to the product, not generic.",
      "price": 15000,
      "originalPrice": 18000,
      "category": "Electronics",
      "subcategory": "laptops",
      "image": "https://images.unsplash.com/photo-{photoId}?w=600&h=600&fit=crop",
      "images": [
        "https://images.unsplash.com/photo-{photoId1}?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-{photoId2}?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-{photoId3}?w=600&h=600&fit=crop"
      ],
      "rating": 4.5,
      "reviewCount": 1234,
      "stock": 45,
      "lowStockThreshold": 10,
      "sku": "BRAND-MODEL-001",
      "brand": "Brand Name",
      "model": "Model Number/Name",
      "specifications": [
        "Specification 1",
        "Specification 2",
        "Specification 3"
      ],
      "features": [
        "Feature 1",
        "Feature 2",
        "Feature 3"
      ],
      "variants": [],
      "featured": false
    }
  ]
}
```

### Required Fields

1. **name** (string, required): Product name including brand and model. Format: "Brand Model Product Type" (e.g., "Apple MacBook Pro 16-inch Laptop", "Nike Air Max 270 Running Shoes")

2. **slug** (string, required): URL-friendly version of the name. Lowercase, hyphens instead of spaces, no special characters (e.g., "apple-macbook-pro-16-inch-laptop")

3. **description** (string, required): Detailed marketing-style description (150-300 words) that:
   - Includes all specifications and features
   - Describes benefits and use cases
   - Is specific to the product (not generic)
   - Written in engaging, marketing tone
   - Should mention the brand and model

4. **price** (number, required): Current selling price in KES (Kenyan Shillings). Should be realistic for the product category.

5. **originalPrice** (number, optional): Original price if the product is on sale. Should be higher than `price` if provided.

6. **category** (string, required): Main category name (e.g., "Electronics", "Fashion", "Home and Kitchen")

7. **subcategory** (string, required): Subcategory slug (e.g., "laptops", "womens-shoes", "kitchen-dining")

8. **image** (string, required): Main product image URL. Use Unsplash format: `https://images.unsplash.com/photo-{photoId}?w=600&h=600&fit=crop`. Use valid Unsplash photo IDs that match the product type.

9. **images** (array of strings, optional): Additional product images (3-5 images). Same Unsplash format. Each should be a different angle/view of the product.

10. **rating** (number, required): Product rating between 3.5 and 5.0 (decimal, e.g., 4.5, 4.7)

11. **reviewCount** (number, required): Number of reviews (between 50 and 50000, realistic for product popularity)

12. **stock** (number, required): Available stock quantity (between 5 and 200)

13. **lowStockThreshold** (number, required): Threshold for low stock warning (typically 10-20)

14. **sku** (string, required): Unique product SKU. Format: "BRAND-MODEL-XXX" (uppercase, hyphens). Must be unique across all products.

15. **brand** (string, required): Real-world brand name (e.g., "Apple", "Samsung", "Nike", "Sony")

16. **model** (string, required): Product model number or name (e.g., "iPhone 15 Pro", "Air Max 270", "WH-1000XM5")

17. **specifications** (array of strings, required): Technical specifications (3-8 items). Be specific (e.g., "6.1-inch Super Retina XDR display", "A17 Pro chip", "48MP main camera")

18. **features** (array of strings, required): Key features and benefits (3-6 items). Focus on what makes the product special (e.g., "Water-resistant design", "Fast charging", "Premium materials")

19. **variants** (array, optional): Product variants (size, color, etc.). Leave empty array `[]` if no variants.

20. **featured** (boolean, optional): Whether product is featured. Set to `true` for 10-20% of products per category.

### Categories and Subcategories

Generate **15-25 products per subcategory**. Use real-world brands and models. Ensure variety within each subcategory.

#### 1. Electronics
- **all-electronics**: General electronics products
- **computers-accessories**: Laptops, desktops, computer peripherals (Logitech, Apple, Dell, HP, Lenovo, Razer, Corsair, etc.)
- **cell-phones**: Smartphones and phone accessories (Apple iPhone, Samsung Galaxy, Google Pixel, OnePlus, etc.)
- **tv-video**: TVs, streaming devices, home theater (Samsung, LG, Sony, TCL, etc.)
- **audio-headphones**: Headphones, earbuds, speakers (Sony, Bose, Apple AirPods, JBL, etc.)
- **camera-photo**: Cameras, lenses, photography equipment (Canon, Nikon, Sony, GoPro, etc.)
- **car-electronics**: Car audio, dash cams, GPS (Garmin, Pioneer, etc.)
- **gaming-consoles**: Gaming consoles and accessories (PlayStation, Xbox, Nintendo Switch, etc.)
- **wearable-tech**: Smartwatches, fitness trackers (Apple Watch, Fitbit, Garmin, etc.)
- **smart-home**: Smart home devices (Amazon Echo, Google Nest, Philips Hue, etc.)

#### 2. Computers
- **all-computers**: General computer products
- **laptops**: Laptops (Apple MacBook, Dell XPS, HP Spectre, Lenovo ThinkPad, ASUS ROG, etc.)
- **desktops**: Desktop computers (Apple iMac, Dell OptiPlex, HP Pavilion, etc.)
- **tablets**: Tablets (Apple iPad, Samsung Galaxy Tab, Microsoft Surface, etc.)
- **computer-accessories**: Keyboards, mice, monitors, webcams, etc.
- **monitors**: Computer monitors (Dell, LG, Samsung, ASUS, etc.)
- **data-storage**: External hard drives, SSDs, USB drives (Western Digital, Seagate, SanDisk, etc.)
- **networking**: Routers, modems, network equipment (TP-Link, Netgear, ASUS, etc.)

#### 3. Smart Home
- **all-smart-home**: General smart home products
- **amazon-devices**: Amazon Echo, Fire TV, etc.
- **smart-lighting**: Smart bulbs, light strips (Philips Hue, LIFX, etc.)
- **smart-security**: Security cameras, doorbells (Ring, Arlo, Nest, etc.)
- **smart-speakers**: Smart speakers (Amazon Echo, Google Nest, Apple HomePod, etc.)
- **smart-thermostats**: Smart thermostats (Nest, Ecobee, etc.)

#### 4. Arts & Crafts
- **all-arts-crafts**: General arts and crafts supplies
- **art-supplies**: Paints, brushes, canvases, easels (Winsor & Newton, Crayola, etc.)
- **jewelry-making**: Beads, tools, findings
- **crafting**: General crafting supplies
- **fabric**: Fabric, textiles
- **knitting-crochet**: Yarn, needles, hooks
- **sewing**: Sewing machines, thread, fabric
- **scrapbooking**: Scrapbooking supplies

#### 5. Automotive
- **all-automotive**: General automotive products
- **car-care**: Car wash, wax, cleaning supplies (Meguiar's, Chemical Guys, etc.)
- **car-electronics**: Car audio, GPS, dash cams
- **exterior-accessories**: Car covers, spoilers, etc.
- **interior-accessories**: Seat covers, floor mats, organizers
- **lights**: LED lights, headlights, taillights
- **motorcycle**: Motorcycle parts and accessories
- **oils-fluids**: Motor oil, coolant, brake fluid (Mobil, Castrol, etc.)
- **paint**: Car paint, touch-up paint
- **performance**: Performance parts (exhaust, air filters, etc.)
- **replacement-parts**: Replacement car parts
- **tires-wheels**: Tires and wheels (Michelin, Goodyear, etc.)
- **tools-equipment**: Car tools, jacks, etc.

#### 6. Baby
- **all-baby**: General baby products
- **baby-toys**: Baby toys (Fisher-Price, VTech, etc.)
- **diapering**: Diapers, wipes (Pampers, Huggies, etc.)
- **feeding**: Bottles, formula, high chairs (Dr. Brown's, Philips Avent, etc.)
- **baby-clothing**: Baby clothes
- **baby-gear**: Strollers, car seats, carriers (Graco, Chicco, etc.)
- **bath-potty**: Baby bath products, potty training
- **health-baby-care**: Baby health products
- **nursery**: Cribs, changing tables, nursery decor
- **pacifiers**: Pacifiers, teethers
- **safety**: Baby safety products

#### 7. Beauty and Personal Care
- **all-beauty**: General beauty products
- **makeup**: Makeup products (Maybelline, L'Oreal, MAC, etc.)
- **skin-care**: Skincare products (CeraVe, Neutrogena, The Ordinary, etc.)
- **hair-care**: Shampoo, conditioner, styling products (Pantene, Head & Shoulders, etc.)
- **fragrance**: Perfumes, colognes (Calvin Klein, Versace, etc.)
- **nail-care**: Nail polish, tools (OPI, Essie, etc.)
- **beauty-tools**: Makeup brushes, mirrors, etc.
- **shave-grooming**: Razors, shaving cream (Gillette, Schick, etc.)
- **personal-care**: Personal care items
- **oral-care**: Toothbrushes, toothpaste (Oral-B, Colgate, etc.)
- **health-care**: Health and wellness products

#### 8. Women's Fashion
- **all-womens**: General women's fashion
- **womens-clothing**: Dresses, tops, pants, jackets (Zara, H&M, Forever 21, etc.)
- **womens-shoes**: Women's shoes (Nike, Adidas, Steve Madden, etc.)
- **womens-jewelry**: Jewelry, necklaces, earrings
- **womens-watches**: Women's watches (Fossil, Michael Kors, etc.)
- **womens-handbags**: Handbags, purses, wallets (Michael Kors, Coach, etc.)
- **womens-luggage**: Women's luggage and travel gear
- **womens-accessories**: Scarves, belts, hats, etc.

#### 9. Men's Fashion
- **all-mens**: General men's fashion
- **mens-clothing**: Shirts, pants, jackets, suits (Levi's, Calvin Klein, etc.)
- **mens-shoes**: Men's shoes (Nike, Adidas, Timberland, etc.)
- **mens-watches**: Men's watches (Casio, Seiko, Fossil, etc.)
- **mens-jewelry**: Men's jewelry, rings, bracelets
- **mens-bags**: Men's bags, backpacks, wallets
- **mens-luggage**: Men's luggage and travel gear
- **mens-accessories**: Belts, ties, hats, etc.

#### 10. Girls' Fashion
- **all-girls**: General girls' fashion
- **girls-clothing**: Girls' clothing
- **girls-shoes**: Girls' shoes
- **girls-accessories**: Girls' accessories

#### 11. Boys' Fashion
- **all-boys**: General boys' fashion
- **boys-clothing**: Boys' clothing
- **boys-shoes**: Boys' shoes
- **boys-accessories**: Boys' accessories

#### 12. Health and Household
- **all-health**: General health and household products
- **health-personal-care**: Health and personal care items
- **household-supplies**: Cleaning supplies, paper products (Tide, Clorox, etc.)
- **grocery**: Food items, snacks, beverages
- **baby-products**: Baby care products
- **pet-supplies**: Pet food, toys, accessories
- **sports-outdoors**: Sports and outdoor products

#### 13. Home and Kitchen
- **all-home-kitchen**: General home and kitchen products
- **kitchen-dining**: Kitchen appliances, cookware, dinnerware (KitchenAid, Cuisinart, etc.)
- **furniture**: Home furniture (IKEA, Ashley, etc.)
- **bedding**: Bedding, sheets, pillows
- **bath**: Bath towels, bath accessories
- **home-decor**: Home decor items, wall art, vases
- **storage**: Storage solutions, organizers
- **lighting**: Lamps, light fixtures
- **heating-cooling**: Fans, heaters, air purifiers
- **irons-steamers**: Irons, garment steamers
- **vacuums**: Vacuum cleaners (Dyson, Shark, etc.)

#### 14. Industrial and Scientific
- **all-industrial**: General industrial products
- **lab-scientific**: Lab equipment, scientific instruments
- **industrial-scientific**: Industrial equipment
- **medical-supplies**: Medical supplies, equipment
- **janitorial**: Cleaning supplies for businesses
- **material-handling**: Material handling equipment
- **packaging**: Packaging supplies

#### 15. Luggage
- **all-luggage**: General luggage products
- **carry-ons**: Carry-on luggage (Samsonite, Travelpro, etc.)
- **checked-luggage**: Checked luggage
- **luggage-sets**: Luggage sets
- **travel-accessories**: Travel accessories
- **backpacks**: Backpacks, daypacks
- **briefcases**: Briefcases, laptop bags
- **duffel-bags**: Duffel bags

#### 16. Movies & Television
- **all-movies-tv**: General movies and TV products
- **movies-tv-shows**: Movies and TV shows (DVDs, Blu-rays)
- **blu-ray**: Blu-ray discs
- **dvd**: DVD discs
- **4k-ultra-hd**: 4K Ultra HD discs
- **prime-video**: Prime Video content

#### 17. Pet supplies
- **all-pet-supplies**: General pet supplies
- **dogs**: Dog food, toys, accessories (Purina, Pedigree, etc.)
- **cats**: Cat food, toys, accessories (Whiskas, Friskies, etc.)
- **fish-aquatic**: Fish tank supplies, fish food
- **birds**: Bird food, cages, accessories
- **small-animals**: Small animal supplies
- **reptiles**: Reptile supplies

#### 18. Software
- **all-software**: General software products
- **business-office**: Business and office software (Microsoft Office, etc.)
- **childrens-software**: Children's software
- **education-reference**: Educational software
- **software-games**: PC games, software games
- **graphics-design**: Graphics and design software (Adobe Creative Suite, etc.)
- **home-hobby**: Home and hobby software
- **operating-systems**: Operating systems
- **programming**: Programming tools and software
- **security**: Security software (Norton, McAfee, etc.)

#### 19. Sports and Outdoors
- **all-sports**: General sports and outdoors products
- **outdoor-recreation**: Camping, hiking gear (Coleman, REI, etc.)
- **sports-outdoors**: General sports equipment
- **exercise-fitness**: Exercise equipment, weights, yoga mats (Nike, Adidas, etc.)
- **fan-shop**: Sports team merchandise
- **sports-collectibles**: Sports memorabilia
- **sports-apparel**: Sports clothing and apparel

#### 20. Tools & Home Improvement
- **all-tools**: General tools and home improvement products
- **power-hand-tools**: Power tools, hand tools (DeWalt, Black+Decker, etc.)
- **ladders**: Ladders, scaffolding
- **light-bulbs**: Light bulbs (Philips, GE, etc.)
- **lighting-fans**: Ceiling fans, lighting fixtures
- **electrical**: Electrical supplies, wiring
- **fixtures**: Kitchen and bath fixtures
- **hardware**: Hardware, screws, nails
- **storage-organization**: Storage and organization solutions
- **paint-wall**: Paint, wall treatments
- **plumbing**: Plumbing supplies, fixtures
- **building-supplies**: Building materials

#### 21. Toys and Games
- **all-toys-games**: General toys and games
- **action-figures**: Action figures, collectibles
- **toys-arts-crafts**: Arts and crafts for kids
- **baby-toddler-toys**: Baby and toddler toys
- **building-toys**: LEGO, building blocks
- **collectibles**: Collectible toys, trading cards
- **dolls**: Dolls and accessories (Barbie, etc.)
- **games-puzzles**: Board games, puzzles
- **hobbies**: Hobby kits, model kits
- **kids-electronics**: Kids' electronics, tablets
- **learning-education**: Educational toys
- **novelty-gag**: Novelty and gag toys
- **party-supplies**: Party supplies, decorations
- **play-vehicles**: Toy cars, trucks, etc.
- **pretend-play**: Pretend play toys
- **puppets**: Puppets
- **sports-outdoor-play**: Outdoor play equipment
- **stuffed-animals**: Stuffed animals, plush toys

#### 22. Video Games
- **all-video-games**: General video games
- **pc-games**: PC video games
- **ps5**: PlayStation 5 games
- **ps4**: PlayStation 4 games
- **xbox-series-x**: Xbox Series X games
- **xbox-one**: Xbox One games
- **nintendo-switch**: Nintendo Switch games
- **nintendo-3ds**: Nintendo 3DS games
- **game-accessories**: Gaming controllers, headsets, etc.

### Important Guidelines

1. **Use Real Brands and Models**: Use actual, well-known brands and their real product models. Research current products in each category.

2. **Realistic Pricing**: Prices should be in KES (Kenyan Shillings). Research typical prices for each product type:
   - Electronics: 5,000 - 500,000 KES
   - Fashion: 1,000 - 50,000 KES
   - Home & Kitchen: 2,000 - 100,000 KES
   - Toys: 500 - 20,000 KES
   - Beauty: 500 - 15,000 KES

3. **Valid Unsplash Images**: Use real Unsplash photo IDs. You can search Unsplash for product images and use the photo ID from the URL. Format: `https://images.unsplash.com/photo-{photoId}?w=600&h=600&fit=crop`

4. **Unique SKUs**: Each product must have a unique SKU. Format: `BRAND-MODEL-XXX` where XXX is a 3-digit number.

5. **Detailed Descriptions**: Descriptions should be comprehensive, marketing-focused, and include:
   - Product overview
   - Key specifications
   - Features and benefits
   - Use cases
   - Why customers should buy it

6. **Variety**: Ensure variety within each subcategory. Don't repeat the same product multiple times.

7. **Featured Products**: Mark 10-20% of products as `featured: true` per category.

8. **Stock Levels**: Vary stock levels realistically. Popular products should have higher stock.

9. **Ratings and Reviews**: More popular/well-known products should have higher review counts. Ratings should be between 3.5 and 5.0.

10. **Subcategory Mapping**: Ensure the `subcategory` field uses the exact slug from the list above (e.g., "laptops", "womens-shoes", "kitchen-dining").

### Output Requirements

- Generate **15-25 products per subcategory**
- Total products should be approximately **3,000-5,000 products**
- Output as a single, valid JSON file
- Ensure all required fields are present
- Validate that all SKUs are unique
- Ensure all image URLs are valid Unsplash format
- Ensure all prices are realistic numbers (no decimals for KES)
- Ensure all ratings are between 3.5 and 5.0
- Ensure all review counts are realistic (50-50000)

### Example Product

```json
{
  "name": "Apple MacBook Pro 16-inch M3 Pro",
  "slug": "apple-macbook-pro-16-inch-m3-pro",
  "description": "Experience unparalleled performance with the Apple MacBook Pro 16-inch featuring the revolutionary M3 Pro chip. This powerhouse laptop delivers exceptional speed and efficiency, making it perfect for professionals, creatives, and power users. The stunning 16.2-inch Liquid Retina XDR display with ProMotion technology provides breathtaking visuals with up to 120Hz refresh rate, perfect for video editing, graphic design, and immersive entertainment. With up to 36GB of unified memory and up to 4TB of SSD storage, you'll have all the power and space you need for your most demanding projects. The advanced thermal system ensures sustained performance even during intensive tasks. Featuring a Magic Keyboard with Touch ID, a Force Touch trackpad, and an array of ports including three Thunderbolt 4 ports, HDMI, SDXC card slot, and MagSafe 3 charging. The all-day battery life of up to 22 hours means you can work from anywhere without interruption. Built with premium materials and Apple's legendary attention to detail, this MacBook Pro is designed to be your creative companion for years to come.",
  "price": 350000,
  "originalPrice": 380000,
  "category": "Computers",
  "subcategory": "laptops",
  "image": "https://images.unsplash.com/photo-1496181137766-2c02f936e670?w=600&h=600&fit=crop",
  "images": [
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1461749280685-d102f7c972b1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1496181137766-2c02f936e670?w=600&h=600&fit=crop"
  ],
  "rating": 4.8,
  "reviewCount": 15234,
  "stock": 25,
  "lowStockThreshold": 10,
  "sku": "APPLE-MBP16-M3P-001",
  "brand": "Apple",
  "model": "MacBook Pro 16-inch M3 Pro",
  "specifications": [
    "16.2-inch Liquid Retina XDR display",
    "M3 Pro chip with 12-core CPU",
    "18-core GPU",
    "36GB unified memory",
    "1TB SSD storage",
    "22-hour battery life",
    "1080p FaceTime HD camera",
    "Six-speaker sound system"
  ],
  "features": [
    "ProMotion technology with 120Hz refresh rate",
    "Advanced thermal system",
    "Magic Keyboard with Touch ID",
    "Three Thunderbolt 4 ports",
    "MagSafe 3 charging",
    "Studio-quality microphones"
  ],
  "variants": [],
  "featured": true
}
```

### Final Notes

- Ensure JSON is valid and properly formatted
- All strings should be properly escaped
- Numbers should not have quotes
- Arrays should be properly formatted
- The file should be ready to import directly into a database or application

Generate the complete JSON file now with products for ALL categories and subcategories listed above.

