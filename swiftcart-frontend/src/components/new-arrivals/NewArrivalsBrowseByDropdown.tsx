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
  { label: "Electronics", filter: { category: "electronics" } },
  { label: "Fashion", filter: { category: "fashion" } },
  { label: "Home & Kitchen", filter: { category: "home-living" } },
  { label: "Beauty", filter: { category: "beauty" } },
  { label: "Sports & Outdoors", filter: { category: "sports" } },
  { label: "Toys & Games", filter: { category: "toys" } },
  { label: "Computers & Accessories", filter: { category: "computers" } },
  { label: "Pet Supplies", filter: { category: "pet-supplies" } },
  { label: "Health & Household", filter: { category: "health" } },
  { label: "Cell Phones & Accessories", filter: { category: "cell-phones" } },
  { label: "Video Games", filter: { category: "video-games" } },
  { label: "Automotive", filter: { category: "automotive" } },
  { label: "Baby", filter: { category: "baby" } },
  { label: "Books", filter: { category: "books" } },
  { label: "Jewelry", filter: { category: "jewelry" } },
];

export function NewArrivalsBrowseByDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCategoryClick = (filter: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      params.set(key, value);
    });
    navigate(`/new-arrivals?${params.toString()}`);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          Browse by
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-[400px] overflow-y-auto">
        {browseCategories.map((category) => (
          <DropdownMenuItem
            key={category.label}
            onClick={() => handleCategoryClick(category.filter)}
          >
            {category.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

