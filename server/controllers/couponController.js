import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import { validateAndCalculateDiscount } from "../utils/couponService.js";

// =========================
// ADMIN — Create coupon
// POST /api/coupons
// =========================
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            maxDiscountAmount,
            minOrderAmount,
            usageLimit,
            expirationDate,
        } = req.body;

        if (!code || !discountType || !discountValue || !expirationDate) {
            return res.status(400).json({
                success: false,
                message: "code, discountType, discountValue and expirationDate are required.",
            });
        }

        const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: "Coupon code already exists." });
        }

        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            maxDiscountAmount,
            minOrderAmount,
            usageLimit,
            expirationDate,
        });

        res.status(201).json({ success: true, message: "Coupon created.", data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Get all coupons
// GET /api/coupons
// =========================
export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Update coupon
// PUT /api/coupons/:id
// =========================
export const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }

        res.status(200).json({ success: true, message: "Coupon updated.", data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Delete coupon
// DELETE /api/coupons/:id
// =========================
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }
        await coupon.deleteOne();
        res.status(200).json({ success: true, message: "Coupon deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// USER — Preview coupon discount on current cart (does NOT apply/consume it)
// POST /api/coupons/apply
// body: { code }
// =========================
export const previewCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Coupon code is required." });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        const cartTotal = cart.items.reduce((sum, item) => {
            const price = item.product.discountPrice || item.product.price;
            return sum + price * item.quantity;
        }, 0);

        const { discountAmount } = await validateAndCalculateDiscount(code, cartTotal);

        res.status(200).json({
            success: true,
            data: {
                cartTotal,
                discountAmount,
                finalTotal: cartTotal - discountAmount,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};