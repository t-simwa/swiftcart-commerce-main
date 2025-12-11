import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      <div className="relative group">
        {/* Gradient Overlays for Arrow Contrast */}
        <div className="absolute left-0 top-0 w-[10%] h-full bg-gradient-to-r from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />
        <div className="absolute right-0 top-0 w-[10%] h-full bg-gradient-to-l from-black/8 to-transparent z-[5] pointer-events-none hidden md:block" />

        {/* Previous Arrow - Ultra-Minimalist (Desktop only) */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-[10px] md:left-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:left-[8px] md:hover:left-[18px] hidden md:flex"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto snap-x snap-mandatory px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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

        {/* Next Arrow - Ultra-Minimalist (Desktop only) */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-[10px] md:right-[20px] top-1/2 -translate-y-1/2 z-[10] w-[50px] h-[50px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:right-[8px] md:hover:right-[18px] hidden md:flex"
            aria-label="Next page"
          >
            <ChevronRight className="h-[32px] w-[32px] text-black stroke-[2px] group-hover:stroke-[3px] transition-all duration-200" />
          </button>
        )}
      </div>
    </div>
  );
}

