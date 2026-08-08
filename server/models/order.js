import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true, min: 1 },
                priceAtOrder: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        shippingAddress: {
            street: String,
            city: String,
            region: String,
            country: String,
        },
        orderStatus: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["paid", "unpaid", "refunded"],
            default: "unpaid",
        },
        paymentMethod: {
            type: String,
            enum: ["telebirr", "cod", "card"],
            default: "cod",
        },
        couponCode: { 
            type: String
         },
        discountAmount: { 
            type: Number, default: 0
         },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);