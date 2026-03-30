const Product = require("../../models/Product");

const productController = {
  // Create a product (admin only)
  async createProduct(req, res) {
    try {
      const newProduct = await Product.create(req.body);
      return res.status(201).json({ success: true, data: newProduct });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  // Get all products with filtering, search, sorting, and pagination
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sort = "-createdAt",
        featured,
      } = req.query;

      const query = { isActive: true };

      if (category) query.category = category;
      if (brand) query.brand = { $regex: brand, $options: "i" };
      if (featured === "true") query.isFeatured = true;

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (search) {
        query.$text = { $search: search };
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      return res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            current: Number(page),
            total: Math.ceil(total / Number(limit)),
            results: products.length,
            totalProducts: total,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Get product by ID
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Update product by ID (admin only)
  async updateProductById(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  // Delete product by ID (admin only)
  async deleteProductById(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Add a review to a product
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      // Check if user already reviewed this product
      const alreadyReviewed = product.reviews.find(
        (r) => r.userId.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this product",
        });
      }

      product.reviews.push({
        userId: req.user._id,
        username: req.user.username,
        rating: Number(rating),
        comment,
      });

      product.updateRating();
      await product.save();

      return res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: product,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
      return res.status(200).json({ success: true, data: products });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = productController;
