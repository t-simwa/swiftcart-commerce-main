import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CategoryOfferCardProps {
  id: string;
  title: string;
  image: string;
  link: string;
  className?: string;
}

export function CategoryOfferCard({
  id,
  title,
  image,
  link,
  className,
}: CategoryOfferCardProps) {
  return (
    <div
      className={cn(
        "category-offer-card bg-background rounded border border-border/70 shadow-sm hover:shadow-md transition-shadow overflow-hidden",
        "h-[178px] w-[137px]",
        "sm:h-[222px] sm:w-[182px]",
        "md:h-[290px] md:w-[242px]",
        className
      )}
    >
      <Link
        to={link}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-offset-[-1px]"
      >
        <div className="h-full flex flex-col">
          {/* Image */}
          <div className="relative h-[126px] sm:h-[168px] md:h-[224px] w-full overflow-hidden bg-secondary/30">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Title */}
          <div
            className="px-2 py-2 sm:px-3 sm:py-2.5 h-[50px] sm:h-[52px] md:h-[64px] flex items-center border-t border-border/70"
            style={{
              boxShadow: "0 1px 0 #c2ccd6",
            }}
          >
            <h3
              className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 leading-[1.3em] max-h-[2.6em] overflow-hidden text-ellipsis"
              style={{
                maxHeight: "2.6em",
                lineHeight: "1.3em",
              }}
            >
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
}

