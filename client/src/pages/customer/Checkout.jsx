
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import CartSummary from "../../components/cart/CartSummary";
import Spinner from "../../components/common/Spinner";
import * as orderService from "../../services/orderService";
import { TELEBIRR_MERCHANT_NUMBER } from "../../utils/constants";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "telebirr", label: "Telebirr" },
];

const Checkout = () => {
  const { cart, loading, refreshCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    region: "",
    country: "Ethiopia",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [telebirrTransactionNumber, setTelebirrTransactionNumber] =
    useState("");
  const [couponCode, setCouponCode] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <Spinner />;
  }

  const items = cart.items || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!address.street || !address.city) {
      setError("Street and city are required.");
      return;
    }

    if (
      paymentMethod === "telebirr" &&
      !telebirrTransactionNumber.trim()
    ) {
      setError(
        "Enter your Telebirr transaction number after completing payment."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await orderService.createOrder({
        shippingAddress: address,
        paymentMethod,
        ...(couponCode ? { couponCode } : {}),
        ...(paymentMethod === "telebirr"
          ? { telebirrTransactionNumber: telebirrTransactionNumber.trim() }
          : {}),
      });

      await refreshCart();

      navigate(`/orders/${res.data._id}`, {
        state: { justPlaced: true },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not place order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <h2 className="font-display text-xl font-semibold text-ink-950">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-ink-600">
          Add items before checking out.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-950">
        Checkout
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-white p-5"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
              {error}
            </div>
          )}

          <h2 className="font-display text-base font-semibold text-ink-950">
            Shipping Address
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Street"
              value={address.street}
              onChange={(e) =>
                setAddress({
                  ...address,
                  street: e.target.value,
                })
              }
              className="sm:col-span-2"
            />

            <Input
              label="City"
              value={address.city}
              onChange={(e) =>
                setAddress({
                  ...address,
                  city: e.target.value,
                })
              }
            />

            <Input
              label="Region"
              value={address.region}
              onChange={(e) =>
                setAddress({
                  ...address,
                  region: e.target.value,
                })
              }
            />

            <Input
              label="Country"
              value={address.country}
              onChange={(e) =>
                setAddress({
                  ...address,
                  country: e.target.value,
                })
              }
              className="sm:col-span-2"
            />
          </div>

          <h2 className="mt-6 font-display text-base font-semibold text-ink-950">
            Payment Method
          </h2>

          <div className="mt-3 flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm has-checked:border-brand-500 has-checked:bg-brand-50"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={() => setPaymentMethod(method.value)}
                  className="h-4 w-4 accent-brand-600"
                />

                {method.label}
              </label>
            ))}
          </div>

          {/* Telebirr Payment Details */}
          {paymentMethod === "telebirr" && (
            <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm text-ink-900">
                Send payment to{" "}
                <span className="font-mono-data font-semibold">
                  {TELEBIRR_MERCHANT_NUMBER}
                </span>{" "}
                via your Telebirr app, then enter the transaction number
                below.
              </p>

              <Input
                label="Telebirr transaction number"
                className="mt-3"
                value={telebirrTransactionNumber}
                onChange={(e) =>
                  setTelebirrTransactionNumber(e.target.value)
                }
                placeholder="e.g. DHA0oQR422"
              />
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="mt-6"
            loading={submitting}
          >
            Place Order
          </Button>
        </form>

        <CartSummary
          items={items}
          showCheckoutButton={false}
          onCouponApplied={setCouponCode}
        />
      </div>
    </div>
  );
};

export default Checkout;
