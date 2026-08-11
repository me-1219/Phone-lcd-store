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

export const verifyPayment = (id) =>
  api.put(`/orders/${id}/verify-payment`).then((res) => res.data);

export const rejectPayment = (id, reason) =>
  api.put(`/orders/${id}/reject-payment`, { reason }).then((res) => res.data);

export const downloadInvoice = async (id) => {
  const res = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `invoice-${id.slice(-8).toUpperCase()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};