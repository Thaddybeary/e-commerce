const express = require("express");
const router = express.Router();
const productController = require("../products/product.controllers");
const { authenticate, authorise } = require("../middleware/auth.middleware");

// Public routes
router.get("/featured", productController.getFeaturedProducts);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes
router.post("/:id/reviews", authenticate, productController.addReview);

// Admin only routes
router.post("/", authenticate, authorise("admin"), productController.createProduct);
router.put("/:id", authenticate, authorise("admin"), productController.updateProductById);
router.delete("/:id", authenticate, authorise("admin"), productController.deleteProductById);

module.exports = router;
