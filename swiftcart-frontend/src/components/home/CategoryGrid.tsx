import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/products";

export function CategoryGrid() {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-medium text-foreground">Shop by Category</h2>
          <Link
            to="/categories"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See all categories
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group bg-card rounded-lg border border-border p-4 md:p-5 hover:shadow-card-hover transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="aspect-square mb-4 rounded-md overflow-hidden bg-secondary">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="font-medium text-foreground text-sm md:text-base mb-1 line-clamp-1">
                {category.name}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground text-body-light">
                {category.productCount}+ items
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile See All Link */}
        <Link
          to="/categories"
          className="flex sm:hidden items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-6"
        >
          See all categories
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}