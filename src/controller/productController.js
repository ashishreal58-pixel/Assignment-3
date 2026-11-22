const Product = require("../models/Product");
const mongoose = require("mongoose");

// CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json(product);

    } catch (error) {
        next(error);
    }
};


// GET ALL PRODUCTS
exports.getProducts = async (req, res, next) => {
    try {

        const {
            category,
            search,
            sort = "createdAt",
            order = "desc",
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        const pageNumber = Math.max(Number(page), 1);
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

        const allowedSort = [
            "name",
            "price",
            "quantity",
            "createdAt",
            "category"
        ];

        const sortField = allowedSort.includes(sort)
            ? sort
            : "createdAt";

        const sortOrder = order === "asc" ? 1 : -1;

        const products = await Product.find(filter)
            .sort({ [sortField]: sortOrder })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Product.countDocuments(filter);

        res.json({
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            products
        });

    } catch (error) {
        next(error);
    }
};


// GET SINGLE PRODUCT
exports.getProductById = async (req, res, next) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        next(error);
    }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        next(error);
    }
};


// STOCK ADJUSTMENT
exports.adjustStock = async (req, res, next) => {
    try {

        const change = Number(req.body.change);

        if (!Number.isInteger(change) || change === 0) {
            return res.status(400).json({
                message: "Change must be a non-zero integer"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.quantity + change < 0) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        product.quantity += change;

        await product.save();

        res.json({
            message: "Stock updated",
            product
        });

    } catch (error) {
        next(error);
    }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
    try {

        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted",
            id: product._id
        });

    } catch (error) {
        next(error);
    }
};


// LOW STOCK REPORT
exports.getLowStockProducts = async (req, res, next) => {
    try {

        const lowStockItems = await Product.find({
            $expr: {
                $lte: ["$quantity", "$reorderLevel"]
            }
        });

        res.json({
            count: lowStockItems.length,
            lowStockItems
        });

    } catch (error) {
        next(error);
    }
};


// CATEGORY-WISE SUMMARY
exports.getCategorySummary = async (req, res, next) => {
    try {

        const summary = await Product.aggregate([

            {
                $group: {
                    _id: "$category",

                    totalItems: {
                        $sum: 1
                    },

                    totalQuantity: {
                        $sum: "$quantity"
                    },

                    totalStockValue: {
                        $sum: {
                            $multiply: [
                                "$price",
                                "$quantity"
                            ]
                        }
                    },

                    avgPrice: {
                        $avg: "$price"
                    }
                }
            },

            {
                $sort: {
                    _id: 1
                }
            }

        ]);

        res.json({
            categories: summary.length,
            summary
        });

    } catch (error) {
        next(error);
    }
};
