import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryFilters } from "@/components/category/CategoryFilters";
import { CategorySortDropdown } from "@/components/category/CategorySortDropdown";
import { apiClient } from "@/lib/api";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { departmentCategories } from "@/data/categories";

const CategoryProducts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Sync page state with URL params
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1");
    setPage(pageParam);
  }, [searchParams]);

  // Get category and subcategory from URL params
  const categorySlug = searchParams.get("category");
  const subcategorySlug = searchParams.get("subcategory");

  // Find category and subcategory info
  const category = departmentCategories.find((cat) => cat.slug === categorySlug);
  const subcategory = category?.subcategories.find((sub) => sub.slug === subcategorySlug);

  // Get filter params from URL
  const brands = searchParams.get("brands");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minRating = searchParams.get("minRating");
  const sort = searchParams.get("sort") || "newest";

  // Fetch products from API - filter by subcategory if provided, otherwise by category
  const { data, isLoading, error } = useQuery({
    queryKey: ["categoryProducts", subcategorySlug || categorySlug, page, brands, minPrice, maxPrice, minRating, sort],
    queryFn: async () => {
      // Use subcategory slug for filtering if available, otherwise use category slug
      const filterCategory = subcategorySlug || categorySlug;
      
      const response = await apiClient.getProducts({
        page,
        limit: 20,
        category: filterCategory || undefined,
        brands: brands || undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sort: sort as any,
      });
      
      return {
        products: response.data?.products || [],
        pagination: response.data?.pagination,
      };
    },
    enabled: !!(subcategorySlug || categorySlug), // Only fetch if we have a category/subcategory
  });

  // Fetch all products for the category to extract all available brands
  const { data: allProductsData } = useQuery({
    queryKey: ["categoryProductsAll", subcategorySlug || categorySlug],
    queryFn: async () => {
      // Use subcategory slug for filtering if available, otherwise use category slug
      const filterCategory = subcategorySlug || categorySlug;
      
      const response = await apiClient.getProducts({
        page: 1,
        limit: 100, // Fetch more products to get a better brand list
        category: filterCategory || undefined,
        sort: "newest" as any,
      });
      
      return response.data?.products || [];
    },
    enabled: !!(subcategorySlug || categorySlug), // Only fetch if we have a category/subcategory
  });

  const products = data?.products || [];
  const allProductsForBrands = allProductsData || [];

  // Extract unique brands from products
  // Products are generated from enhancedProductTemplates.ts where brand is the first part of the name
  // Handle multi-word brands by checking longest matches first
  const extractBrandsFromProducts = (products: Product[]): string[] => {
    const brandSet = new Set<string>();
    
    // All brands from enhancedProductTemplates.ts - sorted by length (longest first) to match multi-word brands
    const brandPatterns = [
      "Fire Mountain Gems", "We R Memory Keepers", "Dr. Brown's", "Philips Avent", "OXO Tot",
      "Instant Pot", "KitchenAid", "Michael Kors", "Calvin Klein", "The North Face",
      "Winsor & Newton", "Mod Podge", "PlayStation", "Fisher-Price", "BabyBjörn",
      "Royal Canin", "Levi's", "Elmer's", "Meguiar's", "Oral-B", "Lion Brand",
      "Red Heart", "Riley Blake", "Michael Miller", "American Crafts", "Tim Holtz",
      "EK Success", "Gutermann", "Sally Hansen", "Lululemon", "Anthropologie",
      "Samsonite", "Brooklinen", "Spigen", "Belkin", "Garmin", "Crayola", "Sizzix",
      "Apple", "Samsung", "Sony", "Nike", "Adidas", "Logitech", "Canon", "Dell",
      "Lenovo", "Microsoft", "Philips", "Bose", "JBL", "Anker", "Dyson", "Shark",
      "Amazon", "Google", "Xiaomi", "OnePlus", "Razer", "Corsair", "ASUS", "Acer",
      "Toshiba", "Panasonic", "Sharp", "Vizio", "Xbox", "Nintendo", "Fitbit",
      "Pandora", "Citizen", "Timex", "Fossil", "Seiko", "Casio", "Maybelline",
      "CeraVe", "Olaplex", "IKEA", "Purina", "DeWalt", "LEGO", "Ravensburger",
      "Steam", "Nest", "Ecobee", "Honeywell", "Emerson", "Wyze", "Beadalon",
      "Gorilla", "Darice", "Swarovski", "Comotomo", "Graco", "4moms", "OPI",
      "Essie", "Gelish", "CND", "Joann", "Moda", "Kona", "Caron", "Bernat",
      "Clover", "Cricut", "Brother", "Singer", "Dritz", "Fiskars", "Crest",
      "Listerine", "Waterpik", "Coleman", "HP", "LG"
    ];

    products.forEach((product) => {
      let brandFound = false;
      
      // Try to match known brand patterns (longest first for multi-word brands)
      for (const brand of brandPatterns) {
        if (product.name.startsWith(brand)) {
          brandSet.add(brand);
          brandFound = true;
          break;
        }
      }
      
      // Fallback: extract first word if no brand pattern matches
      if (!brandFound) {
        const firstWord = product.name.split(" ")[0];
        if (firstWord && firstWord.length > 1) {
          brandSet.add(firstWord);
        }
      }
    });

    return Array.from(brandSet).sort();
  };

  // Extract brands from all products in the category (not just current page)
  const availableBrands = extractBrandsFromProducts(allProductsForBrands);

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: "Home", path: "/" },
    ...(category ? [{ label: category.name, path: `/category?category=${category.slug}` }] : []),
    ...(subcategory ? [{ label: subcategory.name, path: location.pathname + location.search }] : []),
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="container-wide py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-primary">
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {subcategory ? subcategory.name : category ? category.name : "Products"}
          </h1>
          {!isLoading && data?.pagination && (
            <p className="text-muted-foreground">
              {data.pagination.total > 0
                ? `Showing ${products.length} of ${data.pagination.total} products`
                : "No products found"}
            </p>
          )}
        </div>

        {/* Sort and Filter Controls */}
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
                <CategoryFilters availableBrands={availableBrands} />
              </SheetContent>
            </Sheet>
          </div>
          
          <CategorySortDropdown />
        </div>

        {/* Two-Column Layout: Filters + Content */}
        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <CategoryFilters availableBrands={availableBrands} />
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
                  Failed to load products. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && products.length > 0 && (
              <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {products.map((product: Product, index: number) => (
                    <ProductCard
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
                      onClick={() => {
                        const newPage = Math.max(1, page - 1);
                        setPage(newPage);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("page", newPage.toString());
                        navigate(`?${newParams.toString()}`);
                      }}
                      disabled={!data.pagination.hasPrev}
                      className="px-4 py-2 border border-border rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("page", newPage.toString());
                        navigate(`?${newParams.toString()}`);
                      }}
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
                  No products found in this category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Browse All Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CategoryProducts;

