import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Trash2, Truck, Car, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, getProductId } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";

const Cart = () => {
  const { state, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [zipCode, setZipCode] = useState("95829");
  const [isGift, setIsGift] = useState(false);
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);
  const essentialsScrollRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subtotal = totalPrice;
  const shippingFee = subtotal >= 5000 ? 0 : 300;
  const savings = state.items.reduce((sum, item) => {
    if (item.product.originalPrice) {
      return sum + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const estimatedTotal = subtotal + shippingFee;

  // Fetch recommended products for "Add your essentials"
  const { data: recommendedProducts } = useQuery({
    queryKey: ["products", "recommended", "cart"],
    queryFn: async () => {
      const response = await apiClient.getProducts({ limit: 5 });
      return response.data?.products || [];
    },
  });

  // Scroll function for essentials carousel
  const scrollEssentials = (direction: "left" | "right") => {
    if (essentialsScrollRef.current) {
      // On mobile: scroll by one card width (full viewport minus padding), on desktop: scroll by 400px
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile 
        ? essentialsScrollRef.current.clientWidth 
        : 400;
      essentialsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="container-wide py-16 min-h-[60vh]">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add items to your cart to get started.</p>
          <Button asChild size="lg">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-4 md:py-6">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Column - Cart Items */}
        <div className="flex-1 min-w-0 w-full order-1 lg:order-1">
          {/* Cart Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-medium text-gray-900">
              Cart ({state.items.length} {state.items.length === 1 ? "item" : "items"})
            </h1>
          </div>

          {/* Pickup and Delivery Options */}
          <div className="mb-4">
            <button
              onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
              className="w-full flex items-center justify-between mb-3"
            >
              <h2 className="text-base font-medium text-gray-900">Pickup and delivery options</h2>
              {isOptionsExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {isOptionsExpanded && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {/* Shipping Card */}
                <button
                  onClick={() => setDeliveryOption("shipping")}
                  className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg bg-white transition-all flex-shrink-0 ${
                    deliveryOption === "shipping"
                      ? "border-gray-900 border-2"
                      : "border-gray-200"
                  }`}
                >
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Shipping</span>
                  <span className="text-xs text-gray-600">Available</span>
                </button>

                {/* Pickup Card */}
                <button
                  onClick={() => setDeliveryOption("pickup")}
                  className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg bg-white transition-all flex-shrink-0 ${
                    deliveryOption === "pickup"
                      ? "border-gray-900 border-2"
                      : "border-gray-200"
                  }`}
                >
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-2" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Pickup</span>
                  <span className="text-xs text-gray-600">Available</span>
                </button>

                {/* Delivery Card */}
                <button
                  onClick={() => setDeliveryOption("delivery")}
                  className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg bg-white transition-all flex-shrink-0 ${
                    deliveryOption === "delivery"
                      ? "border-gray-900 border-2"
                      : "border-gray-200"
                  }`}
                >
                  <div className="relative mb-2">
                    <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Delivery</span>
                  <span className="text-xs text-gray-600">Available</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-4 mb-6 md:mb-16">
            {state.items.map((item) => {
              const hasDiscount = item.product.originalPrice && item.product.originalPrice > item.product.price;
              const discount = hasDiscount
                ? Math.round(((item.product.originalPrice! - item.product.price) / item.product.originalPrice!) * 100)
                : 0;
              const stockStatus =
                item.product.stock === 0
                  ? "out"
                  : item.product.stock <= item.product.lowStockThreshold
                  ? "low"
                  : "in";

              const productId = getProductId(item.product);
              
              return (
                <div
                  key={productId}
                  className="border border-gray-200 rounded-lg p-3 md:p-4 bg-white"
                >
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="flex-shrink-0 self-center sm:self-start"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded border border-gray-200"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="text-base font-medium text-gray-900 hover:text-red-600 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-gray-600 mt-1">
                            Sold and shipped by SwiftCart
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Free shipping on orders over KSh 5,000
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="ml-4 text-gray-400 hover:text-gray-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {hasDiscount && (
                          <span
                            className="px-2 py-0.5 text-[11px] font-semibold text-white rounded-sm"
                            style={{ backgroundColor: "#991B1B" }}
                          >
                            Cyber Deal
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 text-[11px] font-semibold rounded-sm border"
                          style={{ 
                            color: "#991B1B",
                            borderColor: "#991B1B",
                            backgroundColor: "white"
                          }}
                        >
                          In {Math.floor(Math.random() * 200) + 50}+ people's carts
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-2">
                        {hasDiscount ? (
                          <>
                            <span
                              className="text-lg font-normal"
                              style={{ color: "#007a00" }}
                            >
                              {formatPrice(item.product.price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.product.originalPrice!)}
                            </span>
                            <span className="text-sm text-gray-600">
                              You save {formatPrice((item.product.originalPrice! - item.product.price) * item.quantity)}
                            </span>
                          </>
                        ) : (
                          <span
                            className="text-lg font-normal"
                            style={{ color: "#007a00" }}
                          >
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      {stockStatus === "low" && (
                        <p className="text-xs text-orange-600 font-medium mb-2">
                          Low stock
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 border border-gray-300 rounded w-fit">
                          <button
                            onClick={() => updateQuantity(productId, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity >= item.product.stock}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <button 
                            onClick={() => removeFromCart(productId)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                          <button className="text-sm text-red-600 hover:text-red-700">
                            Save for later
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-2">
          <div className="lg:sticky lg:top-4">
            {/* Continue to Checkout Button - Desktop only (top) */}
            <Button
              size="lg"
              className="hidden lg:block w-full bg-red-600 hover:bg-red-700 text-white font-medium text-base py-3 mb-4 rounded"
              asChild
            >
              <Link to="/checkout">Continue to checkout</Link>
            </Button>

            {/* Alert Banner */}
            {state.items.some(
              (item) =>
                item.product.stock <= item.product.lowStockThreshold &&
                item.product.stock > 0
            ) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-900">
                  {state.items.find(
                    (item) =>
                      item.product.stock <= item.product.lowStockThreshold &&
                      item.product.stock > 0
                  )?.product.name.slice(0, 30)}
                  ... is selling fast! Check out soon before it's sold out.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 mb-4">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Order details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">
                    Subtotal ({state.items.length} {state.items.length === 1 ? "item" : "items"})
                  </span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Savings</span>
                    <span className="text-green-600">-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">
                    Shipping {subtotal < 5000 && "(below KSh 5,000 order minimum)"}
                  </span>
                  <span className="text-gray-900">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">Taxes</span>
                  <span className="text-gray-900">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Estimated total</span>
                    <span className="font-medium" style={{ color: "#007a00" }}>{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Walmart+ Promotion */}
            {shippingFee > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white mb-4">
                <p className="text-sm text-gray-900 mb-2">
                  Get free shipping & skip the KSh {shippingFee} shipping fee--even on small orders!
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="walmart-plus"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="walmart-plus" className="text-sm text-red-600 cursor-pointer">
                    Try SwiftCart+ free for 30 days
                  </label>
                </div>
              </div>
            )}

            {/* Gift Option */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gift-option"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="gift-option" className="text-sm text-gray-900 cursor-pointer flex items-center gap-1">
                  <span>🎁</span>
                  This order is a gift.
                </label>
              </div>
            </div>

            {/* Payment Options */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Earn cash back with SwiftCart CashRewards Card
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Get 5% cash back on SwiftCart.com purchases, 2% cash back at restaurants and gas stations, and 1% cash back everywhere else.
              </p>
              <button className="text-sm text-red-600 hover:text-red-700">
                Learn more
              </button>
            </div>

            {/* Continue to Checkout Button - Mobile only (bottom) */}
            <Button
              size="lg"
              className="lg:hidden w-full bg-red-600 hover:bg-red-700 text-white font-medium text-base py-3 mt-4 rounded"
              asChild
            >
              <Link to="/checkout">Continue to checkout</Link>
            </Button>
          </div>
        </div>

        {/* Add your essentials Section - After checkout button on mobile */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <div className="w-full order-3 lg:order-3 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 px-4 md:px-0">
              Add your essentials
            </h2>
            <div className="relative px-4 md:px-0">
              {/* Left Navigation Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hidden md:flex"
                onClick={() => scrollEssentials("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </Button>

              {/* Right Navigation Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hidden md:flex"
                onClick={() => scrollEssentials("right")}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </Button>

              {/* Product Scroll Container */}
              <div
                ref={essentialsScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* Mobile: Add padding spacer for first card centering */}
                <div className="min-w-[calc((100vw-2rem)/2-100px)] md:hidden flex-shrink-0" />
                {recommendedProducts.slice(0, 4).map((product: Product) => (
                  <div 
                    key={product._id || product.id || product.slug} 
                    className="min-w-[calc(100vw-2rem)] md:min-w-[220px] w-[calc(100vw-2rem)] md:w-[220px] snap-center md:snap-start flex-shrink-0 flex justify-center"
                  >
                    <ProductCard
                      product={product}
                      className="h-full w-full max-w-[200px] md:max-w-none"
                      style={{ height: '420px' }}
                    />
                  </div>
                ))}
                {/* Mobile: Add padding spacer for last card centering */}
                <div className="min-w-[calc((100vw-2rem)/2-100px)] md:hidden flex-shrink-0" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

