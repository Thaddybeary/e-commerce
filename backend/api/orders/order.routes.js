const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate, authorise } = require("../middleware/auth.middleware");

// All order routes require authentication
router.use(authenticate);

// Admin routes (must be before /:id to avoid route conflicts)
router.get("/", authorise("admin"), orderController.getAllOrders);
router.get("/stats", authorise("admin"), orderController.getOrderStats);

// User routes
router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/cancel", orderController.cancelOrder);
router.put("/:id/status", authorise("admin"), orderController.updateOrderStatus);

module.exports = router;
