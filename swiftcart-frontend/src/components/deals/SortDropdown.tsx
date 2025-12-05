import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  className?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "discount-desc", label: "Discount: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function SortDropdown({ className }: SortDropdownProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "newest") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }
    newParams.set("page", "1"); // Reset to first page
    navigate(`/deals?${newParams.toString()}`);
  };

  return (
    <div className={className}>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

