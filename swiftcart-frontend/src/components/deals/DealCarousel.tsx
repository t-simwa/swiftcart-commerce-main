import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealCard } from "./DealCard";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface DealCarouselProps {
  title: string;
  seeMoreLink?: string;
  products: Product[];
  className?: string;
  cardWidth?: number;
  spacing?: number;
}

export function DealCarousel({
  title,
  seeMoreLink,
  products,
  className,
  cardWidth = 240,
  spacing = 12,
}: DealCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScrollability);
      return () => element.removeEventListener("scroll", checkScrollability);
    }
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = cardWidth + spacing;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className={cn("deal-carousel", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {seeMoreLink && (
          <a
            href={seeMoreLink}
            className="text-sm text-primary hover:underline"
          >
            See more
          </a>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Previous Button */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-r-md rounded-l-none bg-background/95 hover:bg-background shadow-md border-l-0"
            onClick={() => scroll("left")}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            paddingLeft: canScrollLeft ? "40px" : "0",
            paddingRight: canScrollRight ? "40px" : "0",
          }}
        >
          {products.map((product, index) => (
            <div
              key={product._id || product.id || index}
              className="flex-shrink-0 snap-start"
              style={{ width: `${cardWidth}px` }}
            >
              <DealCard product={product} />
            </div>
          ))}
        </div>

        {/* Next Button */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-l-md rounded-r-none bg-background/95 hover:bg-background shadow-md border-r-0"
            onClick={() => scroll("right")}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

