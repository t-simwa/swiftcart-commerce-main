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
  const [deliveryOption, setDeliveryOption] = useState<'shipping' | 'pickup' | 'delivery'>('shipping');
  const [protectionPlan, setProtectionPlan] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: false,
    details: false,
    specifications: false,
    directions: false,
    warranty: false,
  });

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
    <main className="py-4 md:py-8 bg-white">
      <div className="container-wide">

        {/* Main Product Section - Walmart Style Layout (3 Columns) */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Left: Image Gallery with Vertical Thumbnails */}
          <div className="flex flex-col md:flex-row gap-4 flex-shrink-0 w-full md:w-auto">
            {/* Vertical Thumbnail Strip - Hidden on mobile, shown on desktop */}
            {/* Show 3 thumbnails all using the main product image */}
              <div className="hidden md:flex flex-col gap-2 w-20 flex-shrink-0">
              {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                  onClick={() => setSelectedImage(0)}
                    className={cn(
                      "aspect-square w-full overflow-hidden rounded border-2 transition-all",
                    selectedImage === 0
                        ? "border-red-600 ring-2 ring-red-600/20"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <img
                    src={product.image}
                    alt={`${product.name}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                    </div>

            {/* Horizontal Thumbnail Strip - Mobile only */}
            {images.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-square w-16 h-16 overflow-hidden rounded border-2 transition-all flex-shrink-0",
                      selectedImage === index
                        ? "border-red-600 ring-2 ring-red-600/20"
                        : "border-gray-300"
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

            {/* Main Image */}
            <div className="relative w-full md:w-[500px] aspect-square md:h-[500px] bg-white border border-gray-200 rounded flex-shrink-0">
              <Dialog open={imageZoomed} onOpenChange={setImageZoomed}>
                <DialogTrigger asChild>
                  <button className="w-full h-full relative group">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="h-full w-full object-contain p-4 cursor-zoom-in"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                        <ZoomIn className="h-5 w-5 text-gray-700" />
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

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => handleShare('copy')}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                  title="Share"
                >
                  <Share2 className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={toggleWishlist}
                  className={cn(
                    "bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors",
                    isWishlisted && "text-red-500"
                  )}
                  title="Add to Favorites"
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
                </button>
                <button
                  onClick={() => setImageZoomed(true)}
                  className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                  title="Zoom"
                >
                  <ZoomIn className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Center: Product Details - Walmart Style */}
          <div className="flex-1 max-w-full md:max-w-[500px] w-full">
            {/* Popular Pick Badge */}
            {product.featured && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Popular pick
                </span>
              </div>
            )}

            {/* Brand Link */}
            {brand && (
              <div className="mb-2">
                <Link
                  to={`/products?search=${encodeURIComponent(brand)}`}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                >
                  {brand.toUpperCase()}
                </Link>
              </div>
            )}

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews - Walmart Style */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-900">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">|</span>
              <Link
                to="#reviews"
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                {product.reviewCount.toLocaleString()} ratings
              </Link>
            </div>

            {/* Variant Selection - Walmart Style (Color/Size) */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-900">Actual Color:</span>
                    <span className="text-sm text-gray-700 ml-2">{selectedVariant?.name || product.variants[0].name}</span>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 hover:underline">Edit selections</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id || (!selectedVariant && variant.id === product.variants[0].id);
                    const isOutOfStock = variant.stock === 0;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={cn(
                          "relative p-2 rounded border-2 transition-all",
                          isSelected
                            ? "border-red-600 ring-2 ring-red-600/20"
                            : "border-gray-300 hover:border-gray-400",
                          isOutOfStock && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {variant.attributes?.colorImage ? (
                          <img
                            src={variant.attributes.colorImage}
                            alt={variant.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-600">{variant.name}</span>
                          </div>
                        )}
                        <div className="mt-1 text-xs text-center">
                          <div className="font-medium text-gray-900">{variant.name}</div>
                          <div className="text-gray-600">{formatPrice(variant.price)}</div>
                          {isOutOfStock && (
                            <div className="text-red-600 text-xs mt-1">Out of stock</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <Separator className="mb-4" />

            {/* About This Item - Walmart Style */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">About this item</h2>
              {/* Product Description - Shortened */}
              {product.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {product.description.length > 300 
                      ? `${product.description.substring(0, 300)}...` 
                      : product.description}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {/* Specifications at a Glance */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Specifications at a glance</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(specifications).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 hover:underline mt-2">
                    View full specifications
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Purchase Section - Walmart Style */}
          <div className="w-full md:w-[350px] flex-shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Price Section - Walmart Style */}
            <div className="mb-6">
              <div className="mb-2">
                <span className="text-3xl font-normal" style={{ color: "#007a00" }}>
                  {formatPrice(currentPrice)}
                </span>
              </div>
              {product.originalPrice && discount > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-900">
                    As low as {formatPrice(Math.round(currentPrice / 12))}/mo
                  </span>
                  <span className="text-sm text-gray-600"> with </span>
                  <button className="text-sm text-red-600 hover:underline">OnePay Loans</button>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  <span>Free 90-day returns</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-base py-3 mb-4 rounded"
              onClick={handleAddToCart}
              disabled={stockStatus === "out" || currentStock === 0}
            >
              Add to cart
            </Button>
            <Separator className="mb-4" />

            {/* Delivery Options */}
            <div className="mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">How you'll get this item:</h3>
              {/* Walmart Plus Checkbox */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-red-600"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-900">I want delivery savings with</span>
                    <span className="text-red-600 font-medium">SwiftCart Plus</span>
                  </div>
                </label>
                <p className="text-xs text-gray-600 ml-6 mt-1">You get 30 days free! Choose a plan at checkout.</p>
              </div>
              <div className="space-y-3">
                <label className={cn(
                  "flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 bg-white transition-all",
                  deliveryOption === 'shipping'
                    ? "border-gray-400"
                    : "border-gray-200 hover:border-gray-300"
                )}>
                  <input
                    type="radio"
                    name="delivery"
                    value="shipping"
                    checked={deliveryOption === 'shipping'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                    className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Shipping</span>
                    </div>
                    <div className="text-sm text-gray-700 ml-6">Arrives tomorrow</div>
                    <div className="text-sm text-gray-600 ml-6">Order within 1 hr 6 min</div>
                    <div className="text-sm text-green-600 font-medium ml-6">Free</div>
                  </div>
                </label>
                <label className={cn(
                  "flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 bg-white transition-all",
                  deliveryOption === 'pickup'
                    ? "border-gray-400"
                    : "border-gray-200 hover:border-gray-300"
                )}>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryOption === 'pickup'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                    className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Pickup</span>
                    </div>
                    <div className="text-sm text-gray-700 ml-6">
                      <span>As soon as 12pm</span>
                      <span className="ml-1">today</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium ml-6">Free</div>
                  </div>
                </label>
                <label className={cn(
                  "flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 bg-white transition-all",
                  deliveryOption === 'delivery'
                    ? "border-gray-400"
                    : "border-gray-200 hover:border-gray-300"
                )}>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryOption === 'delivery'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                    className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Delivery</span>
                    </div>
                    <div className="text-sm text-gray-700 ml-6">As soon as 1 hour</div>
                  </div>
                </label>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <span>Sacramento, 95829</span>
                <button className="text-red-600 hover:text-red-700 hover:underline ml-2">Change</button>
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                {deliveryOption === 'delivery' && "Delivery as soon as 1 hour."}
                {deliveryOption === 'pickup' && "Pickup as soon as 12pm today."}
                {deliveryOption === 'shipping' && "Arrives by Tomorrow . Order within 1 hr 6 min"}
              </div>
            </div>
            <Separator className="mb-4" />

            {/* Seller Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Store className="h-4 w-4" />
                <span>Sold and shipped by SwiftCart.com</span>
              </div>
            </div>

            {/* Add to List/Registry */}
            <div className="flex gap-4 text-sm mb-4">
              <button className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline">
                <Heart className="h-4 w-4" />
                <span>Add to list</span>
              </button>
              <button className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline">
                <Award className="h-4 w-4" />
                <span>Add to registry</span>
              </button>
            </div>

            {/* More Seller Options */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">More seller options (4)</h3>
              <div className="text-sm text-gray-700 mb-2">
                Starting from {formatPrice(Math.round(currentPrice * 1.75))}
              </div>
              <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
                Compare all sellers
              </button>
            </div>

            {/* Walmart Plus Banner */}
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-2xl">+</div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Get free delivery, shipping and more*</h3>
                  <p className="text-xs text-gray-600 mb-2">*Restrictions apply Start 30-day free trial</p>
                  <button className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium">
                    Learn more about SwiftCart Plus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Deals For You - Walmart Style */}
        {relatedProducts.length > 0 && (
          <section className="mb-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Top deals for you</h2>
                <h3 className="text-sm text-gray-600">Explore additional savings</h3>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {relatedProducts.slice(0, 8).map((item: Product) => (
                <Link
                  key={item._id || item.id}
                  to={`/products/${item.slug}`}
                  className="flex-shrink-0 w-[160px] md:w-[200px] group"
                >
                  <div className="relative mb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-[200px] object-contain bg-white border border-gray-200 rounded"
                    />
                    {item.originalPrice && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Cyber Deal
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(item.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{item.reviewCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Expandable Sections - Walmart Style */}
        <div className="mb-12 space-y-0 border-t border-gray-200">
          {/* About this item - Expandable */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setExpandedSections({...expandedSections, about: !expandedSections.about})}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h2 className="text-lg font-medium text-gray-900">About this item</h2>
              <ChevronRight className={cn("h-5 w-5 text-gray-600 transition-transform", expandedSections.about && "rotate-90")} />
            </button>
            {expandedSections.about && (
              <div className="pb-4">
                <ul className="space-y-3 max-w-3xl">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Product details - Expandable */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setExpandedSections({...expandedSections, details: !expandedSections.details})}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h2 className="text-lg font-medium text-gray-900">Product details</h2>
              <ChevronRight className={cn("h-5 w-5 text-gray-600 transition-transform", expandedSections.details && "rotate-90")} />
            </button>
            {expandedSections.details && (
              <div className="pb-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Specifications - Expandable */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setExpandedSections({...expandedSections, specifications: !expandedSections.specifications})}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h2 className="text-lg font-medium text-gray-900">Specifications</h2>
              <ChevronRight className={cn("h-5 w-5 text-gray-600 transition-transform", expandedSections.specifications && "rotate-90")} />
            </button>
            {expandedSections.specifications && (
              <div className="pb-4">
                <div className="max-w-2xl">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-3 pr-8 font-medium text-sm w-1/3 text-gray-900">{key}</td>
                          <td className="py-3 text-sm text-gray-700">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Directions - Expandable */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setExpandedSections({...expandedSections, directions: !expandedSections.directions})}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h2 className="text-lg font-medium text-gray-900">Directions</h2>
              <ChevronRight className={cn("h-5 w-5 text-gray-600 transition-transform", expandedSections.directions && "rotate-90")} />
            </button>
            {expandedSections.directions && (
              <div className="pb-4">
                <p className="text-gray-700">Product assembly and usage instructions will be provided with your purchase.</p>
              </div>
            )}
          </div>

          {/* Warranty - Expandable */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setExpandedSections({...expandedSections, warranty: !expandedSections.warranty})}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <h2 className="text-lg font-medium text-gray-900">Warranty</h2>
              <ChevronRight className={cn("h-5 w-5 text-gray-600 transition-transform", expandedSections.warranty && "rotate-90")} />
            </button>
            {expandedSections.warranty && (
              <div className="pb-4">
                <p className="text-gray-700">This product comes with a manufacturer's warranty. See product documentation for details.</p>
              </div>
            )}
          </div>

          {/* Report Issue */}
          <div className="py-4">
            <button className="text-sm text-red-600 hover:text-red-700 hover:underline">
              Report incorrect product information
            </button>
          </div>
        </div>

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

        {/* Frequently Bought Together - Walmart Style */}
        {frequentlyBought.length > 0 && (
          <section className="mb-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Frequently bought together</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="h-5 w-5 rounded border-gray-300"
                  />
                  <Link
                    to={`/products/${product.slug}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-contain rounded border border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                      <p className="text-sm font-medium" style={{ color: "#007a00" }}>{formatPrice(currentPrice)}</p>
                    </div>
                  </Link>
                </div>
                {frequentlyBought.map((item: Product) => (
                  <div key={item._id || item.id} className="flex items-center gap-4 mb-4">
                    <span className="text-2xl text-gray-400">+</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <Link
                      to={`/products/${item.slug}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                        <p className="text-sm font-medium" style={{ color: "#007a00" }}>{formatPrice(item.price)}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="w-full md:w-80 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Current price is</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatPrice(
                        currentPrice +
                        frequentlyBought.reduce((sum: number, item: Product) => sum + item.price, 0)
                      )}
                    </span>
                  </div>
                </div>
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium" size="lg">
                  Add {frequentlyBought.length + 1} items to cart
                </Button>
                <Separator className="my-4" />
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Items may be delivered on different dates</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Pages - Walmart Style */}
        <section className="mb-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Related pages</h2>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link to={`/products?search=${encodeURIComponent(brand)}`} className="text-sm text-red-600 hover:text-red-700 hover:underline">
                {brand} Table Set
              </Link>
            </li>
            <li>
              <Link to={`/products?category=${product.category}`} className="text-sm text-red-600 hover:text-red-700 hover:underline">
                {product.category} Products
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-sm text-red-600 hover:text-red-700 hover:underline">
                Shop All Products
              </Link>
            </li>
          </ul>
        </section>

        {/* Customer Ratings & Reviews - Walmart Style */}
        <section id="reviews" className="mb-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Customer ratings & reviews</h2>
          
          {/* Rating Summary */}
          <div className="flex items-start gap-8 mb-6">
            <div>
              <div className="text-3xl font-medium text-gray-900 mb-1">{product.rating.toFixed(1)} out of 5</div>
              <div className="flex items-center gap-1 mb-2">
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
              <p className="text-sm text-gray-600">stars</p>
              <p className="text-sm text-gray-600">{product.reviewCount.toLocaleString()} ratings</p>
              <span className="text-sm text-gray-600">|</span>
              <Link to="#reviews" className="text-sm text-red-600 hover:underline ml-1">
                {Math.floor(product.reviewCount * 0.5)} reviews
              </Link>
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              View all reviews
            </Button>
          </div>

          {/* Star Distribution */}
          <div className="mb-6">
            <ul className="space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = stars === 5 ? 79 : stars === 4 ? 9 : stars === 3 ? 3 : stars === 2 ? 2 : 6;
                const count = Math.floor(product.reviewCount * (percentage / 100));
                return (
                  <li key={stars}>
                    <Link
                      to="#reviews"
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:underline"
                    >
                      <span>{stars} stars</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[200px]">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-600">{percentage}% ({count})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <Separator className="mb-6" />

          {/* Reviews Summary - AI Generated Pros */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900">Reviews summary</h3>
              <button className="text-sm text-red-600 hover:underline">
                View less
              </button>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-900">Pros</span>
              <ul className="mt-2 space-y-1">
                {[
                  "Very sturdy construction: Table can hold heavy loads.",
                  "Competitive price: Offers a lower cost compared to similar products.",
                  "Easy to assemble: Sets up quickly with minimal effort.",
                  "Compact to store: Folds in half for convenient storage.",
                ].map((pro, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <Link to="#reviews" className="text-red-600 hover:underline">
                      {pro.split(':')[0]}
                    </Link>
                    : {pro.split(':').slice(1).join(':')}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Generated by AI</span>
              <button>
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Customer Images */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900">Customer images</h3>
              <button className="text-sm text-red-600 hover:underline">View all</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <button
                  key={i}
                  className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded border border-gray-300"
                >
                  <span className="text-xs text-gray-500">Image {i}</span>
                </button>
              ))}
              <button className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-red-600">
                +79 images
              </button>
            </div>
          </div>

          {/* Review Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <button className="flex items-center gap-1 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
              All filters
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
            <button className="flex items-center gap-1 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
              <Star className="h-4 w-4" />
              Star rating
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
            <button className="text-sm text-gray-700 border border-gray-300 rounded px-3 py-1 hover:bg-gray-50">
              Verified purchases only
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-700">Sort by</span>
              <span className="text-sm text-gray-500">|</span>
              <button className="flex items-center gap-1 text-sm text-gray-700">
                Most relevant
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Showing 1-3 of {Math.floor(product.reviewCount * 0.5)} reviews</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-red-600">
                      {['J', 'A', 'J'][i - 1]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">Aug {8 + i * 10}, 2025</span>
                      <span className="text-sm font-medium text-gray-900">
                        {['Jeff', 'JaniceRO', 'Jessica'][i - 1]}
                      </span>
                      {i === 2 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Top Reviewer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Item details: Color: {selectedVariant?.name || 'White'}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            "h-4 w-4",
                            j < 5 ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                          )}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">5 out of 5 stars review</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Verified Purchase
                      <button className="ml-1">
                        <Info className="h-3 w-3 inline" />
                      </button>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {['Very sturdy, great value.', 'Awesome table', 'strong and easy to use'][i - 1]}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {[
                        'Nice folding table, very sturdy. Has some weight to it, but that\'s a good thing, and the reason it\'s so stable and sturdy.',
                        'I ordered this table at the last minute for a family birthday celebration. It arrived within an hour and saved the day.',
                        'Got this delivered to our house the day before Thanksgiving, which was amazing since we had extra people.',
                      ][i - 1]}
                    </p>
                    <button className="text-sm text-red-600 hover:underline">View more</button>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-gray-600">Helpful?</span>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                        <span>👍</span>
                        <span>(0)</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                        <span>👎</span>
                        <span>(0)</span>
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-900">Report</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-6">
            View all reviews ({Math.floor(product.reviewCount * 0.5)})
          </Button>
        </section>

        {/* Similar Items You Might Like - Walmart Style */}
        {relatedProducts.length > 0 && (
          <section className="mb-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Similar items you might like</h2>
                <h3 className="text-sm text-gray-600">Based on what customers bought</h3>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {relatedProducts.slice(0, 8).map((item: Product) => (
                <Link
                  key={item._id || item.id}
                  to={`/products/${item.slug}`}
                  className="flex-shrink-0 w-[200px] group"
                >
                  <div className="relative mb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-[200px] object-contain bg-white border border-gray-200 rounded"
                    />
                    {item.originalPrice && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        Cyber Deal
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(item.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{item.reviewCount}</span>
                  </div>
                  <div className="text-xs text-gray-600">Shipping, arrives in 2 days</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Customers Say These Are... - Walmart Style */}
        {relatedProducts.length > 0 && (
          <section className="mb-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Customers say these are sturdy</h2>
                <h3 className="text-sm text-gray-600">Based on customer reviews</h3>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {relatedProducts.slice(0, 6).map((item: Product) => (
                <Link
                  key={item._id || item.id}
                  to={`/products/${item.slug}`}
                  className="flex-shrink-0 w-[200px] group"
                >
                  <div className="relative mb-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-[200px] object-contain bg-white border border-gray-200 rounded"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(item.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{item.reviewCount}</span>
                  </div>
                  <div className="text-xs text-gray-600">Shipping, arrives in 3+ days</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Breadcrumb - Walmart Style (at bottom) */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap pt-8 border-t border-gray-200">
          <Link to="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-red-600 transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <Link
            to={`/products?category=${product.category.toLowerCase()}`}
            className="hover:text-red-600 transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>
      </div>
    </main>
  );
};

export default ProductDetail;
