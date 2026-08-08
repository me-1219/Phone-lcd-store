import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { adjustStock } from "../utils/inventoryService.js";

// =========================
// ADMIN — Manual stock adjustment (damage, stocktake correction, etc.)
// POST /api/inventory/adjust
// body: { productId, quantityChange, type, reason }
// =========================
export const manualAdjustStock = async (req, res) => {
    try {
        const { productId, quantityChange, type, reason } = req.body;

        if (!productId || quantityChange === undefined || !type) {
            return res.status(400).json({
                success: false,
                message: "productId, quantityChange and type are required.",
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "A reason is required for manual stock adjustments.",
            });
        }

        const validTypes = ["adjustment", "damage", "purchase_receipt"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `type must be one of: ${validTypes.join(", ")}`,
            });
        }

        const product = await adjustStock({
            productId,
            quantityChange: Number(quantityChange),
            type,
            reason,
            performedBy: req.user._id,
        });

        res.status(200).json({
            success: true,
            message: "Stock adjusted.",
            data: product,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Get stock movement history (all, or filtered by product)
// GET /api/inventory/movements?productId=&type=&page=&limit=
// =========================
export const getStockMovements = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.productId) filter.product = req.query.productId;
        if (req.query.type) filter.type = req.query.type;

        const movements = await StockMovement.find(filter)
            .populate("product", "name sku")
            .populate("performedBy", "name email")
            .populate("referenceOrder", "orderStatus")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await StockMovement.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: movements,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Low stock report
// GET /api/inventory/low-stock
// =========================
export const getLowStockProducts = async (req, res) => {
    try {
        // stock <= reorderPoint, using Mongo's $expr to compare two fields on the same doc
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ["$stock", "$reorderPoint"] },
        })
            .select("name sku brand stock reorderPoint category")
            .populate("category", "name")
            .sort({ stock: 1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};