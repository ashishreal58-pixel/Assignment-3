const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    adjustStock,
    getLowStockProducts,
    getCategorySummary
} = require("../controllers/productController");


router.post("/", createProduct);

router.get("/", getProducts);

router.get("/low-stock", getLowStockProducts);

router.get("/summary", getCategorySummary);

router.get("/:id", getProductById);

router.put("/:id", updateProduct);

router.patch("/:id/stock", adjustStock);

router.delete("/:id", deleteProduct);


module.exports = router;
