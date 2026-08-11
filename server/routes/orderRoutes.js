import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    verifyPayment,     // ← is this here?
    rejectPayment,
    downloadInvoice,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every order route requires login

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// Admin only
router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.put("/:id/verify-payment", authorize("admin"), verifyPayment);   // ← these two
router.put("/:id/reject-payment", authorize("admin"), rejectPayment);
router.get("/:id/invoice", downloadInvoice);
export default router;