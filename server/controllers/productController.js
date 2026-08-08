import Product from "../models/Product.js";
import Category from "../models/Category.js";

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

        if (!name || !category || !price) {
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

        if (req.query.category) filter.category = req.query.category;
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
        if (req.query.sort === "priceHighLow") sortOption = { price: -1 };
        if (req.query.sort === "popular") sortOption = { numReviews: -1 };

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