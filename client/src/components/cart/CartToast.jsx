import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, X, ImageOff } from "lucide-react";
import { CartContext } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";

const AUTO_DISMISS_MS = 4000;

const CartToast = () => {
  const { toast, dismissToast } = useContext(CartContext);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setImgError(false);
    const timer = setTimeout(dismissToast, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const { product, quantity } = toast;
  const price = product.discountPrice || product.price;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] animate-[toast-in_0.25s_ease-out] rounded-xl border border-border bg-white p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-success-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-950">Added to cart</p>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {product.images?.[0] && !imgError ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff className="h-4 w-4 text-ink-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm text-ink-900">{product.name}</p>
              <p className="text-xs text-ink-500">
                Qty {quantity} · <span className="font-mono-data">{formatPrice(price)}</span>
              </p>
            </div>
          </div>

          <Link
            to="/cart"
            onClick={dismissToast}
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            View Cart →
          </Link>
        </div>

        <button
          onClick={dismissToast}
          aria-label="Dismiss"
          className="shrink-0 rounded-lg p-1 text-ink-300 hover:bg-muted hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CartToast;