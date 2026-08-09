import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { CartContext } from "../../context/CartContext";
import * as cartService from "../../services/cartService";

const Cart = () => {
  const { cart, loading, refreshCart } = useContext(CartContext);
  const [error, setError] = useState("");

  const handleUpdateQuantity = async (productId, quantity) => {
    setError("");
    try {
      await cartService.updateCartItem(productId, quantity);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity.");
    }
  };

  const handleRemove = async (productId) => {
    setError("");
    try {
      await cartService.removeCartItem(productId);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove item.");
    }
  };

  if (loading) return <Spinner fullPage label="Loading your cart" />;

  const items = cart.items || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Your Cart</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger-500">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            message="Add some parts to get started."
            action={
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-border bg-white p-4">
            {items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <CartSummary items={items} />
        </div>
      )}
    </div>
  );
};

export default Cart;