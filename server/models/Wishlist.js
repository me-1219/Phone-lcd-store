import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent the same user saving the same product twice
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const WishlistModel = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

export default WishlistModel;
