const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.put("/items/:productId", cartController.updateItem);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

module.exports = router;
