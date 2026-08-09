import api from "./api";

export const getUsers = () => api.get("/users").then((res) => res.data);

export const getUserById = (id) =>
  api.get(`/users/${id}`).then((res) => res.data);

export const toggleBlockUser = (id, isActive) =>
  api.put(`/users/${id}/block`, { isActive }).then((res) => res.data);

export const updateUserRole = (id, role) =>
  api.put(`/users/${id}/role`, { role }).then((res) => res.data);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`).then((res) => res.data);