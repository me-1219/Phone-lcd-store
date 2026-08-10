import express from "express";
const router = express.Router();

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    searchProducts,
    bulkCreateProducts,
    bulkCreateProductsFromCsv,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import csvUpload from "../middleware/csvUpload.js";

router.post("/", createProduct);
router.post("/bulk", protect, authorize("admin"), bulkCreateProducts);
router.post("/bulk-csv", protect, authorize("admin"), csvUpload.single("file"), bulkCreateProductsFromCsv);
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;