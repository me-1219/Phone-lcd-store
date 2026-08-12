import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ImageOff } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

// item: { product: { _id, name, images, price, discountPrice, stock }, quantity }
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { product, quantity } = item;
  const unitPrice = product.discountPrice || product.price;
  const lineTotal = unitPrice * quantity;
  const atMaxStock = quantity >= product.stock;

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1 || newQty > product.stock) return;

    setUpdating(true);
    try {
      await onUpdateQuantity(product._id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  const handleManualQuantityChange = (e) => {
    const nextValue = Number(e.target.value);
    if (Number.isNaN(nextValue)) return;

    const safeQty = Math.min(Math.max(1, nextValue), product.stock);
    if (safeQty !== quantity) {
      handleQuantityChange(safeQty);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      className={`flex gap-4 border-b border-border py-4 last:border-b-0 ${
        removing ? "opacity-50" : ""
      }`}
    >
      <Link
        to={`/products/${product._id}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
      >
        {product.images?.[0] && !imgError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-5 w-5 text-ink-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${product._id}`}
            className="line-clamp-2 text-sm font-medium text-ink-950 hover:text-brand-600"
          >
            {product.name}
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            aria-label="Remove item"
            className="shrink-0 rounded-lg p-1.5 text-ink-300 hover:bg-red-50 hover:text-danger-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {product.stock === 0 && (
          <p className="text-xs font-medium text-danger-500">No longer in stock</p>
        )}
        {atMaxStock && product.stock > 0 && (
          <p className="text-xs text-amber-600">Max available quantity reached</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={updating || quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-ink-700 hover:bg-muted disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={updating ? quantity : quantity}
              onChange={handleManualQuantityChange}
              disabled={updating}
              className="w-10 border-0 bg-transparent px-1 text-center text-sm font-medium text-ink-950 outline-none [appearance:textfield] [-moz-appearance:textfield]"
              aria-label="Set quantity"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating || atMaxStock}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-ink-700 hover:bg-muted disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="font-mono-data text-sm font-semibold text-ink-950">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;