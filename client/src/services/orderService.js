import api from "./api";

// data: { shippingAddress, paymentMethod, couponCode? }
export const createOrder = (data) =>
  api.post("/orders", data).then((res) => res.data);

export const getMyOrders = () =>
  api.get("/orders/my-orders").then((res) => res.data);

export const getOrderById = (id) =>
  api.get(`/orders/${id}`).then((res) => res.data);

export const cancelOrder = (id) =>
  api.put(`/orders/${id}/cancel`).then((res) => res.data);

// Admin only
export const getAllOrders = (filters = {}) =>
  api.get("/orders", { params: filters }).then((res) => res.data);

export const updateOrderStatus = (id, orderStatus) =>
  api.put(`/orders/${id}/status`, { orderStatus }).then((res) => res.data);
