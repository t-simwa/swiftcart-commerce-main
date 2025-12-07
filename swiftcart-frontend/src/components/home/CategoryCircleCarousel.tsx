import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryWithSubcategories } from "@/data/categories";

interface CategoryCircleCarouselProps {
  title: string;
  categories: CategoryWithSubcategories[];
  seeMoreLink?: string;
  seeMoreText?: string;
}

// Helper function to get category image based on slug
const getCategoryImage = (slug: string): string => {
  const imageMap: Record<string, string> = {
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
    computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
    "smart-home": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    "arts-crafts": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop",
    automotive: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop",
    baby: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&h=200&fit=crop",
    beauty: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&h=200&fit=crop",
    "womens-fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop",
    "mens-fashion": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop",
    "girls-fashion": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop",
    "boys-fashion": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=200&h=200&fit=crop",
    health: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop",
    "home-living": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    industrial: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    luggage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    "movies-tv": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop",
    "pet-supplies": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop",
    software: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop",
    sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
    tools: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop",
    toys: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
    "video-games": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop",
  };
  
  return imageMap[slug] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop";
};

export function CategoryCircleCarousel({
  title,
  categories,
  seeMoreLink,
  seeMoreText = "See more",
}: CategoryCircleCarouselProps) {
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
      return () => scrollElement.removeEventListener("scroll", checkScrollButtons);
    }
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      // On mobile: scroll by 50% (2 items), on desktop: scroll by 100% (5 items)
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile 
        ? scrollRef.current.clientWidth * 0.5 
        : scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container-wide">
        <div className="mb-4 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
            {title}
          </h2>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md border border-border hover:bg-secondary"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background shadow-md border border-border hover:bg-secondary"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Category Scroll Container - 2 items visible on mobile, 5 on desktop */}
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch"
            }}
          >
            <div className="flex gap-3 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category?category=${category.slug}`}
                  className="group flex-shrink-0 snap-start flex flex-col items-center gap-2 md:gap-3 w-[calc(50%-6px)] md:w-[calc(20%-19px)]"
                >
                  {/* Circular Image - Smaller on mobile */}
                  <div className="relative w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden bg-secondary/30 border-2 border-border group-hover:border-primary transition-all duration-200 shadow-md group-hover:shadow-lg">
                    <img
                      src={getCategoryImage(category.slug)}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  {/* Category Name */}
                  <p className="text-xs md:text-base font-medium text-foreground text-center line-clamp-2 w-full group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

