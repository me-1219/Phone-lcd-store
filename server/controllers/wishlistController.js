import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// =========================
// Get logged-in user's wishlist
// GET /api/wishlist
// =========================
export const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.find({ user: req.user._id })
            .populate("product", "name price discountPrice images stock isActive")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: wishlist.length,
            data: wishlist,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Add product to wishlist
// POST /api/wishlist
// body: { productId }
// =========================
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required.",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const existing = await Wishlist.findOne({
            user: req.user._id,
            product: productId,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist.",
            });
        }

        const item = await Wishlist.create({
            user: req.user._id,
            product: productId,
        });

        const populated = await Wishlist.findById(item._id)
            .populate("product", "name price discountPrice images stock");

        res.status(201).json({
            success: true,
            message: "Added to wishlist.",
            data: populated,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Remove product from wishlist
// DELETE /api/wishlist/:productId
// =========================
export const removeFromWishlist = async (req, res) => {
    try {
        const deleted = await Wishlist.findOneAndDelete({
            user: req.user._id,
            product: req.params.productId,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Item not found in wishlist.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Removed from wishlist.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};