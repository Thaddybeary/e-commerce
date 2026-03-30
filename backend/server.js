const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Connect to DB
const connectDB = require("./config/db");
connectDB();

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", require("./api/auth/auth.routes"));
app.use("/api/users", require("./api/users/user.routes"));
app.use("/api/products", require("./api/products/product.routes"));
app.use("/api/cart", require("./api/cart/cart.routes"));
app.use("/api/orders", require("./api/orders/order.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
