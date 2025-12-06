import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
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

  const hasDiscount = discount > 0 && product.originalPrice;

  const stockStatus =
    product.stock === 0
      ? "out"
      : product.stock <= product.lowStockThreshold
      ? "low"
      : "in";

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
        "deal-card group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col relative",
        "hover:shadow-lg transition-shadow duration-200",
        className
      )}
      style={{ ...style, height: '420px' }}
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-white block">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Cyber Deal Badge - Top Left */}
        {hasDiscount && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-semibold text-white rounded-sm z-10"
            style={{ backgroundColor: "#991B1B", letterSpacing: "0.01em" }}
          >
            Cyber Deal
          </div>
        )}

        {/* Heart Icon - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white shadow-sm z-10 p-0 border-0"
          aria-label="Add to favorites"
        >
          <Heart className="h-4 w-4 text-gray-700" fill="none" strokeWidth={2} />
        </Button>

        {/* Out of Stock Overlay */}
        {stockStatus === "out" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 md:p-4 bg-white">
        {/* Product Name */}
        <Link
          to={`/products/${product.slug}`}
          className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-red-600 transition-colors mb-1.5 leading-snug min-h-[2.5rem]"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2 min-h-[1.25rem]">
          <div className="star-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(product.rating)
                    ? "star-filled fill-current"
                    : "star-empty fill-muted"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="mt-auto space-y-2">
          {/* Price Section */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-h-[1.5rem]">
            {hasDiscount ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-600 font-normal">Now</span>
                  <span className="text-base font-semibold" style={{ color: "#007a00" }}>
                    {formatPrice(product.price)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 line-through font-normal">
                  Was {formatPrice(product.originalPrice!)}
                </span>
              </>
            ) : (
              <span className="text-base font-semibold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status - Always reserve space */}
          <div className="min-h-[1.25rem]">
            {stockStatus === "low" && (
              <p className="text-xs text-warning font-medium">
                Only {product.stock} left - order soon
              </p>
            )}

            {stockStatus === "in" && (
              <p className="text-xs text-success font-medium">In Stock</p>
            )}
          </div>

          {/* Add to Cart Button */}
          {product.variants && product.variants.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-sm font-normal bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm mt-2"
              disabled={stockStatus === "out"}
              asChild
            >
              <Link to={`/products/${product.slug}`}>
                Options
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-sm font-normal bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm mt-2"
              disabled={stockStatus === "out" || isAdding}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )}

          {/* Color/Variant Selection */}
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pt-1">
              {variants.slice(0, 4).map((variant, idx) => (
                <Link
                  key={idx}
                  to={`/products/${variant.slug}`}
                  onClick={(e) => handleVariantClick(e, variant.slug)}
                  className="text-xs text-red-600 hover:underline"
                >
                  {variant.name}
                </Link>
              ))}
              {variants.length > 4 && (
                <Link
                  to={`/products/${product.slug}`}
                  className="text-xs text-red-600 hover:underline"
                >
                  +{variants.length - 4} more
                </Link>
              )}
            </div>
          )}

          {/* Deal Claim Percentage */}
          {dealClaimPercentage > 0 && (
            <div className="text-xs text-gray-500 pt-1">
              {dealClaimPercentage}% claimed
            </div>
          )}

          {/* Brand Deals Button */}
          {brand && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs mt-1 text-red-600 hover:text-red-700"
              onClick={handleBrandClick}
            >
              Shop {brand} deals
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

