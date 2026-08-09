import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "../../components/product/ProductGrid";
import ProductFilter from "../../components/product/ProductFilter";
import ProductSearch from "../../components/product/ProductSearch";
import Button from "../../components/common/Button";
import { SORT_OPTIONS } from "../../utils/constants";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as wishlistService from "../../services/wishlistService";
import { useAuth } from "../../hooks/useAuth";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters derive directly from the URL so links/back-button/refresh all work.
  const filters = Object.fromEntries(searchParams.entries());

  // Load categories once, resolve a ?category=slug in the URL to the
  // actual ObjectId the backend filter expects.
  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistService
        .getWishlist()
        .then((res) => setWishlistedIds(res.data.map((w) => w.product._id)))
        .catch(() => setWishlistedIds([]));
    }
  }, [isAuthenticated]);

  const resolveCategoryFilter = useCallback(() => {
    if (!filters.category) return undefined;
    const match = categories.find(
      (c) => c.slug === filters.category || c._id === filters.category
    );
    return match?._id || filters.category;
  }, [filters.category, categories]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, category: resolveCategoryFilter() };
      const res = await productService.getProducts(params);
      setProducts(res.data);
      setPagination({ page: res.page, pages: res.pages, total: res.total });
      setBrands((prev) => {
        const found = res.data.map((p) => p.brand).filter(Boolean);
        return Array.from(new Set([...prev, ...found]));
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [filters, resolveCategoryFilter]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, categories.length]);

  const updateFilters = (next) => {
    const params = { ...next };
    delete params.page; // reset pagination on filter change
    setSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    );
  };

  const goToPage = (page) => {
    setSearchParams({ ...filters, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-950">Products</h1>
          <p className="text-sm text-ink-500">{pagination.total} results</p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 sm:w-72">
            <ProductSearch
              value={filters.q || ""}
              onSearch={(q) => updateFilters({ ...filters, q })}
            />
          </div>
          <select
            value={filters.sort || ""}
            onChange={(e) => updateFilters({ ...filters, sort: e.target.value })}
            className="h-11 shrink-0 rounded-lg border border-border bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Sort by</option>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            className="shrink-0 lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden rounded-xl border border-border bg-white p-4 lg:block lg:h-fit">
          <ProductFilter
            filters={filters}
            onChange={updateFilters}
            categories={categories}
            brands={brands}
          />
        </aside>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-ink-950/50"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-4">
              <ProductFilter
                filters={filters}
                onChange={updateFilters}
                categories={categories}
                brands={brands}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        <div>
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onRetry={loadProducts}
            wishlistedIds={wishlistedIds}
          />

          {!loading && !error && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
              />
              <span className="text-sm text-ink-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                className="flex-row-reverse"
                disabled={pagination.page >= pagination.pages}
                onClick={() => goToPage(pagination.page + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;