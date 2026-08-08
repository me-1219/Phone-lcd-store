import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["order_status", "low_stock", "price_drop", "general"],
            default: "general",
        },
        message: {
            type: String,
            required: true,
        },
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        status: {
            type: String,
            enum: ["read", "unread"],
            default: "unread",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
