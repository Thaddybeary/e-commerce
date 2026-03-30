const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true }, // price snapshot at time of order
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "cash_on_delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: {
      // e.g. Stripe payment intent ID
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    trackingNumber: { type: String },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate a human-readable order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `GYM-${datePart}-${randomPart}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
