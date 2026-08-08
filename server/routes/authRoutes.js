import express from "express";

import {
  register,
  login,
  getAllUsers,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";


const router = express.Router();


// Only admin can get all users
router.get(
  "/all",
  authMiddleware,
  adminOnly,
  getAllUsers
);


router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


export default router;