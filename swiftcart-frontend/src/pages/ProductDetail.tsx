import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Loader2,
  ZoomIn,
  Check,
  Copy,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Store,
  Award,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Product, ProductVariant } from "@/types/product";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/products/ProductCard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Fetch product from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Product slug is required");
      const response = await apiClient.getProductBySlug(slug);
      return response.data?.product;
    },
    enabled: !!slug,
  });

  const product = data as Product | undefined;

  // Fetch related products (must be called before early returns)
  const { data: relatedData } = useQuery({
    queryKey: ["products", "related", product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const response = await apiClient.getProducts({
        category: product.category,
        limit: 8,
      });
      return response.data?.products.filter(
        (p: Product) => (p._id || p.id) !== (product._id || product.id)
      ).slice(0, 6) || [];
    },
    enabled: !!product?.category,
  });

  // Fetch frequently bought together (must be called before early returns)
  const { data: frequentlyBoughtData } = useQuery({
    queryKey: ["products", "frequently-bought", product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const response = await apiClient.getProducts({
        category: product.category,
        limit: 4,
      });
      return response.data?.products.filter(
        (p: Product) => (p._id || p.id) !== (product._id || product.id)
      ).slice(0, 3) || [];
    },
    enabled: !!product?.category,
  });

  // Check wishlist status (must be called before early returns)
  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.some((item: Product) => (item._id || item.id) === (product._id || product.id)));
    }
  }, [product]);

  // Reset selectedImage to 0 when product changes (must be called before early returns)
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
    }
  }, [product]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container-wide py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="container-wide py-16 text-center min-h-[60vh]">
        <h1 className="text-xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  // Ensure product.image is always the first image to match the card display
  // ProductCard shows product.image, so we need to ensure that's what's shown by default
  const images = (() => {
    if (!product?.images || product.images.length === 0) {
      return product ? [product.image] : [];
    }
    // If product.image is already first in the array, use it as is
    if (product.images[0] === product.image) {
      return product.images;
    }
    // Otherwise, ensure product.image is first, then add other images
    const otherImages = product.images.filter(img => img !== product.image);
    return [product.image, ...otherImages];
  })();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockStatus =
    product.stock === 0
      ? "out"
      : product.stock <= product.lowStockThreshold
      ? "low"
      : "in";

  // Get current price (variant or base)
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;

  // Extract brand from product name (first word or common brands)
  const getBrand = () => {
    const brandPatterns = [
      "Ninja", "Philips", "JBL", "Shark", "Bissell", "Instant Pot",
      "Chef Preserve", "Trendy Queen", "Apple", "Samsung", "Sony",
    ];
    for (const brand of brandPatterns) {
      if (product.name.includes(brand)) return brand;
    }
    return product.name.split(" ")[0];
  };

  const brand = getBrand();

  // Parse description into features (if it contains bullet points)
  const parseFeatures = () => {
    const features: string[] = [];
    const lines = product.description.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        features.push(trimmed.substring(1).trim());
      } else if (trimmed.length > 0 && trimmed.length < 200) {
        // If it's a short line, it might be a feature
        if (features.length < 10) {
          features.push(trimmed);
        }
      }
    });
    return features.length > 0 ? features : [
      "High-quality product with excellent performance",
      "Durable and long-lasting design",
      "Customer satisfaction guaranteed",
      "Fast and reliable shipping",
    ];
  };

  const features = parseFeatures();

  // Parse specifications from description or use defaults
  const getSpecifications = () => {
    const specs: Record<string, string> = {};
    
    // Try to extract from description
    const desc = product.description.toLowerCase();
    if (desc.includes('weight')) {
      const weightMatch = desc.match(/weight[:\s]+([\d.]+)\s*(kg|g|lb|oz)/i);
      if (weightMatch) specs['Weight'] = weightMatch[0];
    }
    if (desc.includes('dimension')) {
      const dimMatch = desc.match(/dimension[:\s]+([\d.]+[x×][\d.]+[x×][\d.]+)/i);
      if (dimMatch) specs['Dimensions'] = dimMatch[1];
    }
    if (desc.includes('color')) {
      const colorMatch = desc.match(/color[:\s]+([a-z\s,]+)/i);
      if (colorMatch) specs['Color'] = colorMatch[1].trim();
    }
    if (desc.includes('material')) {
      const matMatch = desc.match(/material[:\s]+([a-z\s,]+)/i);
      if (matMatch) specs['Material'] = matMatch[1].trim();
    }

    // Add defaults if empty
    if (Object.keys(specs).length === 0) {
      specs['Brand'] = brand;
      specs['Category'] = product.category;
      specs['SKU'] = product.sku;
      specs['Stock'] = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    } else {
      specs['Brand'] = brand;
      specs['SKU'] = product.sku;
    }

    return specs;
  };

  const specifications = getSpecifications();

  const relatedProducts = relatedData || [];
  const frequentlyBought = frequentlyBoughtData || [];

  const handleAddToCart = () => {
    const productToAdd = selectedVariant 
      ? { ...product, price: selectedVariant.price, stock: selectedVariant.stock }
      : product;
    addToCart(productToAdd, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate("/cart"), 300);
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const productId = product._id || product.id;
    
    if (isWishlisted) {
      const updated = wishlist.filter((item: Product) => (item._id || item.id) !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(false);
      toast.success("Removed from wishlist");
    } else {
      wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsWishlisted(true);
      toast.success("Added to wishlist");
    }
  };

  const handleShare = async (method: 'copy' | 'facebook' | 'twitter' | 'whatsapp') => {
    const url = window.location.href;
    
    if (method === 'copy') {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setShareCopied(false), 2000);
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(product.name)}`, '_blank');
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${product.name} ${url}`)}`, '_blank');
    }
  };

  // Group variants by attribute type
  const variantGroups: Record<string, ProductVariant[]> = {};
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(variant => {
      const key = variant.attributes?.color || variant.attributes?.size || 'default';
      if (!variantGroups[key]) variantGroups[key] = [];
      variantGroups[key].push(variant);
    });
  }

  return (
    <main className="py-4 md:py-8 bg-background">
      <div className="container-wide">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            to={`/products?category=${product.category.toLowerCase()}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary group">
              <Dialog open={imageZoomed} onOpenChange={setImageZoomed}>
                <DialogTrigger asChild>
                  <button className="w-full h-full relative">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="h-full w-full object-contain p-4 cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-background/80 backdrop-blur-sm rounded-full p-2">
                        <ZoomIn className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain max-h-[80vh]"
                  />
                </DialogContent>
              </Dialog>
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold text-white bg-red-600">
                    -{discount}%
                  </span>
                </div>
              )}

              {/* Stock Badge */}
              {stockStatus === "low" && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-white bg-orange-500">
                    Only {currentStock} left
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "flex-shrink-0 aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all",
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share Button */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Share:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    {shareCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                    WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Brand & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {brand && (
                  <Link
                    to={`/products?search=${encodeURIComponent(brand)}`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Visit the {brand} Store
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-xl md:text-2xl font-bold leading-tight mb-3">
                {product.name}
              </h1>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    )}
                  />
                ))}
              </div>
              <Link
                to="#reviews"
                className="text-sm text-primary hover:underline font-medium"
              >
                {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
              </Link>
              {product.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
              {/* Social Proof */}
              {product.reviewCount > 1000 && (
                <span className="text-sm text-muted-foreground">
                  {Math.floor(product.reviewCount / 1000)}K+ bought in past month
                </span>
              )}
            </div>
            <Separator className="my-4" />

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-medium text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    {discount > 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        Save {formatPrice(product.originalPrice - currentPrice)} ({discount}%)
                      </span>
                    )}
                  </>
                )}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    Limited time deal
                  </span>
                </div>
              )}
            </div>

            {/* Variant Selection - Amazon Style */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">
                      {Object.keys(variantGroups)[0] === 'default' ? 'Size:' : Object.keys(variantGroups)[0] + ':'}
                    </h3>
                    {selectedVariant && (
                      <span className="text-xs text-muted-foreground">
                        Selected: {selectedVariant.name}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {product.variants.map((variant) => {
                      const variantDiscount = product.originalPrice && variant.price < product.originalPrice
                        ? Math.round(((product.originalPrice - variant.price) / product.originalPrice) * 100)
                        : 0;
                      const isSelected = selectedVariant?.id === variant.id;
                      
                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-2 transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-gray-300"
                              )}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{variant.name}</div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-sm font-medium text-primary">
                                    {formatPrice(variant.price)}
                                  </span>
                                  {product.originalPrice && variant.price < product.originalPrice && (
                                    <>
                                      <span className="text-xs text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                      </span>
                                      {variantDiscount > 0 && (
                                        <span className="text-xs text-green-600 font-medium">
                                          Save {variantDiscount}%
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {variant.stock === 0 ? (
                                <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                              ) : variant.stock <= 5 ? (
                                <span className="text-xs text-orange-500 font-medium">Only {variant.stock} left</span>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">In Stock</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {product.variants.length > 5 && (
                    <button className="text-sm text-primary hover:underline mt-2">
                      See more options
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Description Preview */}
            <div className="pt-4 border-t border-border">
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            {/* Quantity & Stock */}
            <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-border">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {stockStatus !== "out" && (
                <span className="text-sm text-muted-foreground">
                  {currentStock} available
                </span>
              )}
              {stockStatus === "out" && (
                <span className="text-sm text-red-500 font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex gap-3">
                <Button
                  variant="cart"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={stockStatus === "out" || currentStock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1"
                  onClick={handleBuyNow}
                  disabled={stockStatus === "out" || currentStock === 0}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleWishlist}
                  className={isWishlisted ? "text-red-500 border-red-500" : ""}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </Button>
              </div>
              
              {/* Gift Options */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gift-option"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="gift-option" className="text-sm text-muted-foreground cursor-pointer">
                  Add a gift receipt for easy returns
                </label>
              </div>
            </div>

            {/* Shipping & Delivery Info */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Free shipping on orders over KSh 5,000
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Returns</p>
                  <p className="text-sm text-muted-foreground">
                    Free 30-day returns. See return policy for details.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-sm text-muted-foreground">
                    M-Pesa, Credit/Debit Cards accepted
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sold by:</span>
                <Link
                  to={`/products?search=${encodeURIComponent(brand)}`}
                  className="text-sm text-primary hover:underline"
                >
                  {brand}
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>✓ Fulfilled by SwiftCart</p>
                <p>✓ Authentic products guaranteed</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-border space-y-3">
              {/* SKU */}
              <p className="text-sm text-muted-foreground">
                SKU: <span className="font-mono">{selectedVariant?.sku || product.sku}</span>
              </p>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Customers usually keep this item</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This product has fewer returns than average compared to similar products.
              </p>
              
              {/* Report Issue Link */}
              <Link
                to="#"
                className="text-sm text-primary hover:underline inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Report issue feature coming soon");
                }}
              >
                Report an issue with this product or seller
              </Link>
            </div>
          </div>
        </div>

        {/* About This Item Section */}
        <section className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">About this item</h2>
          <ul className="space-y-3 max-w-3xl">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-body-light">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Product Specifications */}
        <section className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">Product Specifications</h2>
          <div className="max-w-2xl">
            <table className="w-full">
              <tbody className="divide-y divide-border">
                {Object.entries(specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-3 pr-8 font-medium text-sm w-1/3">{key}</td>
                    <td className="py-3 text-sm text-muted-foreground text-body-light">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Additional Details Section */}
        <section className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">Additional Details</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-secondary/30">
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Small Business</p>
                  <p className="text-sm text-muted-foreground text-body-light">
                    This product is from a small business brand. Support small.
                  </p>
                  <Link to="#" className="text-sm text-primary hover:underline">
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Videos Section Placeholder */}
        <section className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Info className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Product videos coming soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Bought Together */}
        {frequentlyBought.length > 0 && (
          <section className="mb-12 pt-8 border-t border-border">
            <h2 className="text-xl font-medium mb-6">Frequently bought together</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div>
                        <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                        <p className="text-sm font-medium text-primary">{formatPrice(currentPrice)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {frequentlyBought.map((item: Product) => (
                  <div key={item._id || item.id} className="flex items-center gap-4 mb-4">
                    <span className="text-2xl text-muted-foreground">+</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-5 w-5 rounded border-gray-300"
                      />
                      <Link
                        to={`/products/${item.slug}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                        <div>
                          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                          <p className="text-sm font-bold text-primary">{formatPrice(item.price)}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="md:w-80 p-6 border border-border rounded-lg bg-secondary/30">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Total price:</span>
                    <span className="font-bold text-lg">
                      {formatPrice(
                        currentPrice +
                        frequentlyBought.reduce((sum: number, item: Product) => sum + item.price, 0)
                      )}
                    </span>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  Add all to Cart
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Product Description (Full) */}
        <section className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">Product Description</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-body-light">
              {product.description}
            </p>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="mb-12 pt-8 border-t border-border">
          <h2 className="text-xl font-medium mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {/* Review Summary */}
            <div className="flex items-center gap-8 p-6 border border-border rounded-lg bg-secondary/30">
              <div className="text-center">
                <div className="text-3xl font-medium mb-1">{product.rating.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {product.reviewCount.toLocaleString()} reviews
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Share your thoughts with other customers
                </p>
                <Button variant="outline" size="sm">
                  Write a Review
                </Button>
              </div>
            </div>

            {/* Sample Reviews (would come from API in production) */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {['A', 'B', 'C'][i - 1]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Customer {i}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={cn(
                              "h-3 w-3",
                              j < 5 - i ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Great product! Highly recommend. Fast shipping and excellent quality.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Verified Purchase • {i} day{i > 1 ? 's' : ''} ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Consider a Similar Item */}
        {relatedProducts.length > 0 && (
          <section className="mb-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-medium">Consider a similar item</h2>
              {relatedProducts[0]?.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-6 items-start">
              <Link
                to={`/products/${relatedProducts[0].slug}`}
                className="flex-shrink-0"
              >
                <img
                  src={relatedProducts[0].image}
                  alt={relatedProducts[0].name}
                  className="w-32 h-32 object-contain rounded"
                />
              </Link>
              <div className="flex-1">
                <Link
                  to={`/products/${relatedProducts[0].slug}`}
                  className="text-base font-medium hover:text-primary transition-colors line-clamp-2 mb-2"
                >
                  {relatedProducts[0].name}
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(relatedProducts[0].rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <Link
                    to={`/products/${relatedProducts[0].slug}#reviews`}
                    className="text-sm text-primary hover:underline"
                  >
                    {relatedProducts[0].rating.toFixed(1)} ({relatedProducts[0].reviewCount.toLocaleString()} ratings)
                  </Link>
                </div>
                <div className="text-base font-medium text-primary mb-2">
                  {formatPrice(relatedProducts[0].price)}
                  {relatedProducts[0].originalPrice && (
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      {formatPrice(relatedProducts[0].originalPrice)}
                    </span>
                  )}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/products/${relatedProducts[0].slug}`}>
                    View Product
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Products Related to This Item */}
        {relatedProducts.length > 1 && (
          <section className="mb-12 pt-8 border-t border-border">
            <h2 className="text-xl font-medium mb-6">Products related to this item</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {relatedProducts.slice(1).map((relatedProduct: Product) => (
                <ProductCard
                  key={relatedProduct._id || relatedProduct.id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;
