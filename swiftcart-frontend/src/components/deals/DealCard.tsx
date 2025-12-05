import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface DealCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function DealCard({ product, className, style }: DealCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Calculate deal claim percentage (mock data - would come from API in production)
  const dealClaimPercentage = Math.floor(Math.random() * 30) + 5; // Random between 5-35%

  // Extract brand from product name (first word or common brands)
  const getBrand = () => {
    const brandPatterns = [
      "Ninja",
      "Philips",
      "JBL",
      "Shark",
      "Bissell",
      "Instant Pot",
      "Chef Preserve",
      "Trendy Queen",
    ];
    
    for (const brand of brandPatterns) {
      if (product.name.includes(brand)) {
        return brand;
      }
    }
    
    // Fallback: first word of product name
    return product.name.split(" ")[0];
  };

  const brand = getBrand();

  // Get color/variant options (if available)
  const getVariants = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.slice(0, 5).map((v) => ({
        name: v.attributes.color || v.attributes.size || v.name,
        slug: product.slug,
      }));
    }
    return [];
  };

  const variants = getVariants();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/deals?brands=${encodeURIComponent(brand)}`);
  };

  const handleVariantClick = (e: React.MouseEvent, variantSlug: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${variantSlug}`);
  };

  return (
    <div
      className={cn(
        "deal-card bg-background rounded-lg overflow-hidden border border-border/70 shadow-sm hover:shadow-md transition-shadow group",
        className
      )}
      style={style}
    >
      {/* Image Container */}
      <div className="relative bg-secondary/30 overflow-hidden rounded-t-lg">
        <Link to={`/products/${product.slug}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[180px] sm:h-[200px] md:h-[220px] object-contain p-2"
            loading="lazy"
          />
        </Link>
        
        {/* Add to Cart Button - Quick Add (Top Right) */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-2 space-y-2">
        <Link to={`/products/${product.slug}`} className="block">
          {/* Badge Container */}
          {discount > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center min-h-[24px]">
              {/* Primary Badge - Discount Percentage */}
              <div
                className="inline-flex items-center px-1.5 py-1 rounded-sm text-[11px] font-normal leading-3"
                style={{
                  backgroundColor: "#CC0C39",
                  color: "#ffffff",
                }}
              >
                {discount}% off
              </div>
              {/* Secondary Badge - Limited Time Deal */}
              <div
                className="inline-flex items-center px-1.5 py-1 rounded-sm text-[11px] font-bold leading-3"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#CC0C39",
                }}
              >
                Limited time deal
              </div>
            </div>
          )}

          {/* Price Display - Enhanced with "Deal Price:" label */}
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
              <span className="text-xs text-muted-foreground">Deal Price:</span>
              <span className="text-base font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">List:</span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3
            className="text-sm text-foreground line-clamp-1 leading-[1.3em] max-h-[1.3em] overflow-hidden text-ellipsis"
            style={{
              maxHeight: "1.3em",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Color/Variant Selection */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center pt-1">
            {variants.slice(0, 4).map((variant, idx) => (
              <Link
                key={idx}
                to={`/products/${variant.slug}`}
                onClick={(e) => handleVariantClick(e, variant.slug)}
                className="text-xs text-primary hover:underline"
              >
                {variant.name}
              </Link>
            ))}
            {variants.length > 4 && (
              <Link
                to={`/products/${product.slug}`}
                className="text-xs text-primary hover:underline"
              >
                +{variants.length - 4} more
              </Link>
            )}
          </div>
        )}

        {/* Deal Claim Percentage */}
        {dealClaimPercentage > 0 && (
          <div className="text-xs text-muted-foreground pt-1">
            {dealClaimPercentage}% claimed
          </div>
        )}

        {/* Brand Deals Button */}
        {brand && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs mt-1"
            onClick={handleBrandClick}
          >
            Shop {brand} deals
          </Button>
        )}
      </div>
    </div>
  );
}

