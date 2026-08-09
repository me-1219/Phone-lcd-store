import api from "./api";

export const getDashboardSummary = () =>
  api.get("/admin/dashboard").then((res) => res.data);