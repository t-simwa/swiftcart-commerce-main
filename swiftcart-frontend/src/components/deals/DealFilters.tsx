import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { departmentCategories } from "@/data/categories";

interface DealFiltersProps {
  className?: string;
}

// Use the same departments as the "All" menu, sorted alphabetically
const departments = [
  "All",
  ...departmentCategories
    .map((category) => category.name)
    .sort((a, b) => a.localeCompare(b)),
];

// Common brands (would be fetched from API in production)
const brands = [
  "Chef Preserve",
  "Shark",
  "Ninja",
  "Philips",
  "JBL",
  "Bissell",
  "Instant Pot",
  "Trendy Queen",
];

// More brands (for "See more" expansion)
const moreBrands = [
  "Sony",
  "Samsung",
  "Apple",
  "LG",
  "Dyson",
  "KitchenAid",
  "Breville",
  "Cuisinart",
];

export function DealFilters({ className }: DealFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    department: true,
    brands: true,
    reviews: true,
    discount: true,
    premium: true,
  });
  
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [showMoreDepartments, setShowMoreDepartments] = useState(false);

  // Map category slug from URL to category name for display
  const categorySlug = searchParams.get("category");
  const selectedDepartment = categorySlug
    ? departmentCategories.find((cat) => cat.slug === categorySlug)?.name || categorySlug
    : "All";
  const selectedBrands = searchParams.get("brands")?.split(",") || [];
  const minRating = searchParams.get("minRating") || "0";
  const minDiscount = parseInt(searchParams.get("minDiscount") || "0");
  const maxDiscount = parseInt(searchParams.get("maxDiscount") || "100");
  const premiumExclusive = searchParams.get("premiumExclusive") === "true";

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDepartmentChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "All") {
      newParams.delete("category");
    } else {
      // Find the category slug from the name
      const category = departmentCategories.find((cat) => cat.name === value);
      newParams.set("category", category?.slug || value.toLowerCase().replace(/\s+/g, "-"));
    }
    newParams.set("page", "1"); // Reset to first page
    navigate(`/deals?${newParams.toString()}`);
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
    navigate(`/deals?${newParams.toString()}`);
  };

  const handleRatingChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "0") {
      newParams.delete("minRating");
    } else {
      newParams.set("minRating", value);
    }
    newParams.set("page", "1");
    navigate(`/deals?${newParams.toString()}`);
  };

  const handleDiscountChange = (values: number[]) => {
    const newParams = new URLSearchParams(searchParams);
    const [min, max] = values;
    
    if (min === 0) {
      newParams.delete("minDiscount");
    } else {
      newParams.set("minDiscount", min.toString());
    }
    
    if (max === 100) {
      newParams.delete("maxDiscount");
    } else {
      newParams.set("maxDiscount", max.toString());
    }
    
    newParams.set("page", "1");
    navigate(`/deals?${newParams.toString()}`);
  };

  const handlePremiumToggle = (checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set("premiumExclusive", "true");
    } else {
      newParams.delete("premiumExclusive");
    }
    newParams.set("page", "1");
    navigate(`/deals?${newParams.toString()}`);
  };

  const clearFilters = () => {
    navigate("/deals");
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

  return (
    <aside
      className={cn(
        "w-full lg:w-[250px] bg-background border-r border-border pr-4 pb-6",
        className
      )}
    >
      <div className="sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Filters</h2>
          {(selectedDepartment !== "All" ||
            selectedBrands.length > 0 ||
            minRating !== "0" ||
            minDiscount > 0 ||
            maxDiscount < 100 ||
            premiumExclusive) && (
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

        {/* Department Filter */}
        <FilterSection title="Department" sectionKey="department">
          <RadioGroup
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
            className="space-y-2"
          >
            {departments.slice(0, showMoreDepartments ? departments.length : 5).map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <RadioGroupItem value={dept} id={`dept-${dept}`} />
                <Label
                  htmlFor={`dept-${dept}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {dept}
                </Label>
              </div>
            ))}
            {departments.length > 5 && (
              <button
                onClick={() => setShowMoreDepartments(!showMoreDepartments)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {showMoreDepartments ? "See less" : "See more"}
              </button>
            )}
          </RadioGroup>
        </FilterSection>

        {/* Brands Filter */}
        <FilterSection title="Brands" sectionKey="brands">
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {[...brands, ...(showMoreBrands ? moreBrands : [])].map((brand) => (
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
            {!showMoreBrands && (
              <button
                onClick={() => setShowMoreBrands(true)}
                className="text-xs text-primary hover:underline mt-1"
              >
                See more
              </button>
            )}
            {showMoreBrands && (
              <button
                onClick={() => setShowMoreBrands(false)}
                className="text-xs text-primary hover:underline mt-1"
              >
                See less
              </button>
            )}
          </div>
        </FilterSection>

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
          </RadioGroup>
        </FilterSection>

        {/* Discount Filter */}
        <FilterSection title="Discount" sectionKey="discount">
          <div className="px-1">
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
              <span>{minDiscount}%</span>
              <span>{maxDiscount}%</span>
            </div>
            <Slider
              value={[minDiscount, maxDiscount]}
              onValueChange={handleDiscountChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {minDiscount}% – {maxDiscount}%
            </div>
          </div>
        </FilterSection>

        {/* Premium Programs Filter */}
        <FilterSection title="Premium Programs" sectionKey="premium">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium-exclusive"
                checked={premiumExclusive}
                onCheckedChange={handlePremiumToggle}
              />
              <Label
                htmlFor="premium-exclusive"
                className="text-sm font-normal cursor-pointer"
              >
                SwiftCart Plus Exclusive
              </Label>
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

