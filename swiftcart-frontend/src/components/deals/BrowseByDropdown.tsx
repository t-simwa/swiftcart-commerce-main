import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Grid3x3 } from "lucide-react";

const browseCategories = [
  { label: "Lightning deals", filter: { dealType: "lightning" } },
  { label: "Customers' Most-Loved", filter: { minRating: 4 } },
  { label: "Holiday", filter: { category: "holiday" } },
  { label: "Outlet", filter: { tab: "outlet" } },
  { label: "Beauty", filter: { category: "beauty" } },
  { label: "Fashion", filter: { category: "fashion" } },
  { label: "Home", filter: { category: "home" } },
  { label: "Toys & Games", filter: { category: "toys" } },
  { label: "Electronics", filter: { category: "electronics" } },
  { label: "Devices", filter: { category: "devices" } },
  { label: "Kitchen", filter: { category: "kitchen" } },
  { label: "Everyday Essentials", filter: { category: "essentials" } },
  { label: "Computers & Accessories", filter: { category: "computers" } },
  { label: "Pet Supplies", filter: { category: "pets" } },
  { label: "Furniture", filter: { category: "furniture" } },
  { label: "TVs & Accessories", filter: { category: "tvs" } },
  { label: "Home DIY & Appliances", filter: { category: "diy" } },
  { label: "Sports & Outdoors", filter: { category: "sports" } },
  { label: "Grocery", filter: { category: "grocery" } },
  { label: "Health & Household", filter: { category: "health" } },
  { label: "Cell Phones & Accessories", filter: { category: "phones" } },
  { label: "Small Business", filter: { category: "business" } },
  { label: "Video Games", filter: { category: "games" } },
  { label: "Lawn & Garden", filter: { category: "garden" } },
  { label: "Automotive", filter: { category: "automotive" } },
  { label: "Camera & Photo", filter: { category: "camera" } },
  { label: "Books", filter: { category: "books" } },
  { label: "Jewelry", filter: { category: "jewelry" } },
  { label: "Baby", filter: { category: "baby" } },
  { label: "Office Supplies", filter: { category: "office" } },
  { label: "Musical Instruments", filter: { category: "music" } },
  { label: "Coupons", filter: { tab: "coupons" } },
];

export function BrowseByDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCategorySelect = (filter: Record<string, string>) => {
    const params = new URLSearchParams();
    
    if (filter.tab) {
      params.set("tab", filter.tab);
    } else {
      Object.entries(filter).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    
    params.set("page", "1");
    navigate(`/deals?${params.toString()}`);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Browse by
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px] max-h-[400px] overflow-y-auto">
        {browseCategories.map((category) => (
          <DropdownMenuItem
            key={category.label}
            onClick={() => handleCategorySelect(category.filter)}
            className="cursor-pointer"
          >
            {category.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

