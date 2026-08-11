import api from "./api";

export const getMyNotifications = () =>
  api.get("/notifications").then((res) => res.data);

export const markAsRead = (id) =>
  api.put(`/notifications/${id}/read`).then((res) => res.data);

export const markAllAsRead = () =>
  api.put("/notifications/read-all").then((res) => res.data);