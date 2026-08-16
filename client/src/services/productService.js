import api from "./api";

// filters: { category, brand, qualityGrade, compatibleModel,
//            minPrice, maxPrice, featured, sort, page, limit }
export const getProducts = (filters = {}) =>
  api.get("/products", { params: filters }).then((res) => res.data);

export const searchProducts = (q) =>
  api.get("/products/search", { params: { q } }).then((res) => res.data);

export const getProductsByCategory = (categoryId, filters = {}) =>
  api
    .get(`/products/category/${categoryId}`, { params: filters })
    .then((res) => res.data);

export const getProductById = (id) =>
  api.get(`/products/${id}`).then((res) => res.data);

export const createProduct = (data) =>
  api.post("/products", data).then((res) => res.data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then((res) => res.data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then((res) => res.data);

export const bulkCreateProducts = (products) => {
  const payload = Array.isArray(products) ? { products } : products;
  return api.post("/products/bulk", payload).then((res) => res.data);
};

export const bulkCreateProductsFromCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post("/products/bulk-csv", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);
};
