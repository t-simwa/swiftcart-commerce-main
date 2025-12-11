import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";

interface CenteredProductCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  seeMoreLink?: string;
  seeMoreText?: string;
}

export function CenteredProductCarousel({
  products,
  title = "Featured Products",
  subtitle,
  seeMoreLink,
  seeMoreText = "View all",
}: CenteredProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        scrollElement.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 768;
      // On mobile: scroll by 100% (one card), on desktop: scroll by card width + gap
      const scrollAmount = isMobile 
        ? scrollRef.current.clientWidth 
        : 244; // card width (240px) + gap (4px)
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Don't render if no products
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-6 md:py-8">
      <div className="container-wide">
        {/* Header */}
        <div className="flex items-end justify-between mb-4 px-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base text-gray-600 font-normal">{subtitle}</p>
            )}
          </div>
          {seeMoreLink && (
            <Link
              to={seeMoreLink}
              className="text-sm font-medium text-primary hover:text-primary/90 hover:underline whitespace-nowrap"
            >
              {seeMoreText}
            </Link>
          )}
        </div>

        {/* Product Carousel */}
        <div className="relative group">
          {/* Gradient Overlays for Arrow Contrast */}
          <div className="absolute left-0 top-0 w-[10%] h-full bg-gradient-to-r from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 w-[10%] h-full bg-gradient-to-l from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />

          {/* Left Navigation Arrow - Ultra-Minimalist (Desktop only) */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-[10px] md:left-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:left-[8px] md:hover:left-[18px] hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
            </button>
          )}

          {/* Right Navigation Arrow - Ultra-Minimalist (Desktop only) */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-[10px] md:right-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:right-[8px] md:hover:right-[18px] hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
            </button>
          )}

          {/* Product Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Mobile: Add padding spacer for first card centering */}
            <div className="min-w-[1rem] md:hidden flex-shrink-0" />
            {products.map((product) => (
              <div
                key={product.id || product._id}
                className="min-w-[calc(100vw-5rem)] md:min-w-[240px] w-[calc(100vw-5rem)] md:w-[240px] snap-center md:snap-start flex-shrink-0"
                style={{ height: '100%' }}
              >
                <ProductCard product={product} className="h-full w-full" />
              </div>
            ))}
            {/* Mobile: Add padding spacer for last card centering */}
            <div className="min-w-[1rem] md:hidden flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

