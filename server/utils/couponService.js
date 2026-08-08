import Coupon from "../models/Coupon.js";

/**
 * Validates a coupon code against a cart total and returns the discount amount.
 * Throws an Error with a user-facing message if invalid.
 */
export const validateAndCalculateDiscount = async (code, cartTotal) => {
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
        throw new Error("Invalid coupon code.");
    }

    if (coupon.status !== "active") {
        throw new Error(`This coupon is ${coupon.status}.`);
    }

    if (coupon.expirationDate < new Date()) {
        coupon.status = "expired";
        await coupon.save();
        throw new Error("This coupon has expired.");
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("This coupon has reached its usage limit.");
    }

    if (cartTotal < coupon.minOrderAmount) {
        throw new Error(
            `This coupon requires a minimum order of ${coupon.minOrderAmount}.`
        );
    }

    let discountAmount;
    if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
    } else {
        discountAmount = coupon.discountValue;
    }

    // Never let discount exceed the cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return { coupon, discountAmount };
};
