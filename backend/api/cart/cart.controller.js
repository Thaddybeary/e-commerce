const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const cartController = {
  // GET /api/cart — get the current user's cart (populated with product details)
  async getCart(req, res) {
    try {
      let cart = await Cart.findOne({ userId: req.user._id }).populate(
        "items.productId",
        "name brand price images stock isActive"
      );

      if (!cart) {
        cart = { userId: req.user._id, items: [] };
      }

      const formatted = formatCart(cart);
      return res.status(200).json({ success: true, data: formatted });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // POST /api/cart/items — add an item or increase quantity
  async addItem(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res
          .status(400)
          .json({ success: false, message: "productId is required" });
      }

      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`,
        });
      }

      let cart = await Cart.findOne({ userId: req.user._id });

      if (!cart) {
        cart = new Cart({ userId: req.user._id, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + Number(quantity);
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock`,
          });
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        cart.items.push({ productId, quantity: Number(quantity) });
      }

      await cart.save();
      await cart.populate("items.productId", "name brand price images stock isActive");

      return res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: formatCart(cart),
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // PUT /api/cart/items/:productId — set quantity for a specific item
  async updateItem(req, res) {
    try {
      const { quantity } = req.body;
      const { productId } = req.params;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1. To remove, use DELETE.",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`,
        });
      }

      const cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Item not in cart" });
      }

      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();
      await cart.populate("items.productId", "name brand price images stock isActive");

      return res.status(200).json({
        success: true,
        message: "Cart updated",
        data: formatCart(cart),
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // DELETE /api/cart/items/:productId — remove a specific item from cart
  async removeItem(req, res) {
    try {
      const { productId } = req.params;

      const cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );

      await cart.save();
      await cart.populate("items.productId", "name brand price images stock isActive");

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: formatCart(cart),
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // DELETE /api/cart — clear the entire cart
  async clearCart(req, res) {
    try {
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [] },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Cart cleared",
        data: { items: [], totalItems: 0, totalPrice: 0 },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

// Helper: compute cart totals
function formatCart(cart) {
  const items = cart.items.map((item) => {
    const product = item.productId;
    return {
      productId: product._id || item.productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images?.[0] || null,
      quantity: item.quantity,
      subtotal: product.price
        ? Math.round(product.price * item.quantity * 100) / 100
        : 0,
    };
  });

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice =
    Math.round(items.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;

  return { items, totalItems, totalPrice };
}

module.exports = cartController;
