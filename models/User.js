import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    trim: true,
  },

  address: {
    street: String,
    city: String,
    region: String,
    country: String,
  },

  password: {
    type: String,
    required: true,
  },

  googleId: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: String,
  verificationCodeExpires: Date,

  resetPasswordCode: String,
  resetPasswordExpires: Date,

});

export default mongoose.model("User", userSchema);