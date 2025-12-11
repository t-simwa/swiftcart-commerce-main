import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const { addToCart } = useCart();

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stockStatus !== "out") {
      addToCart(product);
    }
  };

  return (
    <div
      className={cn(
        "product-card group bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col relative",
        "hover:shadow-lg transition-shadow duration-200",
        className
      )}
      style={{ ...style, height: '420px' }}
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-white block">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          aspectRatio="auto"
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
              <span className="text-base font-semibold" style={{ color: "#007a00" }}>
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
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-sm font-normal bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-sm mt-2"
            disabled={stockStatus === "out"}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}