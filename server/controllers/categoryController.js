import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Simple slug generator — no extra package needed
const generateSlug = (name) =>
    name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

// =========================
// Create Category
// POST /api/categories
// =========================
export const createCategory = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const slug = generateSlug(name);

        // Check duplicate by name OR slug
        const existingCategory = await Category.findOne({
            $or: [{ name: name.trim() }, { slug }]
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =========================
// Get All Categories
// GET /api/categories
// =========================
export const getCategories = async (req, res) => {
    try {

        const categories = await Category.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =========================
// Get Single Category
// GET /api/categories/:id
// =========================
export const getCategoryById = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =========================
// Get Single Category by Slug
// GET /api/categories/slug/:slug
// =========================
export const getCategoryBySlug = async (req, res) => {
    try {

        const category = await Category.findOne({ slug: req.params.slug });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =========================
// Update Category
// PUT /api/categories/:id
// =========================
export const updateCategory = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // If name changes, regenerate + re-check slug uniqueness
        if (req.body.name && req.body.name !== category.name) {
            const newSlug = generateSlug(req.body.name);

            const slugTaken = await Category.findOne({
                slug: newSlug,
                _id: { $ne: category._id }
            });

            if (slugTaken) {
                return res.status(409).json({
                    success: false,
                    message: "A category with this name already exists"
                });
            }

            category.name = req.body.name;
            category.slug = newSlug;
        }

        category.description = req.body.description ?? category.description;
        category.image = req.body.image ?? category.image;
        category.isActive = req.body.isActive ?? category.isActive;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// =========================
// Delete Category
// DELETE /api/categories/:id
// =========================
export const deleteCategory = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Prevent deleting a category that still has products
        const productCount = await Product.countDocuments({ category: category._id });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete — ${productCount} product(s) still belong to this category. Reassign or delete them first.`
            });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};