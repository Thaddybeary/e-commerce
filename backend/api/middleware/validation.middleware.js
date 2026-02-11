const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be 2 characters long"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
];

const validateRefreshToken = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

const validateUpdateRole = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validateUpdateUser,
  validateUpdateRole
};
