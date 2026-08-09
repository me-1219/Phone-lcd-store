import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, X } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import { formatPrice } from "../../utils/formatPrice";
import * as couponService from "../../services/couponService";

// items: [{ product: { price, discountPrice }, quantity }]
const CartSummary = ({ items = [], showCheckoutButton = true, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discount;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplying(true);
    setCouponError("");
    try {
      const res = await couponService.previewCoupon(couponCode.trim());
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), ...res.data });
      onCouponApplied?.(couponCode.trim().toUpperCase());
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code.");
      setAppliedCoupon(null);
      onCouponApplied?.(null);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    onCouponApplied?.(null);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="font-display text-base font-semibold text-ink-950">Order Summary</h2>

      {/* Coupon */}
      <form onSubmit={handleApplyCoupon} className="mt-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-brand-700">
              <Tag className="h-4 w-4" />
              <span className="font-medium">{appliedCoupon.code}</span> applied
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              aria-label="Remove coupon"
              className="text-brand-700 hover:text-brand-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              error={couponError}
              className="uppercase"
            />
            <Button type="submit" variant="outline" loading={applying} className="shrink-0">
              Apply
            </Button>
          </div>
        )}
      </form>

      {/* Totals */}
      <div className="mt-5 space-y-2.5 border-t border-border pt-4">
        <div className="flex justify-between text-sm text-ink-500">
          <span>Subtotal</span>
          <span className="font-mono-data text-ink-950">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-success-500">
            <span>Discount</span>
            <span className="font-mono-data">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-ink-500">
          <span>Shipping</span>
          <span className="text-ink-950">Calculated at checkout</span>
        </div>

        <div className="flex justify-between border-t border-border pt-2.5 text-base font-semibold text-ink-950">
          <span>Total</span>
          <span className="font-mono-data">{formatPrice(total)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Link to="/checkout">
          <Button fullWidth size="lg" className="mt-5" disabled={items.length === 0}>
            Proceed to Checkout
          </Button>
        </Link>
      )}
    </div>
  );
};

export default CartSummary;