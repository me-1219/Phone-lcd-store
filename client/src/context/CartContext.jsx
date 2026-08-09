import { createContext, useState, useEffect, useCallback, useContext } from "react";
import * as cartService from "../services/cartService";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

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

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = { cart, itemCount, loading, refreshCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
