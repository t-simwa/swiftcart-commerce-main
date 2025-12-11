import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@/types/product";

interface AmazonProductCarouselProps {
  title: string;
  products: Product[];
  seeMoreLink?: string;
  seeMoreText?: string;
  subtitle?: string;
}

export function AmazonProductCarousel({
  title,
  products,
  seeMoreLink,
  seeMoreText = "See more",
  subtitle,
}: AmazonProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      // On mobile: scroll by one card width (full viewport minus padding), on desktop: scroll by 300px
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile 
        ? scrollRef.current.clientWidth 
        : 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container-wide">
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

        <div className="relative group">
          {/* Gradient Overlays for Arrow Contrast */}
          <div className="absolute left-0 top-0 w-[10%] h-full bg-gradient-to-r from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 w-[10%] h-full bg-gradient-to-l from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />

          {/* Navigation Arrows - Ultra-Minimalist (Desktop only) */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-[10px] md:left-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:left-[8px] md:hover:left-[18px] hidden md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-[10px] md:right-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:right-[8px] md:hover:right-[18px] hidden md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
          </button>

          {/* Product Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {/* Mobile: Add padding spacer for first card centering */}
            <div className="min-w-[calc((100vw-2rem)/2-100px)] md:hidden flex-shrink-0" />
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[calc(100vw-2rem)] md:min-w-[240px] w-[calc(100vw-2rem)] md:w-[240px] snap-center md:snap-start flex-shrink-0 flex justify-center"
                style={{ height: '100%' }}
              >
                <ProductCard product={product} className="h-full w-full max-w-[200px] md:max-w-none" />
              </div>
            ))}
            {/* Mobile: Add padding spacer for last card centering */}
            <div className="min-w-[calc((100vw-2rem)/2-100px)] md:hidden flex-shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

