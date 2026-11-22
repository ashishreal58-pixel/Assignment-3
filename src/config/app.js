const express = require("express");

const app = express();

const productRoutes = require("./routes/productRoutes");

const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management API is running"
    });
});

app.use("/api/products", productRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.use(errorHandler);

module.exports = app;
