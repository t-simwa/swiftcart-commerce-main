import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/types/product";

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
        <div className="relative">
          {/* Left Navigation Button */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hidden md:flex"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>
          )}

          {/* Right Navigation Button */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hidden md:flex"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
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

