const User = require("../../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/tokenUtils");

const authController = {
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ email });
      if (exisitingUser) {
        return res.status(409).json({
          success: false,
          message: "User with email already exists",
        });
      }

      const user = new User({ email, password, name });
      await user.save();

      const accessToken = generateAccessToken({ userId: user._id });
      const refreshToken = generateRefreshToken({ userId: user._id });

      await user.addRefreshToken(refreshToken);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const accessToken = generateAccessToken({ userId: user._id });
      const refreshToken = generateRefreshToken({ userId: user._id });

      await user.addRefreshToken(refreshToken);

      res.json({
        success: true,
        message: "Login successfull",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error("login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.some((t) => t.token === refreshToken)) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      await user.removeRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken({ userId: user._id });
      const newRefreshToken = generateRefreshToken({ userId: user._id });

      await user.addRefreshToken(newRefreshToken);

      res.json({
        success: true,
        message: "Tokens refreshed successfully",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expire refresh token",
      });
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const user = await User.findById(req.user._id);

      if (refreshToken) {
        await user.removeRefreshToken(refreshToken);
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.json({
        success: false,
        message: "Internal server error during logout",
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            isVerified: req.user.isVerified,
          },
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name },
        { new: true, runValidators: true }
      ).select("-refreshTokens");

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during profile update",
      });
    }
  },
};

module.exports = authController;
