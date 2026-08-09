import api from "./api";

// data: { productId, quantityChange, type, reason }
export const adjustStock = (data) =>
  api.post("/inventory/adjust", data).then((res) => res.data);

export const getStockMovements = (filters = {}) =>
  api.get("/inventory/movements", { params: filters }).then((res) => res.data);

export const getLowStockProducts = () =>
  api.get("/inventory/low-stock").then((res) => res.data);
