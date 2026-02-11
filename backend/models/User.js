const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: "7d",
        },
      },
    ],
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add refresh token
userSchema.methods.addRefreshToken = function (token) {
  this.refreshTokens.push({ token });
  if (this.refreshTokens > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  return this.save();
};

// Remove refresh token
userSchema.methods.removeRefreshTokens = function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
