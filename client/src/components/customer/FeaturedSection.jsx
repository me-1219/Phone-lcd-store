import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../product/ProductGrid";
import * as productService from "../../services/productService";
import * as wishlistService from "../../services/wishlistService";
import { useAuth } from "../../hooks/useAuth";

const FeaturedSection = () => {
  const { isAuthenticated } = useAuth();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const loadFeatured = async (reset = true) => {
    if (reset) {
      setProductsLoading(true);
      setProductsError(null);
    }

    try {
      const res = await productService.getProducts({ featured: true, limit: 8 });
      setFeaturedProducts(res.data);
    } catch (err) {
      setProductsError(err.response?.data?.message || "Failed to load featured products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      await loadFeatured(false);
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistService
        .getWishlist()
        .then((res) => setWishlistedIds(res.data.map((w) => w.product._id)))
        .catch(() => setWishlistedIds([]));
    }
  }, [isAuthenticated]);

  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-950">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Popular parts our customers order most.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden text-sm font-medium text-brand-600 hover:underline sm:block"
          >
            View all
          </Link>
        </div>

        <div className="mt-6">
          <ProductGrid
            products={featuredProducts}
            loading={productsLoading}
            error={productsError}
            onRetry={loadFeatured}
            wishlistedIds={wishlistedIds}
          />
        </div>

        {!productsLoading && !productsError && featuredProducts.length > 0 && (
          <Link
            to="/products"
            className="mt-6 block text-center text-sm font-medium text-brand-600 hover:underline sm:hidden"
          >
            View all products
          </Link>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
