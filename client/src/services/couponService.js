import api from "./api";

export const previewCoupon = (code) =>
  api.post("/coupons/apply", { code }).then((res) => res.data);

// Admin only
export const getCoupons = () => api.get("/coupons").then((res) => res.data);

export const createCoupon = (data) =>
  api.post("/coupons", data).then((res) => res.data);

export const updateCoupon = (id, data) =>
  api.put(`/coupons/${id}`, data).then((res) => res.data);

export const deleteCoupon = (id) =>
  api.delete(`/coupons/${id}`).then((res) => res.data);
