import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFiltersProps {
  className?: string;
  availableBrands?: string[];
}

export function CategoryFilters({ className, availableBrands = [] }: CategoryFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brands: true,
    price: true,
    reviews: true,
  });
  
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  const selectedBrands = searchParams.get("brands")?.split(",") || [];
  const minRating = searchParams.get("minRating") || "0";
  const minPrice = parseInt(searchParams.get("minPrice") || "0");
  const maxPrice = parseInt(searchParams.get("maxPrice") || "1000000");

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandToggle = (brand: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentBrands = selectedBrands;
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter((b) => b !== brand)
      : [...currentBrands, brand];

    if (newBrands.length === 0) {
      newParams.delete("brands");
    } else {
      newParams.set("brands", newBrands.join(","));
    }
    newParams.set("page", "1");
    navigate(`?${newParams.toString()}`);
  };

  const handleRatingChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "0") {
      newParams.delete("minRating");
    } else {
      newParams.set("minRating", value);
    }
    newParams.set("page", "1");
    navigate(`?${newParams.toString()}`);
  };

  const handlePriceChange = (values: number[]) => {
    const newParams = new URLSearchParams(searchParams);
    const [min, max] = values;
    
    if (min === 0) {
      newParams.delete("minPrice");
    } else {
      newParams.set("minPrice", min.toString());
    }
    
    if (max === 1000000) {
      newParams.delete("maxPrice");
    } else {
      newParams.set("maxPrice", max.toString());
    }
    
    newParams.set("page", "1");
    navigate(`?${newParams.toString()}`);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    // Keep category and subcategory, remove other filters
    newParams.delete("brands");
    newParams.delete("minRating");
    newParams.delete("minPrice");
    newParams.delete("maxPrice");
    newParams.set("page", "1");
    navigate(`?${newParams.toString()}`);
  };

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:mb-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full mb-3 text-sm font-medium text-foreground"
        >
          <span>{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isExpanded && <div className="space-y-2">{children}</div>}
      </div>
    );
  };

  const hasActiveFilters = selectedBrands.length > 0 || minRating !== "0" || minPrice > 0 || maxPrice < 1000000;

  return (
    <aside
      className={cn(
        "w-full lg:w-[250px] bg-background border-r border-border pr-4 pb-6",
        className
      )}
    >
      <div className="sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Brands Filter */}
        {availableBrands.length > 0 && (
          <FilterSection title="Brands" sectionKey="brands">
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {availableBrands.slice(0, showMoreBrands ? availableBrands.length : 10).map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
              {availableBrands.length > 10 && !showMoreBrands && (
                <button
                  onClick={() => setShowMoreBrands(true)}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  See more
                </button>
              )}
              {availableBrands.length > 10 && showMoreBrands && (
                <button
                  onClick={() => setShowMoreBrands(false)}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  See less
                </button>
              )}
            </div>
          </FilterSection>
        )}

        {/* Customer Reviews Filter */}
        <FilterSection title="Customer Reviews" sectionKey="reviews">
          <RadioGroup
            value={minRating}
            onValueChange={handleRatingChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="rating-all" />
              <Label htmlFor="rating-all" className="text-sm font-normal cursor-pointer">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="rating-4" />
              <Label htmlFor="rating-4" className="text-sm font-normal cursor-pointer">
                4 & up
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="rating-3" />
              <Label htmlFor="rating-3" className="text-sm font-normal cursor-pointer">
                3 & up
              </Label>
            </div>
          </RadioGroup>
        </FilterSection>

        {/* Price Filter */}
        <FilterSection title="Price" sectionKey="price">
          <div className="px-1">
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
              <span>KES {minPrice.toLocaleString()}</span>
              <span>KES {maxPrice.toLocaleString()}</span>
            </div>
            <Slider
              value={[minPrice, maxPrice]}
              onValueChange={handlePriceChange}
              min={0}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-1">
              KES {minPrice.toLocaleString()} – KES {maxPrice.toLocaleString()}
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

