const Product = require("../../models/Product");

const productController = {
  //Create a product
  async createProduct(req, res) {
    try {
      const newProduct = await Product.create(req.body);
      return res.status(201).json(newProduct);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  //Get all products
  async getAllProducts(req, res) {
    try {
      const products = await Product.find();
      return res.status(200).json(products);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  //Get product by ID
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json("Product not found!");
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  //Update product by ID
  async updateProductById(req, res) {
    try {
      const { name, price, url, description } = req.body;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { name, price, url, description },
        { new: true }
      );
      if (!product) {
        return res.status(404).json("Product not found!");
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  //Delete product by ID
  async deleteProductById(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json("Product not found!");
      }
      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = productController;
