import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildUrl = (req, filename) =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

// =========================
// ADMIN — Upload a single image (categories)
// POST /api/upload/single
// =========================
export const uploadSingle = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    res.status(201).json({
        success: true,
        message: "Image uploaded.",
        data: { url: buildUrl(req, req.file.filename) },
    });
};

// =========================
// ADMIN — Upload multiple images (products)
// POST /api/upload/multiple
// =========================
export const uploadMultiple = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded." });
    }

    const urls = req.files.map((file) => buildUrl(req, file.filename));

    res.status(201).json({
        success: true,
        message: "Images uploaded.",
        data: { urls },
    });
};

// =========================
// ADMIN — Delete an uploaded file (e.g. when removing an image from a form)
// DELETE /api/upload?url=
// =========================
export const deleteUpload = (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ success: false, message: "url query param is required." });
    }

    const filename = path.basename(url);
    const filePath = path.join(__dirname, "..", "uploads", filename);

    fs.unlink(filePath, (err) => {
        // Not finding the file isn't a real failure from the client's
        // perspective — it's already gone either way.
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ success: false, message: "Could not delete file." });
        }
        res.status(200).json({ success: true, message: "File deleted." });
    });
};