import { useState } from "react";
import { Search, Star, Trash2 } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import * as productService from "../../services/productService";
import * as reviewService from "../../services/reviewService";

// NOTE: the backend only exposes GET /api/reviews/product/:productId — there's
// no "list all reviews across every product" endpoint. So admins search for
// a product first, then manage that product's reviews.
const AdminReviews = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const res = await productService.searchProducts(query.trim());
      setResults(res.data);
    } finally {
      setSearching(false);
    }
  };

  const selectProduct = async (product) => {
    setSelectedProduct(product);
    setResults([]);
    setLoadingReviews(true);
    try {
      const res = await reviewService.getProductReviews(product._id);
      setReviews(res.data);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    setDeletingId(reviewId);
    try {
      await reviewService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-950">Reviews</h1>
      <p className="mt-1 text-sm text-ink-500">
        Search for a product to view and moderate its reviews.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search product by name, brand, or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" loading={searching}>Search</Button>
      </form>

      {results.length > 0 && (
        <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-white">
          {results.map((p) => (
            <button
              key={p._id}
              onClick={() => selectProduct(p)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted"
            >
              <span className="text-ink-950">{p.name}</span>
              <span className="text-xs text-ink-500">{p.brand}</span>
            </button>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5">
          <h2 className="font-display text-base font-semibold text-ink-950">
            Reviews for {selectedProduct.name}
          </h2>

          <div className="mt-4">
            {loadingReviews ? (
              <Spinner label="Loading reviews" />
            ) : reviews.length === 0 ? (
              <EmptyState title="No reviews for this product" />
            ) : (
              <div className="divide-y divide-border">
                {reviews.map((review) => (
                  <div key={review._id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating ? "fill-amber-400 text-amber-400" : "text-ink-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-ink-950">{review.user?.name}</span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-sm text-ink-500">{review.comment}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deletingId === review._id}
                      className="shrink-0 rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-danger-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;