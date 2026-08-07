import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import "./config/passport.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
//app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Product CRUD API Running...");
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});