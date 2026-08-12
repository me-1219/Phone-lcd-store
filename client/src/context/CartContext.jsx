import { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as cartService from "../services/cartService";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { product, quantity } | null
  const [bump, setBump] = useState(0); // increments to trigger the cart-icon bounce

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Single entry point for "add to cart" — every component (ProductCard,
  // ProductDetails, Wishlist, etc.) calls this instead of hitting
  // cartService directly, so the toast + icon bounce fire consistently
  // no matter where the add happened.
  const addItem = useCallback(
    async (product, quantity = 1) => {
      const res = await cartService.addToCart(product._id, quantity);
      setCart(res.data);
      setToast({ product, quantity });
      setBump((b) => b + 1);
    },
    []
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = { cart, itemCount, loading, refreshCart, addItem, toast, dismissToast, bump };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};