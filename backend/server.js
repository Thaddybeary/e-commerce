const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

// Middleware
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

//Default route
app.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/users", require("./api/users/user.routes"));
app.use("/api/products", require("./api/products/product.routes"));
app.use("/api/auth", require("./api/auth/auth.routes"));

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
