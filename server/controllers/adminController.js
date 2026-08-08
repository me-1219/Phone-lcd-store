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
            totalSalesResult,
            pendingOrdersCount,
            lowStockCount,
            totalUsers,
            totalProducts,
            topSellingProducts,
        ] = await Promise.all([
            // Total revenue from paid orders
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),

            Order.countDocuments({ orderStatus: "pending" }),

            Product.countDocuments({
                isActive: true,
                $expr: { $lte: ["$stock", "$reorderPoint"] },
            }),

            User.countDocuments({ role: "user" }),

            Product.countDocuments({ isActive: true }),

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
                totalSales: totalSalesResult[0]?.total || 0,
                pendingOrders: pendingOrdersCount,
                lowStockCount,
                totalUsers,
                totalProducts,
                topSellingProducts,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};