import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

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

  const stockStatus =
    product.stock === 0
      ? "out"
      : product.stock <= product.lowStockThreshold
      ? "low"
      : "in";

  return (
    <div
      className={cn(
        "product-card group bg-card h-full",
        className
      )}
      style={style}
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary/30 block">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 deal-badge">
            -{discount}%
          </span>
        )}

        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 hover:bg-background shadow-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Out of Stock Overlay */}
        {stockStatus === "out" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        {/* Product Name */}
        <Link
          to={`/products/${product.slug}`}
          className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors mb-1.5 leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
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
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="mt-auto space-y-2">
          {/* Price */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-base font-medium text-price">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {stockStatus === "low" && (
            <p className="text-xs text-warning font-medium">
              Only {product.stock} left - order soon
            </p>
          )}

          {stockStatus === "in" && (
            <p className="text-xs text-success font-medium">In Stock</p>
          )}

          {/* Add to Cart */}
          <Button
            variant="cart"
            size="sm"
            className="w-full mt-2"
            disabled={stockStatus === "out"}
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}