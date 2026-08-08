import express from "express";
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, previewCoupon } from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/apply", previewCoupon); // any logged-in user
router.post("/", authorize("admin"), createCoupon);
router.get("/", authorize("admin"), getCoupons);
router.put("/:id", authorize("admin"), updateCoupon);
router.delete("/:id", authorize("admin"), deleteCoupon);

export default router;