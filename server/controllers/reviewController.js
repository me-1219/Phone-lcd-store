import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Recalculate product's rating + numReviews after any review change
const recalculateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const rating = numReviews
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
        : 0;

    await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// =========================
// Create review (only if user purchased the product)
// POST /api/reviews
// body: { productId, rating, comment }
// =========================
export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: "productId and rating are required.",
            });
        }

        // Confirm the user actually bought this product (delivered order)
        const hasPurchased = await Order.findOne({
            user: req.user._id,
            "items.product": productId,
            orderStatus: "delivered",
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: "You can only review products you've purchased and received.",
            });
        }

        const existing = await Review.findOne({ user: req.user._id, product: productId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "You already reviewed this product.",
            });
        }

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            comment,
        });

        await recalculateProductRating(productId);

        res.status(201).json({ success: true, message: "Review added.", data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Get all reviews for a product
// GET /api/reviews/product/:productId
// =========================
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Update own review
// PUT /api/reviews/:id
// =========================
export const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;
        await review.save();

        await recalculateProductRating(review.product);

        res.status(200).json({ success: true, message: "Review updated.", data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Delete own review (or admin can delete any)
// DELETE /api/reviews/:id
// =========================
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        if (req.user.role !== "admin" && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const productId = review.product;
        await review.deleteOne();
        await recalculateProductRating(productId);

        res.status(200).json({ success: true, message: "Review deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};