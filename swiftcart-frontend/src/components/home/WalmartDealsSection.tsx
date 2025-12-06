import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalmartDealCard } from "./WalmartDealCard";
import { Product } from "@/types/product";

interface WalmartDealsSectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export function WalmartDealsSection({
  products,
  title = "Shop all Deals & more",
  subtitle = "Up to 50% off",
  viewAllLink = "/deals",
  viewAllText = "View all",
}: WalmartDealsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
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
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm font-medium text-primary hover:text-primary/90 hover:underline whitespace-nowrap"
            >
              {viewAllText}
            </Link>
          )}
        </div>

        {/* Product Carousel */}
        <div className="relative">
          {/* Left Navigation Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </Button>

          {/* Right Navigation Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </Button>

          {/* Product Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id || product._id}
                className="min-w-[200px] md:min-w-[240px] w-[200px] md:w-[240px] snap-start flex-shrink-0"
                style={{ height: '100%' }}
              >
                <WalmartDealCard product={product} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

