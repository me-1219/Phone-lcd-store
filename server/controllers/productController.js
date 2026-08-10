import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Wishlist from "../models/Wishlist.js";
import { notifyAllAdmins } from "../utils/notificationService.js";
import mongoose from "mongoose";
import { adjustStock } from "../utils/inventoryService.js";
import { parse } from "csv-parse/sync";

// =========================
// ADMIN — Bulk product import helpers
// Shared by both bulk endpoints (JSON array and CSV) so validation logic
// only lives in one place.
export const processBulkImport = async (items, adminUserId) => {
    const results = { created: [], failed: [] };

    for (let i = 0; i < items.length; i++) {
        const row = items[i];
        const rowLabel = row.name || `Row ${i + 1}`;

        try {
            if (!row.name || !row.category || row.price === undefined || row.price === null) {
                results.failed.push({ row: rowLabel, reason: "Missing name, category, or price." });
                continue;
            }

            // Category can be an ObjectId or a plain name — resolve either way
            // so pasted JSON doesn't have to have the ID looked up first.
            let categoryId = row.category;
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                const category = await Category.findOne({
                    $or: [{ name: row.category }, { slug: row.category }],
                });
                if (!category) {
                    results.failed.push({ row: rowLabel, reason: `Category not found: "${row.category}"` });
                    continue;
                }
                categoryId = category._id;
            } else {
                const exists = await Category.findById(categoryId);
                if (!exists) {
                    results.failed.push({ row: rowLabel, reason: `Category ID not found: ${categoryId}` });
                    continue;
                }
            }

            if (row.sku) {
                const skuExists = await Product.findOne({ sku: row.sku });
                if (skuExists) {
                    results.failed.push({ row: rowLabel, reason: `SKU already exists: ${row.sku}` });
                    continue;
                }
            }

            const openingStock = Number(row.stock) || 0;

            const product = await Product.create({
                name: row.name,
                description: row.description,
                brand: row.brand,
                compatibleModels: Array.isArray(row.compatibleModels)
                    ? row.compatibleModels
                    : typeof row.compatibleModels === "string"
                    ? row.compatibleModels.split(";").map((s) => s.trim()).filter(Boolean)
                    : [],
                qualityGrade: row.qualityGrade,
                screenType: row.screenType,
                category: categoryId,
                sku: row.sku,
                price: Number(row.price),
                discountPrice: row.discountPrice ? Number(row.discountPrice) : undefined,
                stock: 0, // set via adjustStock below so it's logged, not silent
                images: row.images || [],
                featured: !!row.featured,
            });

            if (openingStock > 0) {
                await adjustStock({
                    productId: product._id,
                    quantityChange: openingStock,
                    type: "purchase_receipt",
                    reason: "Bulk import — opening stock",
                    performedBy: adminUserId,
                });
            }

            results.created.push({ row: rowLabel, productId: product._id });
        } catch (err) {
            results.failed.push({ row: rowLabel, reason: err.message });
        }
    }

    return results;
};

