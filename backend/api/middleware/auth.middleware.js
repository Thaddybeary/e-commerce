const { verifyAccessToken } = require("../../utils/tokenUtils");
const User = require("../../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorisation;

    if (!authHeader || !authHeader.startswith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Token Required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-refreshTokens");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to access this resource",
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorisation;

    if (authHeader && authHeader.startswith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-refreshTokens");
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorise,
  optionalAuth,
};
