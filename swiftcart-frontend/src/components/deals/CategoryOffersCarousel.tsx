import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryOfferCard } from "./CategoryOfferCard";
import { cn } from "@/lib/utils";

interface CategoryOffer {
  id: string;
  title: string;
  image: string;
  link: string;
}

interface CategoryOffersCarouselProps {
  title: string;
  offers: CategoryOffer[];
  className?: string;
}

export function CategoryOffersCarousel({
  title,
  offers,
  className,
}: CategoryOffersCarouselProps) {
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
  }, [offers]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250; // Card width + spacing
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (offers.length === 0) return null;

  return (
    <div className={cn("category-offers-carousel py-3", className)}>
      {/* Header */}
      <h3 className="text-lg font-medium text-foreground mb-4 ml-4">{title}</h3>

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
          className="flex gap-1 overflow-x-auto snap-x snap-mandatory px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            paddingLeft: canScrollLeft ? "50px" : "12px",
            paddingRight: canScrollRight ? "50px" : "12px",
          }}
        >
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex-shrink-0 snap-start"
            >
              <CategoryOfferCard {...offer} />
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

