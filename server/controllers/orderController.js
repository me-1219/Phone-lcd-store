import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { adjustStock } from "../utils/inventoryService.js";
import { validateAndCalculateDiscount } from "../utils/couponService.js";
import { notifyUser } from "../utils/notificationService.js";
import PDFDocument from "pdfkit"
// =========================
// Create order FROM the user's cart
// POST /api/orders
// body: { shippingAddress, paymentMethod }
// =========================
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, couponCode, telebirrTransactionNumber } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }
        if (paymentMethod === "telebirr" && !telebirrTransactionNumber?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Telebirr transaction number is required for Telebirr payments.",
            });
        }
        // Validate stock and build order items
        const orderItems = [];
        let totalAmount = 0;

        for (const item of cart.items) {
            const product = item.product;

            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product no longer available: ${item.product?._id}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
                });
            }

            const priceAtOrder = product.discountPrice || product.price;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtOrder,
            });

            totalAmount += priceAtOrder * item.quantity;
        }

        let discountAmount = 0;
        let appliedCouponCode = null;

        if (req.body.couponCode) {
            const { coupon, discountAmount: calculatedDiscount } =
                await validateAndCalculateDiscount(req.body.couponCode, totalAmount);

            discountAmount = calculatedDiscount;
            appliedCouponCode = coupon.code;

            coupon.usedCount += 1;
            await coupon.save();
        }

        // Create the order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount: totalAmount - discountAmount,
            couponCode: appliedCouponCode,
            discountAmount,
            shippingAddress,
            paymentMethod: paymentMethod || "cod",
            ...(paymentMethod === "telebirr" && {
                paymentDetails: {
                    transactionNumber: telebirrTransactionNumber.trim(),
                    submittedAt: new Date(),
                }
            })
        });

        // Deduct stock for each product — centralized + audited via adjustStock()
        try {
            for (const item of orderItems) {
                await adjustStock({
                    productId: item.product,
                    quantityChange: -item.quantity,
                    type: "sale",
                    reason: "Order placed",
                    referenceOrder: order._id,
                    performedBy: req.user._id,
                });
            }
        } catch (stockError) {
            // Roll back the order if stock adjustment fails partway (e.g. race condition
            // where stock dropped between the initial check and now)
            await Order.findByIdAndDelete(order._id);
            return res.status(400).json({
                success: false,
                message: `Order could not be completed: ${stockError.message}`,
            });
        }

        // Clear the cart
        cart.items = [];
        await cart.save();

        const populatedOrder = await Order.findById(order._id)
            .populate("items.product", "name images")
            .populate("user", "name email");

        res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            data: populatedOrder,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Get logged-in user's own orders
// GET /api/orders/my-orders
// =========================
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("items.product", "name images")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Get single order (owner or admin only)
// GET /api/orders/:id
// =========================
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.product", "name images")
            .populate("user", "name email phone");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Owner check — admins can view any order, users only their own
        if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Cancel own order (only if still pending/processing)
