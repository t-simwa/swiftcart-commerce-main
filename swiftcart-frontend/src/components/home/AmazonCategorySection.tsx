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
}

export function AmazonCategorySection({
  title,
  categories,
  seeMoreLink,
  seeMoreText = "See more",
  columns = 2,
}: AmazonCategorySectionProps) {
  const gridCols = columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4";

  return (
    <section className="bg-background py-4 md:py-6">
      <div className="container-wide">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-medium text-foreground">{title}</h2>
          {seeMoreLink && (
            <Link
              to={seeMoreLink}
              className="text-sm text-primary hover:underline hover:text-primary/80"
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

