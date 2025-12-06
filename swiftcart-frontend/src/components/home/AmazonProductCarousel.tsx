import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      const scrollAmount = 300;
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

        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md border border-border hover:bg-secondary"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md border border-border hover:bg-secondary"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Product Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[200px] md:min-w-[240px] w-[200px] md:w-[240px] snap-start flex-shrink-0"
                style={{ height: '100%' }}
              >
                <ProductCard product={product} className="h-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

