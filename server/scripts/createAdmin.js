import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: "weldemedin44@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "mebtu@121921",
      10
    );

    const admin = await User.create({
      username: "misgielcd",
      email: "weldemedin44@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created:", admin.email);

    process.exit();

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

createAdmin();