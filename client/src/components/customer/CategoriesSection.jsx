import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../category/CategoryCard";
import Spinner from "../common/Spinner";
import * as categoryService from "../../services/categoryService";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => setCategories(res.data.slice(0, 6)))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <section className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Find the exact part type you need.
            </p>
          </div>
          <Link
            to="/categories"
            className="hidden text-sm font-medium text-brand-600 hover:underline sm:block"
          >
            View all
          </Link>
        </div>

        <div className="mt-6">
          {categoriesLoading ? (
            <Spinner label="Loading categories" />
          ) : categories.length === 0 ? (
            <p className="text-sm text-ink-500">Categories will appear here soon.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>

        <Link
          to="/categories"
          className="mt-4 block text-center text-sm font-medium text-brand-600 hover:underline sm:hidden"
        >
          View all categories
        </Link>
      </div>
    </section>
  );
};

export default CategoriesSection;
