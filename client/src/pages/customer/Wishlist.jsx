import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductGrid from "../../components/product/ProductGrid";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import * as wishlistService from "../../services/wishlistService";

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await wishlistService.getWishlist();
      // Normalize response: API may return an array or an object wrapping the array.
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setItems(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          icon={Heart}
          title="Sign in to view your wishlist"
          message="Your saved items appear here after you add them."
          action={
            <Link to="/login">
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return <Spinner fullPage label="Loading your wishlist" />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage
          title="Unable to load wishlist"
          message={error}
          onRetry={loadWishlist}
        />
      </div>
    );
  }

  const products = items.map((item) => item.product).filter(Boolean);
  const wishlistedIds = products.map((product) => product._id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          Your Wishlist
        </h1>
        <p className="text-sm text-ink-500">
          Saved products you want to come back to later.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            message="Add a product to your wishlist to keep it here."
            action={
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ProductGrid products={products} wishlistedIds={wishlistedIds} />
      )}
    </div>
  );
};

export default Wishlist;
