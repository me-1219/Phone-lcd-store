import express from "express";
import {
    manualAdjustStock,
    getStockMovements,
    getLowStockProducts,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.post("/adjust", manualAdjustStock);
router.get("/movements", getStockMovements);
router.get("/low-stock", getLowStockProducts);

export default router;