import { Link } from "react-router-dom";

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  link: string;
}

interface AmazonCategorySectionProps {
  title: string;
  categories: CategoryItem[];
  seeMoreLink?: string;
  seeMoreText?: string;
  columns?: 2 | 4;
  subtitle?: string;
}

export function AmazonCategorySection({
  title,
  categories,
  seeMoreLink,
  seeMoreText = "See more",
  columns = 2,
  subtitle,
}: AmazonCategorySectionProps) {
  const gridCols = columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4";

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container-wide">
        <div className="flex items-end justify-between mb-4 px-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-base text-gray-600 font-normal">{subtitle}</p>
            )}
          </div>
          {seeMoreLink && (
            <Link
              to={seeMoreLink}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
            >
              {seeMoreText}
            </Link>
          )}
        </div>

        <div className={`grid ${gridCols} gap-3 md:gap-4`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group bg-background border border-border rounded-md overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative overflow-hidden bg-secondary/30">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground line-clamp-2">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

