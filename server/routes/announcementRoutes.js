import express from "express";
const router = express.Router();

import {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

router.get("/", getActiveAnnouncements); // public — homepage reads this

router.get("/all", protect, authorize("admin"), getAllAnnouncements);
router.post("/", protect, authorize("admin"), createAnnouncement);
router.put("/:id", protect, authorize("admin"), updateAnnouncement);
router.delete("/:id", protect, authorize("admin"), deleteAnnouncement);

export default router;
