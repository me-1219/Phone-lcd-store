import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// =========================
// ADMIN — Dashboard summary
// GET /api/admin/dashboard
// =========================
export const getDashboardSummary = async (req, res) => {
    try {
        const [
            paidSalesSummaryResult,
            pendingOrdersCount,
            lowStockCount,
            totalUsers,
            totalProducts,
            pendingRevenueResult,
            revenueByPaymentMethodResult,
            topSellingProducts,
        ] = await Promise.all([
            // Paid order summary: total sales, avg. order value, discounts
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" },
                        averageOrderValue: { $avg: "$totalAmount" },
                        totalDiscountGiven: { $sum: "$discountAmount" },
                    },
                },
            ]),

            Order.countDocuments({ orderStatus: "pending" }),

            Product.countDocuments({
                isActive: true,
                $expr: { $lte: ["$stock", "$reorderPoint"] },
            }),

            User.countDocuments({ role: "user" }),

            Product.countDocuments({ isActive: true }),

            Order.aggregate([
                { $match: { paymentStatus: "unpaid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),

            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                {
                    $group: {
                        _id: "$paymentMethod",
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        method: "$_id",
                        total: 1,
                        count: 1,
                    },
                },
            ]),

            // Top-selling products — unwind order items, group by product, sum quantity
            Order.aggregate([
                { $match: { orderStatus: { $ne: "cancelled" } } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        totalSold: { $sum: "$items.quantity" },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: "products",
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },
                {
                    $project: {
                        _id: 0,
                        productId: "$product._id",
                        name: "$product.name",
                        totalSold: 1,
                        stock: "$product.stock",
                    },
                },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalSales: paidSalesSummaryResult[0]?.total || 0,
                pendingPayments: pendingRevenueResult[0]?.total || 0,
                pendingOrders: pendingOrdersCount,
                lowStockCount,
                totalUsers,
                totalProducts,
                averageOrderValue: paidSalesSummaryResult[0]?.averageOrderValue || 0,
                totalDiscountGiven: paidSalesSummaryResult[0]?.totalDiscountGiven || 0,
                revenueByPaymentMethod: revenueByPaymentMethodResult || [],
                topSellingProducts,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};