import { Link } from "react-router-dom";
import { ChevronRight, Folder } from "lucide-react";

// category: { _id, name, slug, description, image }
const CategoryCard = ({ category }) => {
  const { slug, name, description, image } = category;
  const queryValue = slug || name;

  return (
    <Link
      to={`/products?category=${encodeURIComponent(queryValue)}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <Folder className="h-6 w-6 text-brand-600" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold text-ink-950">
          {name}
        </h3>
        {description && (
          <p className="line-clamp-1 text-xs text-ink-500">{description}</p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
};

export default CategoryCard;