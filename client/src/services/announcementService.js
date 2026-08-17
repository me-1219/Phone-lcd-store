import api from "./api";

export const getActiveAnnouncements = () =>
  api.get("/announcements").then((res) => res.data);

// Admin
export const getAllAnnouncements = () =>
  api.get("/announcements/all").then((res) => res.data);

export const createAnnouncement = (data) =>
  api.post("/announcements", data).then((res) => res.data);

export const updateAnnouncement = (id, data) =>
  api.put(`/announcements/${id}`, data).then((res) => res.data);

export const deleteAnnouncement = (id) =>
  api.delete(`/announcements/${id}`).then((res) => res.data);
