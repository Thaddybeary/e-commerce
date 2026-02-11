const User = require("../../models/User");

const userController = {
  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password -refreshTokens')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            results: users.length,
            totalUsers: total
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -refreshTokens');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user'
      });
    }
  },

  // Update user profile (user can update their own profile)
  updateUser: async (req, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.params.id;

      // Users can only update their own profile unless they're admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
      }

      const updateData = { name };
      
      // Only allow email update if not changing to existing email
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }
        updateData.email = email;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user'
      });
    }
  },

  // Delete user (admin or self)
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      // Users can only delete their own account unless they're admin
      if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own account'
        });
      }

      // Prevent admin from deleting themselves
      if (req.user._id.toString() === userId && req.user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the only admin user'
          });
        }
      }

      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }
  },

  // Update user role (admin only)
  updateUserRole: async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      // Prevent modifying own role
      if (req.user._id.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify your own role'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }
  },

  // Get user statistics (admin only)
  getUserStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const adminUsers = await User.countDocuments({ role: 'admin' });
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          adminUsers,
          regularUsers: totalUsers - adminUsers,
          recentUsers
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics'
      });
    }
  }
};

module.exports = userController;
