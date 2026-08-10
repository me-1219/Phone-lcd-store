import express from "express";
const router = express.Router();

import upload from "../middleware/upload.js";
import { uploadSingle, uploadMultiple, deleteUpload, } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.use(protect, authorize("admin"));

router.post("/single", upload.single("image"), uploadSingle);
router.post("/multiple", upload.array("images", 6), uploadMultiple);
router.delete("/", deleteUpload);

// Multer errors (file too large, wrong type) land here instead of crashing
router.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

export default router;