const express = require("express");
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate, authorise } = require("../middleware/auth.middleware");
const { validateRegistration, validateLogin, validateRefreshToken } = require("../middleware/validation.middleware");

//public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/refresh-token", validateRefreshToken, authController.refreshToken);

//protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);

//admin only route example
router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin area!',
    user: req.user
  });
});

module.exports = router;