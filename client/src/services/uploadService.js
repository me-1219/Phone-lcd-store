import api from "./api";

// NOTE: don't set Content-Type manually — the browser needs to set its own
// multipart boundary string. api.js's default "application/json" header
// gets overridden per-request here.

export const uploadSingleImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);

  return api
    .post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const uploadMultipleImages = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images", file));

  return api
    .post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const deleteUploadedImage = (url) =>
  api.delete("/upload", { params: { url } }).then((res) => res.data);