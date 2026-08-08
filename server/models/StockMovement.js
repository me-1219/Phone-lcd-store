import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        type: {
            type: String,
            enum: ["sale", "return", "purchase_receipt", "adjustment", "damage"],
            required: true,
        },
        quantityChange: {
            type: Number, // positive = stock added, negative = stock removed
            required: true,
        },
        stockBefore: { type: Number, required: true },
        stockAfter: { type: Number, required: true },
        reason: { type: String, trim: true },
        referenceOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("StockMovement", stockMovementSchema);