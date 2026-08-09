import api from "./api";

export const getCategories = () =>
  api.get("/categories").then((res) => res.data);

export const getCategoryById = (id) =>
  api.get(`/categories/${id}`).then((res) => res.data);

export const getCategoryBySlug = (slug) =>
  api.get(`/categories/slug/${slug}`).then((res) => res.data);

export const createCategory = (data) =>
  api.post("/categories", data).then((res) => res.data);

export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then((res) => res.data);

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then((res) => res.data);
