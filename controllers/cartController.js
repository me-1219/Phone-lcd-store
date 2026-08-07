import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// =========================
// Get logged-in user's cart
// GET /api/cart
// =========================
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate("items.product", "name price discountPrice images stock");

        if (!cart) {
            cart = { user: req.user._id, items: [] };
        }

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Add item to cart (or increment if already in cart)
// POST /api/cart
// body: { productId, quantity }
// =========================
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required.",
            });
        }

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} in stock.`,
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: productId, quantity }],
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }

            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product", "name price discountPrice images stock");

        res.status(200).json({
            success: true,
            message: "Item added to cart.",
            data: populatedCart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Update quantity of a cart item
// PUT /api/cart/:productId
// body: { quantity }
// =========================
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "A valid quantity (1 or more) is required.",
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        const item = cart.items.find(
            (item) => item.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart.",
            });
        }

        item.quantity = quantity;
        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product", "name price discountPrice images stock");

        res.status(200).json({
            success: true,
            message: "Cart updated.",
            data: populatedCart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Remove one item from cart
// DELETE /api/cart/:productId
// =========================
export const removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart.",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Clear entire cart
// DELETE /api/cart
// =========================
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared.",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};