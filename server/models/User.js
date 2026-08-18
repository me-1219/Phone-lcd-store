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
    required: function () {
        return !this.googleId; // only required for email/password accounts
    },
    minlength: 6,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true, // allows many users with no googleId without a unique-index conflict
},

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
userSchema.pre("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed one — fails safely (returns false,
// not an error) for Google-only accounts that have no password at all.
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
