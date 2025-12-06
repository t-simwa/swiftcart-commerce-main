import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function FeaturedProducts() {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-secondary/30">
      <div className="container-wide">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-medium text-foreground">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-0.5 text-body-light">Hand-picked for quality and value</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Link
              to="/products?featured=true"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Products Horizontal Scroll */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="min-w-[200px] md:min-w-0 snap-start animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile See All Link */}
        <Link
          to="/products?featured=true"
          className="flex sm:hidden items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
        >
          See all featured products
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}