const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const orderController = {
  // POST /api/orders — create an order from the user's cart
  async createOrder(req, res) {
    try {
      const { shippingAddress, paymentMethod, notes } = req.body;

      if (!shippingAddress || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: "shippingAddress and paymentMethod are required",
        });
      }

      // Fetch the user's cart with product details
      const cart = await Cart.findOne({ userId: req.user._id }).populate(
        "items.productId"
      );

      if (!cart || cart.items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Your cart is empty" });
      }

      // Validate stock and build order items
      const orderItems = [];
      for (const item of cart.items) {
        const product = item.productId;

        if (!product || !product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${product?.name || item.productId} is no longer available`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
          });
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0] || null,
          price: product.price,
          quantity: item.quantity,
          subtotal: Math.round(product.price * item.quantity * 100) / 100,
        });
      }

      // Calculate totals
      const subtotal =
        Math.round(orderItems.reduce((sum, i) => sum + i.subtotal, 0) * 100) /
        100;
      const shippingCost = subtotal >= 50 ? 0 : 4.99; // Free shipping over £50
      const tax = Math.round(subtotal * 0.2 * 100) / 100; // 20% VAT
      const totalAmount =
        Math.round((subtotal + shippingCost + tax) * 100) / 100;

      // Create the order
      const order = new Order({
        userId: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingCost,
        tax,
        totalAmount,
        notes,
      });

      await order.save();

      // Deduct stock for each product
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear the cart
      await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/orders/my-orders — get logged-in user's order history
  async getMyOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const query = { userId: req.user._id };
      if (status) query.status = status;

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .select("-items.productId"); // keep it lightweight for the list view

      return res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            current: Number(page),
            total: Math.ceil(total / Number(limit)),
            results: orders.length,
            totalOrders: total,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/orders/:id — get a single order (must belong to user or be admin)
  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id).populate(
        "items.productId",
        "name brand images"
      );

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Only the owner or an admin can view the order
      if (
        order.userId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // PUT /api/orders/:id/cancel — user cancels their own order
  async cancelOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (!["pending", "processing"].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: "Only pending or processing orders can be cancelled",
        });
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancelReason = req.body.reason || "Cancelled by customer";

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // ── Admin routes ──

  // GET /api/orders — get all orders (admin)
  async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 20, status, paymentStatus } = req.query;
      const query = {};
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate("userId", "username email");

      return res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: {
            current: Number(page),
            total: Math.ceil(total / Number(limit)),
            results: orders.length,
            totalOrders: total,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // PUT /api/orders/:id/status — update order status (admin)
  async updateOrderStatus(req, res) {
    try {
      const { status, paymentStatus, trackingNumber } = req.body;

      const update = {};
      if (status) update.status = status;
      if (paymentStatus) update.paymentStatus = paymentStatus;
      if (trackingNumber) update.trackingNumber = trackingNumber;
      if (status === "delivered") update.deliveredAt = new Date();

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: order,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/orders/stats — order stats for admin dashboard
  async getOrderStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: "pending" });
      const processingOrders = await Order.countDocuments({
        status: "processing",
      });

      const revenueResult = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      const totalRevenue = revenueResult[0]?.total || 0;

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email");

      return res.status(200).json({
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          processingOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          recentOrders,
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = orderController;
