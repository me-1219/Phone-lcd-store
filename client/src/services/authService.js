import api from "./api";

export const register = (data) =>
  api.post("/auth/register", data).then((res) => res.data);

export const login = (data) =>
  api.post("/auth/login", data).then((res) => res.data);

export const getMe = () => api.get("/auth/all").then((res) => res.data);

// NOTE: paths below match the endpoints listed in the backend README,
// but request/response bodies weren't defined in our conversation —
// confirm field names (e.g. verification code field, reset token field)
// against the actual controller before wiring up the forms.
export const verifyEmail = (data) =>
  api.post("/auth/verify-email", data).then((res) => res.data);

export const resendVerification = (data) =>
  api.post("/auth/resend-verification", data).then((res) => res.data);

export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data).then((res) => res.data);

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data).then((res) => res.data);
export const updateMyProfile = (data) =>
  api.put("/users/me", data).then((res) => res.data);
