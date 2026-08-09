import api from "./api";

export const getCart = () => api.get("/cart").then((res) => res.data);

export const addToCart = (productId, quantity = 1) =>
  api.post("/cart", { productId, quantity }).then((res) => res.data);

export const updateCartItem = (productId, quantity) =>
  api.put(`/cart/${productId}`, { quantity }).then((res) => res.data);

export const removeCartItem = (productId) =>
  api.delete(`/cart/${productId}`).then((res) => res.data);

export const clearCart = () => api.delete("/cart").then((res) => res.data);
