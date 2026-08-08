import express from "express";
const router = express.Router();

import { getMyNotifications, markAsRead, markAllAsRead, } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

router.use(protect);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;