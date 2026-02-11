const express = require("express");
const router = express.Router();
const productController = require("../products/product.controllers");

//Create a new product
router.post("/", productController.createProduct);

//Get all products
router.get("/", productController.getAllProducts);

//Get product by ID
router.get("/:id", productController.getProductById);

//Update product by ID
router.put("/:id", productController.updateProductById);

//Delete product by ID
router.delete("/:id", productController.deleteProductById);

module.exports = router;