// ADMIN — Bulk create products from a JSON array
// POST /api/products/bulk
// body: { products: [ {...}, {...} ] }
export const bulkCreateProducts = async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body must include a non-empty 'products' array.",
            });
        }

        const results = await processBulkImport(products, req.user._id);

        res.status(207).json({
            success: true,
            message: `${results.created.length} created, ${results.failed.length} failed.`,
            data: results,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// =========================
// Create Product
// POST /api/products
// =========================
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            brand,
            compatibleModels,
            qualityGrade,
            screenType,
            category,
            sku,
            price,
            discountPrice,
            stock,
            images,
            featured
        } = req.body;

        if (!name || !category || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Name, Category and Price are required."
            });
        }

        // Check category exists
        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        // Check SKU uniqueness only if provided
        if (sku) {
            const skuExists = await Product.findOne({ sku });
            if (skuExists) {
                return res.status(409).json({
                    success: false,
                    message: "A product with this SKU already exists."
                });
            }
        }

        const product = await Product.create({
            name,
            description,
            brand,
            compatibleModels,
            qualityGrade,
            screenType,
            category,
            sku,
            price,
            discountPrice,
            stock,
            images,
            featured
        });

        const newProduct = await Product.findById(product._id)
            .populate("category", "name slug");

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: newProduct
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =========================
// Get All Products (with filters)
// GET /api/products?category=&brand=&qualityGrade=&compatibleModel=&minPrice=&maxPrice=&featured=&sort=
// =========================
export const getProducts = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { isActive: true };
        if (req.query.q) {
            const keyword = req.query.q.trim();
            if (keyword) {
                filter.$or = [
                    { name: { $regex: keyword, $options: "i" } },
                    { brand: { $regex: keyword, $options: "i" } },
                    { compatibleModels: { $regex: keyword, $options: "i" } },
                    { sku: { $regex: keyword, $options: "i" } }
                ];
            }
        }

        if (req.query.category) {
            const category = await Category.findOne({
                $or: [
                    { name: { $regex: req.query.category, $options: "i" } },
                    { slug: { $regex: req.query.category, $options: "i" } }
                ]
            });
            if (!category) {
                return res.status(200).json({
                    success: true,
                    total: 0,
                    page: 1,
                    pages: 0,
                    data: []
                });
            }
            filter.category = category._id;
        }
        if (req.query.brand) filter.brand = req.query.brand;
        if (req.query.qualityGrade) filter.qualityGrade = req.query.qualityGrade;
        if (req.query.screenType) filter.screenType = req.query.screenType;
        if (req.query.featured) filter.featured = req.query.featured === "true";

        // compatibleModels is an array — match if the requested model is in it
        if (req.query.compatibleModel) {
            filter.compatibleModels = req.query.compatibleModel;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // Sorting
        let sortOption = { createdAt: -1 };
        if (req.query.sort === "priceLowHigh") sortOption = { price: 1 };
        else if (req.query.sort === "priceHighLow") sortOption = { price: -1 };
        else if (req.query.sort === "popular") sortOption = { numReviews: -1 };
        else if (req.query.sort) {
            const sortValue = req.query.sort;
            const field = sortValue.startsWith("-") ? sortValue.slice(1) : sortValue;
            const direction = sortValue.startsWith("-") ? -1 : 1;
            const allowedFields = ["createdAt", "price", "numReviews", "name", "brand"];
            if (allowedFields.includes(field)) {
                sortOption = { [field]: direction };
            }
        }

        const products = await Product.find(filter)
            .populate("category", "name slug")
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Get Product By ID
// GET /api/products/:id
// =========================
export const getProductById = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id)
            .populate("category", "name slug");

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Update Product
// PUT /api/products/:id
// =========================
export const updateProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        if (req.body.category) {

            const category = await Category.findById(req.body.category);

            if (!category) {

                return res.status(404).json({
                    success: false,
                    message: "Category not found."
                });

            }

        }

        // If SKU is being changed, make sure it's not taken by another product
        if (req.body.sku && req.body.sku !== product.sku) {
            const skuTaken = await Product.findOne({
                sku: req.body.sku,
                _id: { $ne: product._id }
            });

            if (skuTaken) {
                return res.status(409).json({
                    success: false,
                    message: "A product with this SKU already exists."
                });
            }
        }

        const newPrice = req.body.price;
        if (newPrice !== undefined && newPrice < product.price) {
            const wishlistUsers = await Wishlist.find({ product: product._id }).select("user");
            const { notifyUser } = await import("../utils/notificationService.js");

            for (const w of wishlistUsers) {
                await notifyUser({
                    userId: w.user,
                    type: "price_drop",
                    message: `Price dropped on ${product.name} — now ${newPrice}.`,
                    relatedProduct: product._id,
                });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("category", "name slug");

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: updatedProduct
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Delete Product
// DELETE /api/products/:id
// =========================
export const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Get Products By Category
// GET /api/products/category/:categoryId
// =========================
export const getProductsByCategory = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            category: req.params.categoryId,
            isActive: true
        };

        const products = await Product.find(filter)
            .populate("category", "name slug")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// Search Products
// GET /api/products/search?q=samsung
// =========================
export const searchProducts = async (req, res) => {

    try {

        const keyword = req.query.q || "";

        const products = await Product.find({
            isActive: true,
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { brand: { $regex: keyword, $options: "i" } },
                { compatibleModels: { $regex: keyword, $options: "i" } },
                { sku: { $regex: keyword, $options: "i" } }
            ]
        }).populate("category", "name slug");

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// =========================
// ADMIN — Bulk create products from an uploaded CSV
// POST /api/products/bulk-csv  (multipart/form-data, field: "file")
//
// CSV columns must match the JSON field names exactly. For
// compatibleModels, separate multiple values with a semicolon (;) inside
// the cell — not a comma, since commas are the CSV delimiter itself.
// =========================
export const bulkCreateProductsFromCsv = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No CSV file uploaded." });
        }

        const records = parse(req.file.buffer.toString("utf-8"), {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const results = await processBulkImport(records, req.user._id);

        res.status(207).json({
            success: true,
            message: `${results.created.length} created, ${results.failed.length} failed.`,
            data: results,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};