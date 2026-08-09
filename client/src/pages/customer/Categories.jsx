import { useState, useEffect } from "react";
import CategoryCard from "../../components/category/CategoryCard";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import * as categoryService from "../../services/categoryService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Shop by Category</h1>
      <p className="mt-1 text-sm text-ink-500">
        Browse parts by type — screens, batteries, cables, and more.
      </p>

      <div className="mt-6">
        {loading ? (
          <Spinner fullPage label="Loading categories" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" message="Check back soon." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;