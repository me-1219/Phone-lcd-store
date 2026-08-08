import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        maxDiscountAmount: {
            type: Number, // caps the discount when discountType is "percentage"
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        usageLimit: {
            type: Number, // total times this code can be used across all users
            default: null, // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        expirationDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "expired", "disabled"],
            default: "active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);