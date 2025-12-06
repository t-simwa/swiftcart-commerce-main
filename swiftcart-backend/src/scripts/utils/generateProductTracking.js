import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const categoriesPath = path.join(__dirname, '../../../../swiftcart-frontend/src/data/categories.ts');
const templatesPath = path.join(__dirname, 'enhancedProductTemplates.ts');
const outputPath = path.join(__dirname, '../../../../docs/PRODUCT_TEMPLATES_TRACKING.md');

// Read categories file
const categoriesContent = fs.readFileSync(categoriesPath, 'utf8');

// Extract all subcategories from departmentCategories
const subcategoryPattern = /subcategories:\s*\[([\s\S]*?)\]/g;
const categoryNamePattern = /name:\s*"([^"]+)",\s*slug:\s*"([^"]+)"/g;

const allSubcategories = new Map(); // slug -> { name, categoryName, categorySlug }

// Find all categories and their subcategories
let categoryMatch;
const categoryBlocks = categoriesContent.match(/name:\s*"[^"]+",\s*slug:\s*"[^"]+",\s*subcategories:\s*\[[\s\S]*?\]/g) || [];

categoryBlocks.forEach(block => {
  const categoryNameMatch = block.match(/name:\s*"([^"]+)"/);
  const categorySlugMatch = block.match(/slug:\s*"([^"]+)"/);
  
  if (!categoryNameMatch || !categorySlugMatch) return;
  
  const categoryName = categoryNameMatch[1];
  const categorySlug = categorySlugMatch[1];
  
  // Extract subcategories from this block
  const subcatMatches = block.matchAll(/\{\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)"\s*\}/g);
  
  for (const match of subcatMatches) {
    const subcatName = match[1];
    const subcatSlug = match[2];
    
    // Skip "all-*" subcategories
    if (!subcatSlug.startsWith('all-')) {
      allSubcategories.set(subcatSlug, {
        name: subcatName,
        categoryName: categoryName,
        categorySlug: categorySlug
      });
    }
  }
});

// Read templates file and count products per subcategory
const templatesContent = fs.readFileSync(templatesPath, 'utf8');

// Find all subcategory definitions in templates
const templateSubcategoryPattern = /'([\w-]+)':\s*\[/g;
const templateCounts = new Map();

let match;
const templateMatches = [];
while ((match = templateSubcategoryPattern.exec(templatesContent)) !== null) {
  templateMatches.push({ name: match[1], startIndex: match.index + match[0].length });
}

// Count products for each subcategory in templates
for (let i = 0; i < templateMatches.length; i++) {
  const subcategory = templateMatches[i].name;
  const startIndex = templateMatches[i].startIndex;
  const endIndex = i < templateMatches.length - 1 ? templateMatches[i + 1].startIndex - 20 : templatesContent.length;
  
  const arrayContent = templatesContent.substring(startIndex, endIndex);
  const productMatches = arrayContent.match(/\s+brand:/g);
  templateCounts.set(subcategory, productMatches ? productMatches.length : 0);
}

// Group subcategories by category
const categoriesMap = new Map();
allSubcategories.forEach((subcat, slug) => {
  const categoryKey = subcat.categorySlug;
  if (!categoriesMap.has(categoryKey)) {
    categoriesMap.set(categoryKey, {
      name: subcat.categoryName,
      slug: categoryKey,
      subcategories: []
    });
  }
  categoriesMap.get(categoryKey).subcategories.push({
    ...subcat,
    slug: slug,
    count: templateCounts.get(slug) || 0
  });
});

// Calculate total
let totalProducts = 0;
templateCounts.forEach(count => totalProducts += count);

// Generate markdown
const today = new Date().toISOString().split('T')[0];
let markdown = `# Product Templates Tracking

This document tracks the number of products (templates) added to each subcategory in \`enhancedProductTemplates.ts\`.

**Last Updated:** ${today}
**Total Products:** ${totalProducts}

> **Note:** This document is auto-generated. Run \`node swiftcart-backend/src/scripts/utils/generateProductTracking.js\` to update it.

---

`;

// Category display names mapping
const categoryDisplayNames = {
  'electronics': 'Electronics',
  'computers': 'Computers',
  'smart-home': 'Smart Home',
  'arts-crafts': 'Arts & Crafts',
  'automotive': 'Automotive',
  'baby': 'Baby Products',
  'beauty': 'Beauty & Personal Care',
  'womens-fashion': "Women's Fashion",
  'mens-fashion': "Men's Fashion",
  'girls-fashion': "Girls' Fashion",
  'boys-fashion': "Boys' Fashion",
  'health': 'Health and Household',
  'home-living': 'Home & Kitchen',
  'industrial': 'Industrial and Scientific',
  'luggage': 'Luggage & Travel',
  'movies-tv': 'Movies & Television',
  'pet-supplies': 'Pet Supplies',
  'software': 'Software',
  'sports': 'Sports & Outdoors',
  'tools': 'Tools & Home Improvement',
  'toys': 'Toys & Games',
  'video-games': 'Video Games'
};

// Sort categories by name
const sortedCategories = Array.from(categoriesMap.values()).sort((a, b) => {
  const nameA = categoryDisplayNames[a.slug] || a.name;
  const nameB = categoryDisplayNames[b.slug] || b.name;
  return nameA.localeCompare(nameB);
});

// Generate sections for each category
sortedCategories.forEach(category => {
  const categoryDisplayName = categoryDisplayNames[category.slug] || category.name;
  markdown += `## ${categoryDisplayName}\n\n`;
  
  // Sort subcategories by name
  const sortedSubcats = category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
  
  sortedSubcats.forEach(subcat => {
    const status = subcat.count > 0 ? '✅' : '⏳';
    markdown += `### ${subcat.name}\n`;
    markdown += `- **Subcategory:** \`${subcat.slug}\`\n`;
    markdown += `- **Products:** ${subcat.count} ${status}\n\n`;
  });
  
  markdown += '---\n\n';
});

// Summary by product count
markdown += `## Summary by Product Count\n\n`;

const countGroups = new Map();
allSubcategories.forEach((subcat, slug) => {
  const count = templateCounts.get(slug) || 0;
  if (!countGroups.has(count)) {
    countGroups.set(count, []);
  }
  countGroups.get(count).push({ slug, name: subcat.name });
});

// Sort counts descending
const sortedCounts = Array.from(countGroups.keys()).sort((a, b) => b - a);

sortedCounts.forEach(count => {
  const subcats = countGroups.get(count).sort((a, b) => a.slug.localeCompare(b.slug));
  markdown += `### ${count} Product${count !== 1 ? 's' : ''}\n`;
  subcats.forEach(subcat => {
    markdown += `- \`${subcat.slug}\` (${count}) - ${subcat.name}\n`;
  });
  markdown += '\n';
});

// Statistics
const withProducts = Array.from(templateCounts.values()).filter(c => c > 0).length;
const withoutProducts = allSubcategories.size - withProducts;

markdown += `---\n\n`;
markdown += `## Statistics\n\n`;
markdown += `- **Total Subcategories:** ${allSubcategories.size}\n`;
markdown += `- **Subcategories with Products:** ${withProducts}\n`;
markdown += `- **Subcategories without Products:** ${withoutProducts}\n`;
markdown += `- **Total Products:** ${totalProducts}\n\n`;

markdown += `---\n\n`;
markdown += `## Notes\n\n`;
markdown += `- All products in \`enhancedProductTemplates.ts\` have unique, product-specific descriptions\n`;
markdown += `- The seed script (\`pnpm seed:products\`) generates exactly the number of products defined in each subcategory's template array\n`;
markdown += `- Subcategories without templates are skipped during seeding\n`;
markdown += `- No default/fallback templates are used - only products from \`enhancedProductTemplates.ts\` are generated\n`;
markdown += `- ⏳ indicates subcategories that need products added\n`;
markdown += `- ✅ indicates subcategories that have products\n\n`;

// Write to file
fs.writeFileSync(outputPath, markdown, 'utf8');
console.log(`✅ Generated tracking document: ${outputPath}`);
console.log(`   Total subcategories: ${allSubcategories.size}`);
console.log(`   Subcategories with products: ${withProducts}`);
console.log(`   Subcategories without products: ${withoutProducts}`);
console.log(`   Total products: ${totalProducts}`);