// PUT /api/orders/:id/cancel
// =========================
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        if (!["pending", "processing"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an order that is already ${order.orderStatus}.`,
            });
        }

        // Restock items — centralized + audited via adjustStock()
        for (const item of order.items) {
            await adjustStock({
                productId: item.product,
                quantityChange: item.quantity,
                type: "return",
                reason: "Order cancelled by user",
                referenceOrder: order._id,
                performedBy: req.user._id,
            });
        }

        order.orderStatus = "cancelled";
        await order.save();

        res.status(200).json({ success: true, message: "Order cancelled.", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Get all orders
// GET /api/orders
// =========================
export const getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.orderStatus = req.query.status;

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .populate("items.product", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Update order status
// PUT /api/orders/:id/status
// body: { orderStatus }
// =========================
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ success: false, message: "Invalid order status." });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // If admin cancels an order that wasn't already cancelled, restock —
        // centralized + audited via adjustStock()
        if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
            for (const item of order.items) {
                await adjustStock({
                    productId: item.product,
                    quantityChange: item.quantity,
                    type: "return",
                    reason: "Order cancelled by admin",
                    referenceOrder: order._id,
                    performedBy: req.user._id,
                });
            }
        }

        order.orderStatus = orderStatus;

        // Mark payment as paid when delivered via COD (adjust to your actual payment flow)
        if (orderStatus === "delivered" && order.paymentMethod === "cod") {
            order.paymentStatus = "paid";
        }

        await order.save();

        await notifyUser({
            userId: order.user,
            type: "order_status",
            message: `Your order #${order._id.toString().slice(-6)} is now ${orderStatus}.`,
            relatedOrder: order._id,
        });

        res.status(200).json({ success: true, message: "Order status updated.", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Verify a Telebirr payment against the submitted transaction number
// PUT /api/orders/:id/verify-payment
// =========================
export const verifyPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.paymentMethod !== "telebirr") {
            return res.status(400).json({
                success: false,
                message: "This order isn't a Telebirr payment.",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({ success: false, message: "Already marked as paid." });
        }

        order.paymentStatus = "paid";
        order.paymentDetails.verifiedBy = req.user._id;
        order.paymentDetails.verifiedAt = new Date();
        await order.save();

        await notifyUser({
            userId: order.user,
            type: "order_status",
            message: `Your payment for order #${order._id.toString().slice(-6)} has been confirmed.`,
            relatedOrder: order._id,
        });

        res.status(200).json({ success: true, message: "Payment verified.", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Reject a submitted transaction number (couldn't be matched)
// PUT /api/orders/:id/reject-payment
// body: { reason }
// =========================
export const rejectPayment = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        await notifyUser({
            userId: order.user,
            type: "order_status",
            message: `We couldn't verify the payment for order #${order._id.toString().slice(-6)}. ${
                reason || "Please double check your transaction number or contact support."
            }`,
            relatedOrder: order._id,
        });

        res.status(200).json({ success: true, message: "Customer notified to resubmit payment info." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Download order invoice as PDF
// GET /api/orders/:id/invoice
// =========================

export const downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.product", "name sku")
            .populate("user", "name email phone");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const doc = new PDFDocument({ margin: 50 });
        const filename = `invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text("Misgie LCD", { align: "left" });
        doc.fontSize(10).fillColor("#666").text("Phone Accessories & Repair Parts", { align: "left" });
        doc.moveDown(1.5);

        doc.fontSize(16).fillColor("#000").text("INVOICE", { align: "right" });
        doc.fontSize(10).fillColor("#666").text(`#${order._id.toString().slice(-8).toUpperCase()}`, { align: "right" });
        doc.text(
            `Date: ${new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
            })}`,
            { align: "right" }
        );
        doc.moveDown(1.5);

        // Customer + shipping
        doc.fontSize(11).fillColor("#000").text("Bill To:");
        doc.fontSize(10).fillColor("#333");
        doc.text(order.user?.name || order.user?.username || "Customer");
        doc.text(order.user?.email || "");
        if (order.user?.phone) doc.text(order.user.phone);
        doc.moveDown(0.5);
        if (order.shippingAddress) {
            doc.text(
                `${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.region || ""}, ${order.shippingAddress.country || ""}`
            );
        }
        doc.moveDown(1.5);

        // Items table header
        const tableTop = doc.y;
        doc.fontSize(10).fillColor("#000");
        doc.text("Item", 50, tableTop, { width: 220 });
        doc.text("Qty", 280, tableTop, { width: 50, align: "right" });
        doc.text("Price", 340, tableTop, { width: 80, align: "right" });
        doc.text("Total", 430, tableTop, { width: 80, align: "right" });
        doc.moveTo(50, tableTop + 15).lineTo(510, tableTop + 15).strokeColor("#ccc").stroke();

        let y = tableTop + 25;
        doc.fontSize(9).fillColor("#333");
        order.items.forEach((item) => {
            const lineTotal = item.priceAtOrder * item.quantity;
            doc.text(item.product?.name || "Product", 50, y, { width: 220 });
            doc.text(String(item.quantity), 280, y, { width: 50, align: "right" });
            doc.text(item.priceAtOrder.toLocaleString(), 340, y, { width: 80, align: "right" });
            doc.text(lineTotal.toLocaleString(), 430, y, { width: 80, align: "right" });
            y += 20;
        });

        doc.moveTo(50, y).lineTo(510, y).strokeColor("#ccc").stroke();
        y += 10;

        if (order.discountAmount > 0) {
            doc.fontSize(9).fillColor("#666");
            doc.text(`Discount ${order.couponCode ? `(${order.couponCode})` : ""}:`, 340, y, { width: 90 });
            doc.text(`-${order.discountAmount.toLocaleString()}`, 430, y, { width: 80, align: "right" });
            y += 18;
        }

        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold");
        doc.text("Total (ETB):", 340, y, { width: 90 });
        doc.text(order.totalAmount.toLocaleString(), 430, y, { width: 80, align: "right" });
        doc.font("Helvetica");
        y += 30;

        doc.fontSize(9).fillColor("#666");
        doc.text(`Payment method: ${order.paymentMethod.toUpperCase()}`, 50, y);
        doc.text(`Payment status: ${order.paymentStatus.toUpperCase()}`, 50, y + 14);
        doc.text(`Order status: ${order.orderStatus.toUpperCase()}`, 50, y + 28);

        doc.moveDown(3);
        doc.fontSize(8).fillColor("#999").text("Thank you for shopping with Misgie LCD.", { align: "center" });

        doc.end();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};