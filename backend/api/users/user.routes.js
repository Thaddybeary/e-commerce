const express = require('express');
const router = express.Router();
const userController = require('../users/user.controller');
const { authenticate, authorise } = require('../middleware/auth.middleware');
const { validateUpdateUser } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticate);

// User can get their own profile and update it
router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      }
    }
  });
});

router.put('/me', userController.updateUser);

// Admin-only routes
router.get('/stats', authorise('admin'), userController.getUserStats);
router.get('/', authorise('admin'), userController.getAllUsers);
router.get('/:id', authorise('admin'), userController.getUserById);
router.put('/:id/role', authorise('admin'), userController.updateUserRole);
router.delete('/:id', userController.deleteUser); // Self or admin

module.exports = router;