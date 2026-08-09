import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ImageOff } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import * as cartService from "../../services/cartService";
import * as wishlistService from "../../services/wishlistService";

const GRADE_VARIANT = {
  Original: "success",
  OEM: "brand",
  Copy: "neutral",
  Refurbished: "amber",
};

const ProductCard = ({ product, isWishlisted = false }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useContext(CartContext);

  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    _id,
    name,
    brand,
    compatibleModels = [],
    qualityGrade,
    price,
    discountPrice,
    images = [],
    stock,
  } = product;

  const inStock = stock > 0;
  const displayPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.addToCart(_id, 1);
      await refreshCart();
    } catch (err) {
      console.error("Failed to add to cart:", err.response?.data?.message || err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setTogglingWishlist(true);
    try {
      if (wishlisted) {
        await wishlistService.removeFromWishlist(_id);
        setWishlisted(false);
      } else {
        await wishlistService.addToWishlist(_id);
        setWishlisted(true);
      }
    } catch (err) {
      console.error("Wishlist toggle failed:", err.response?.data?.message || err.message);
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <Link
      to={`/products/${_id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {images[0] && !imgError ? (
          <img
            src={images[0]}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-ink-300" />
          </div>
        )}

        <button
          onClick={handleToggleWishlist}
          disabled={togglingWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-50"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? "fill-danger-500 text-danger-500" : "text-ink-500"
            }`}
          />
        </button>

        {!inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-ink-950/80 py-1.5 text-center text-xs font-medium text-white">
            Out of stock
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5">
          {qualityGrade && (
            <Badge variant={GRADE_VARIANT[qualityGrade] || "neutral"}>{qualityGrade}</Badge>
          )}
          {brand && <span className="text-xs text-ink-500">{brand}</span>}
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-950">
          {name}
        </h3>

        {compatibleModels.length > 0 && (
          <p className="line-clamp-1 text-xs text-ink-500">
            Fits: {compatibleModels.join(", ")}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="font-mono-data text-base font-semibold text-ink-950">
              {formatPrice(displayPrice)}
            </p>
            {hasDiscount && (
              <p className="font-mono-data text-xs text-ink-300 line-through">
                {formatPrice(price)}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant={inStock ? "primary" : "outline"}
            disabled={!inStock}
            loading={addingToCart}
            onClick={handleAddToCart}
            icon={ShoppingCart}
            aria-label="Add to cart"
          />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;