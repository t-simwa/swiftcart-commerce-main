# Amazon Today's Deals Page - Implementation Analysis

## Overview
This document analyzes the Amazon Today's Deals page (`/gp/goldbox`) source code to identify all components, features, and functionality that need to be implemented in SwiftCart.

**Reference:** [Amazon Today's Deals Page](https://www.amazon.com/gp/goldbox?ref_=nav_cs_gb)

---

## 1. Page Structure & Layout

### 1.1 Navigation Structure
- **Main Navigation Tab:** "Today's Deals" link in header navigation
- **Sub-Navigation Bar:** Horizontal tab navigation below main nav with:
  - Today's Deals (active/selected state)
  - Coupons
  - Renewed Deals
  - Outlet
  - Amazon Resale
  - Grocery Deals

### 1.2 Page Layout
- **Container:** Full-width container with padding
- **Background:** Light beige/tan background (`#F5F3EF`) for hero sections
- **Content Sections:** Multiple horizontal scrolling carousel sections

---

## 2. Hero Section: "Save on big purchases"

### 2.1 Component Structure
- **Section Header:**
  - Title: "Save on big purchases"
  - "See more" link (right-aligned)
  - Background color: `#F5F3EF`

### 2.2 Product Carousel
- **Type:** Horizontal scrolling carousel
- **Card Dimensions:**
  - Width: `240px` per card
  - Height: Variable (based on content)
  - Spacing: `12px` between cards
  - Border radius: `8px`

### 2.3 Product Deal Cards
Each card contains:

#### **Product Image**
- Size: `240px × 220px`
- Border radius: `8px` (top corners)
- Object fit: `contain`
- Padding: `8px` around image

#### **Discount Badge**
- **Primary Badge:** Red background (`#CC0C39`), white text
  - Shows discount percentage: "20% off", "17% off", etc.
  - Font size: `mini` (small)
  - Border radius: `2px`
  - Padding: `4px 6px`

- **Secondary Badge:** White background, red text (`#CC0C39`)
  - Text: "Limited time deal"
  - Same styling as primary badge

#### **Price Display**
- **Current Price:**
  - Large, prominent display
  - Format: `KES 36,188.71` (currency symbol + whole number + decimal)
  - Font size: `medium_plus`
  - Color: Base text color (`#0F1111`)

- **Original/List Price:**
  - Strikethrough text
  - Smaller font size: `mini`
  - Color: Secondary/muted (`#565959`)
  - Label: "List:" or "Typical:" (screen reader only)
  - Format: `KES 45,236.21`

#### **Product Title**
- Truncated to 1-2 lines
- Font size: Base
- Color: `#0F1111`
- Line height: `1.3em`
- Max height: `2.6em` (for 2 lines)
- Text overflow: Ellipsis (`...`)

### 2.4 Carousel Navigation
- **Previous/Next Buttons:**
  - Position: Left and right sides of carousel
  - Width: `56px`
  - Icon: Arrow icons (SVG)
  - Background: White with border
  - Border radius: `8px` (left/right sides)
  - Box shadow on hover
  - Disabled state when at start/end

---

## 3. "Can't-miss offers" Section

### 3.1 Section Structure
- **Title:** "Can't-miss offers"
- **Layout:** Horizontal scrolling carousel
- **Card Dimensions:**
  - Width: `242px` (desktop)
  - Height: `290px`
  - Border: `1px solid rgba(232,234,237,0.7)`
  - Border radius: `4px`
  - Box shadow: `0 1px 0 #c2ccd6`

### 3.2 Category Offer Cards
Each card displays:
- **Category Image:** `240px × 224px`
- **Category Title:** 
  - 2-line truncation
  - Font size: `base-plus`
  - Padding: `10px 12px`
  - Height: `64px`
  - Examples:
    - "Beauty under $25"
    - "Save on outlet"
    - "25% off or more on home"
    - "Lightning deals over 50% off"
    - "Fitness deals under $20"
    - "Over 25% off electronics"

### 3.3 Card Styling
- Background: White (`#FFF`)
- Hover effect: Box shadow enhancement
- Focus state: Outline for accessibility
- Link: Full card is clickable

---

## 4. Main Deals Grid (Inferred from Web Search)

### 4.1 Product Grid Layout
- **Grid Type:** Responsive grid
- **Items per row:** Variable (responsive)
- **Pagination:** Page-based navigation
- **Sorting/Filtering:** Available (implied from URL structure)

### 4.2 Deal Product Cards
Similar structure to hero section cards but optimized for grid:
- Consistent card sizing
- Same badge and price display
- Product image
- Product title
- Quick view/add to cart functionality

---

## 5. Responsive Design

### 5.1 Desktop (> 1000px)
- Full-width carousels
- Multiple items visible
- Large card sizes
- Full navigation visible

### 5.2 Tablet (481px - 999px)
- Reduced card sizes
- Fewer items visible
- Adjusted spacing
- Modified carousel controls

### 5.3 Mobile (< 480px)
- **Carousel Cards:**
  - Width: `137px`
  - Height: `178px`
  - Image: `135px × 126px`
  - Title height: `50px`
  - Reduced padding

- **Category Cards:**
  - Width: `75px` (mini) or `120px` (medium)
  - Height: `96px` (mini) or `132px` (medium)
  - Adjusted image sizes

---

## 6. Technical Features

### 6.1 Carousel Functionality
- **Smooth Scrolling:** Horizontal scroll with snap points
- **Navigation:**
  - Previous/Next buttons
  - Keyboard navigation (arrow keys)
  - Touch/swipe support (mobile)
  - Disabled states at boundaries

### 6.2 Badge System
- **Discount Badges:** Dynamic percentage calculation
- **Deal Type Badges:** "Limited time deal", "Lightning deal", etc.
- **Badge Colors:**
  - Primary: Red (`#CC0C39`) background, white text
  - Secondary: White background, red text
  - Variants: Green for coupons, etc.

### 6.3 Price Formatting
- **Currency:** KES (Kenyan Shilling) - adapt to your currency
- **Format:** `KES 36,188.71`
- **Components:**
  - Currency symbol
  - Whole number (thousands separator)
  - Decimal places (2 digits)
- **Strikethrough:** Original price with line-through

### 6.4 Text Truncation
- **Multi-line Truncation:** CSS `-webkit-line-clamp`
- **Max Lines:** 1-2 lines depending on context
- **Overflow:** Ellipsis (`...`)
- **Line Height:** `1.3em`

---

## 7. Data Requirements

### 7.1 Product Deal Data Structure
```typescript
interface DealProduct {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  dealType: 'limited-time' | 'lightning' | 'regular';
  category?: string;
  slug: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}
```

### 7.2 Category Offer Data Structure
```typescript
interface CategoryOffer {
  id: string;
  title: string;
  image: string;
  link: string;
  filterParams?: {
    category?: string;
    minDiscount?: number;
    maxPrice?: number;
    dealType?: string;
  };
}
```

---

## 8. Backend API Requirements

### 8.1 Endpoints Needed
1. **GET /api/deals/today**
   - Returns today's deals
   - Query params: `page`, `limit`, `category`, `sort`, `minDiscount`, `maxPrice`

2. **GET /api/deals/categories**
   - Returns category offers for "Can't-miss offers" section

3. **GET /api/deals/hero**
   - Returns featured deals for hero carousel

### 8.2 Deal Filtering
- Filter by category
- Filter by discount percentage
- Filter by price range
- Filter by deal type
- Sort by: relevance, discount %, price (low-high, high-low), newest

---

## 9. UI Components to Build

### 9.1 Core Components
1. **DealCard** - Product deal card component
2. **CategoryOfferCard** - Category offer card component
3. **DealCarousel** - Horizontal scrolling carousel
4. **DiscountBadge** - Badge component for discounts
5. **PriceDisplay** - Price formatting component
6. **DealsPage** - Main page component

### 9.2 Supporting Components
1. **DealFilters** - Filter sidebar/bar
2. **DealPagination** - Pagination controls
3. **DealSort** - Sort dropdown
4. **DealCountdown** - Countdown timer (if needed for limited-time deals)

---

## 10. Styling Details

### 10.1 Color Palette
- **Primary Red:** `#CC0C39` (discount badges)
- **Text Primary:** `#0F1111` (main text)
- **Text Secondary:** `#565959` (muted text)
- **Background:** `#F5F3EF` (section backgrounds)
- **Border:** `rgba(232,234,237,0.7)` (card borders)
- **Shadow:** `#c2ccd6` (box shadows)

### 10.2 Typography
- **Font Family:** System fonts (Amazon Ember equivalent)
- **Font Sizes:**
  - Mini: `11px-12px`
  - Base: `14px`
  - Base Plus: `15px-16px`
  - Medium Plus: `18px-20px`
- **Font Weights:**
  - Regular: `400`
  - Medium: `500`
  - Bold: `700`

### 10.3 Spacing
- **Card Padding:** `8px-12px`
- **Card Gap:** `12px`
- **Section Padding:** `16px-20px`
- **Section Margin:** `20px 0`

---

## 11. Accessibility Features

### 11.1 ARIA Labels
- Carousel role: `role="group"`, `aria-roledescription="carousel"`
- Slide role: `aria-roledescription="slide"`
- Navigation buttons: `aria-label` for previous/next
- Product cards: Proper `alt` text for images

### 11.2 Keyboard Navigation
- Arrow keys for carousel navigation
- Tab navigation through products
- Enter/Space to activate links
- Focus indicators visible

### 11.3 Screen Reader Support
- Hidden labels for "List:" price prefix
- Descriptive link text
- Status announcements for carousel position

---

## 12. Performance Considerations

### 12.1 Image Optimization
- Lazy loading for carousel items
- Responsive images (different sizes for different breakpoints)
- Image format: WebP with fallback

### 12.2 Carousel Performance
- Virtual scrolling for large lists
- Debounced scroll events
- Intersection Observer for visibility

### 12.3 Data Loading
- Pagination for deals grid
- Infinite scroll option
- Caching of deal data
- Background prefetching

---

## 13. State Management

### 13.1 Client State
- Current carousel position
- Active filters
- Sort order
- Selected category
- Pagination state

### 13.2 Server State (React Query)
- Deals data
- Category offers
- Filter options
- Pagination metadata

---

## 14. Implementation Priority

### Phase 1: Core Structure
1. Page layout and navigation
2. Basic deal card component
3. Simple grid layout
4. Price and badge display

### Phase 2: Carousels
1. Hero carousel with products
2. Category offers carousel
3. Navigation controls
4. Responsive behavior

### Phase 3: Filtering & Sorting
1. Filter sidebar/bar
2. Sort dropdown
3. URL state management
4. API integration

### Phase 4: Polish
1. Animations and transitions
2. Loading states
3. Error handling
4. Accessibility improvements
5. Performance optimization

---

## 15. Key Differences from Amazon

### 15.1 Adaptations for SwiftCart
- **Currency:** Use KES (Kenyan Shilling) instead of USD
- **Branding:** SwiftCart colors and logo
- **Categories:** Adapt to your product categories
- **Deal Types:** Customize based on your business model
- **Payment:** M-Pesa integration (already implemented)

### 15.2 Simplified Features (Optional)
- May not need all Amazon's advanced filtering initially
- Can start with basic carousel before adding advanced features
- Can simplify badge system initially

---

## 16. Testing Requirements

### 16.1 Component Tests
- DealCard rendering
- Price formatting
- Badge display
- Carousel navigation

### 16.2 Integration Tests
- API data loading
- Filter application
- Pagination
- URL state sync

### 16.3 E2E Tests
- User flow: Browse deals → Filter → View product
- Carousel interaction
- Mobile responsiveness

---

## Summary

The Amazon Today's Deals page is a sophisticated e-commerce deals page with:
- **Multiple carousel sections** for featured deals
- **Category-based offers** for quick navigation
- **Rich product cards** with discount badges and pricing
- **Responsive design** across all devices
- **Advanced filtering** and sorting capabilities
- **Accessible** and performant implementation

**Estimated Complexity:** High
**Estimated Time:** 2-3 weeks for full implementation
**Recommended Approach:** Phased implementation starting with core components

---

**Next Steps:**
1. Review this analysis
2. Prioritize features based on business needs
3. Create detailed component specifications
4. Begin implementation with Phase 1 components

