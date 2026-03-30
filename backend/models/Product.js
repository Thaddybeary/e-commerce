const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Protein Powder",
        "Pre-Workout",
        "Creatine",
        "Vitamins & Supplements",
        "Weight Gainers",
        "Fat Burners",
        "Amino Acids",
        "Bars & Snacks",
        "Apparel & Accessories",
        "Equipment",
      ],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    flavour: {
      type: String,
      trim: true,
    },
    weight: {
      // e.g. "1kg", "2.5lbs", "300g"
      type: String,
      trim: true,
    },
    servings: {
      type: Number,
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    SKU: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Recalculate average rating when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Text index for search
productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
