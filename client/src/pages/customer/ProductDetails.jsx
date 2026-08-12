import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Minus, Plus, Star } from "lucide-react";
import ProductGallery from "../../components/product/ProductGallery";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SEO from "../../components/common/SEO";
import { formatPrice } from "../../utils/formatPrice";
import * as productService from "../../services/productService";
import * as reviewService from "../../services/reviewService";
import * as wishlistService from "../../services/wishlistService";
import { useAuth } from "../../hooks/useAuth";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";

const GRADE_VARIANT = { Original: "success", OEM: "brand", Copy: "neutral", Refurbished: "amber" };

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, reviewsRes] = await Promise.all([
        productService.getProductById(id),
        reviewService.getProductReviews(id),
      ]);
      setProduct(productRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Product not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    setQuantity(1);
  }, [load]);
  useEffect(() => {
    if (isAuthenticated) {
      wishlistService
        .getWishlist()
        .then((res) => setWishlisted(res.data.some((w) => w.product._id === id)))
        .catch(() => {});
    }
  }, [isAuthenticated, id]);

  if (loading) return <Spinner fullPage label="Loading product" />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorMessage title="Product not found" message={error} onRetry={load} />
      </div>
    );
  }

  const {
    name, brand, compatibleModels = [], qualityGrade, screenType,
    description, price, discountPrice, stock, sku, images = [],
    category, rating, numReviews,
  } = product;

  const displayPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const inStock = stock > 0;

  const handleQuantityInput = (value) => {
    if (value === "") {
      setQuantity(1);
      return;
    }

    const nextQty = Number(value);
    if (Number.isNaN(nextQty)) return;

    const safeQty = Math.min(Math.max(1, nextQty), stock);
    setQuantity(safeQty);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate("/login");
    setAddingToCart(true);
    try {
      await addItem(product, quantity);
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      if (wishlisted) {
        await wishlistService.removeFromWishlist(id);
        setWishlisted(false);
      } else {
        await wishlistService.addToWishlist(id);
        setWishlisted(true);
      }
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login");

    setReviewError("");
    setSubmittingReview(true);
    try {
      await reviewService.createReview({ productId: id, ...reviewForm });
      setReviewForm({ rating: 5, comment: "" });
      const reviewsRes = await reviewService.getProductReviews(id);
      setReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };
 
  return (
    <>
      <SEO
        title={product.name}
        description={
          product.description ||
          `${product.name} — ${product.qualityGrade || "Premium"} quality, ${formatPrice(product.discountPrice || product.price)}. In stock at Misgie LCD.`
        }
        image={product.images?.[0]}
        path={`/products/${product._id}`}
        type="product"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-ink-500">
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        {category?.name && (
          <>
            {" / "}
            <Link to={`/products?category=${category.slug || category._id}`} className="hover:text-brand-600">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={images} productName={name} />

        <div>
          <div className="flex items-center gap-2">
            {qualityGrade && <Badge variant={GRADE_VARIANT[qualityGrade] || "neutral"}>{qualityGrade}</Badge>}
            {screenType && <Badge variant="neutral">{screenType}</Badge>}
          </div>

          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-950">{name}</h1>

          <div className="mt-2 flex items-center gap-3 text-sm text-ink-500">
            {brand && <span>Brand: <span className="font-medium text-ink-900">{brand}</span></span>}
            {sku && <span className="font-mono-data">SKU: {sku}</span>}
          </div>

          {numReviews > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-ink-950">{rating.toFixed(1)}</span>
              <span className="text-ink-500">({numReviews} reviews)</span>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-mono-data text-3xl font-semibold text-ink-950">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="font-mono-data text-lg text-ink-300 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {compatibleModels.length > 0 && (
            <p className="mt-3 text-sm text-ink-700">
              <span className="font-medium">Compatible with:</span> {compatibleModels.join(", ")}
            </p>
          )}

          {description && <p className="mt-4 text-sm leading-relaxed text-ink-500">{description}</p>}

          <div className="mt-4">
            {inStock ? (
              <Badge variant="success">In stock ({stock} available)</Badge>
            ) : (
              <Badge variant="danger">Out of stock</Badge>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center text-ink-700 hover:bg-muted disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={stock}
                value={quantity}
                onChange={(e) => handleQuantityInput(e.target.value)}
                className="w-12 border-0 bg-transparent px-1 text-center font-medium text-ink-950 outline-none [appearance:textfield] [-moz-appearance:textfield]"
                aria-label="Quantity"
              />
              <button
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                disabled={quantity >= stock}
                className="flex h-11 w-11 items-center justify-center text-ink-700 hover:bg-muted disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              icon={ShoppingCart}
              disabled={!inStock}
              loading={addingToCart}
              onClick={handleAddToCart}
              className="flex-1"
            >
              Add to Cart
            </Button>

            <Button
              size="lg"
              variant="outline"
              aria-label="Toggle wishlist"
              onClick={handleToggleWishlist}
              icon={() => (
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-danger-500 text-danger-500" : ""}`} />
              )}
            />
          </div>
        </div>
        </div>

        {/* Reviews */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-xl font-semibold text-ink-950">
          Reviews ({reviews.length})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="mt-5 max-w-lg rounded-xl border border-border bg-white p-4">
            <p className="text-sm font-medium text-ink-950">Leave a review</p>
            <p className="mt-0.5 text-xs text-ink-500">
              Only available for products from delivered orders.
            </p>

            {reviewError && (
              <p className="mt-2 text-sm text-danger-500">{reviewError}</p>
            )}

            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-ink-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this part..."
              rows={3}
              className="mt-3 w-full rounded-lg border border-border p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />

            <Button type="submit" size="sm" className="mt-3" loading={submittingReview}>
              Submit Review
            </Button>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-500">No reviews yet for this product.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-border pb-4 last:border-b-0">
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
                  <p className="mt-1.5 text-sm text-ink-500">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </>
  );
};

export default ProductDetails;