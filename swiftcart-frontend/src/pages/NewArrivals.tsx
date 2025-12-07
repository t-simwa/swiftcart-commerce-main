import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { NewArrivalsCard } from "@/components/new-arrivals/NewArrivalsCard";
import { NewArrivalsFilters } from "@/components/new-arrivals/NewArrivalsFilters";
import { NewArrivalsSortDropdown } from "@/components/new-arrivals/NewArrivalsSortDropdown";
import { NewArrivalsBrowseByDropdown } from "@/components/new-arrivals/NewArrivalsBrowseByDropdown";
import { apiClient } from "@/lib/api";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

const NewArrivals = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Get filter params from URL
  const category = searchParams.get("category");
  const brands = searchParams.get("brands");
  const minDiscount = searchParams.get("minDiscount");
  const maxDiscount = searchParams.get("maxDiscount");
  const minRating = searchParams.get("minRating");
  const premiumExclusive = searchParams.get("premiumExclusive") === "true";
  const sort = searchParams.get("sort") || "newest";

  // Fetch new arrivals from API (products sorted by newest)
  const { data, isLoading, error } = useQuery({
    queryKey: ["new-arrivals", page, category, brands, minDiscount, maxDiscount, minRating, premiumExclusive, sort],
    queryFn: async () => {
      const response = await apiClient.getProducts({
        page,
        limit: 20,
        category: category || undefined,
        brands: brands || undefined,
        sort: sort as any,
      });
      
      return {
        products: response.data?.products || [],
        pagination: response.data?.pagination,
      };
    },
  });

  const products = data?.products || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Sub-Navigation */}
      <div className="hidden md:block bg-white text-black border-b border-gray-200">
        <div className="container-wide">
          <nav className="flex items-center justify-center gap-6 h-10 text-sm overflow-x-auto">
            <Link
              to="/new-arrivals"
              className={cn(
                "text-black hover:text-primary transition-colors pb-2 border-b-2 whitespace-nowrap",
                "border-primary text-primary font-medium"
              )}
            >
              New Arrivals
            </Link>
          </nav>
        </div>
      </div>

      <div className="container-wide py-6">
        {/* Browse By and Sort Controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <NewArrivalsFilters />
              </SheetContent>
            </Sheet>
            
            <NewArrivalsBrowseByDropdown />
          </div>
          
          <NewArrivalsSortDropdown />
        </div>

        {/* Two-Column Layout: Filters + Content */}
        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <NewArrivalsFilters />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">
                  Failed to load new arrivals. Please try again.
                </p>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {products.map((product: Product, index: number) => (
                    <NewArrivalsCard
                      key={product._id || product.id || index}
                      product={product}
                      className="animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!data.pagination.hasPrev}
                      className="px-4 py-2 border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.pagination.hasNext}
                      className="px-4 py-2 border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  No new arrivals available at the moment.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newParams = new URLSearchParams();
                    navigate(`/new-arrivals?${newParams.toString()}`);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewArrivals;

