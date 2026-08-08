import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { notifyAllAdmins } from "./notificationService.js";
/**
 * Changes a product's stock and logs the movement in one place.
 * quantityChange: positive to add stock, negative to remove.
 */
export const adjustStock = async ({
    productId,
    quantityChange,
    type,
    reason,
    referenceOrder,
    performedBy,
}) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error(`Product not found: ${productId}`);
    }

    const stockBefore = product.stock;
    const stockAfter = stockBefore + quantityChange;

    if (stockAfter < 0) {
        throw new Error(
            `Insufficient stock for ${product.name}. Available: ${stockBefore}, requested: ${-quantityChange}.`
        );
    }

    product.stock = stockAfter;
    await product.save();
    if (stockAfter <= product.reorderPoint) {
    await notifyAllAdmins({
        type: "low_stock",
        message: `${product.name} is low on stock (${stockAfter} left, reorder point ${product.reorderPoint}).`,
        relatedProduct: product._id,
    });
    }
    await StockMovement.create({
        product: productId,
        type,
        quantityChange,
        stockBefore,
        stockAfter,
        reason,
        referenceOrder,
        performedBy,
    });

    return product;
};