import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Kicks off the Google consent screen
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: true })
);

// Google redirects back here after the user approves/denies
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: true,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    }),
    (req, res) => {
        const token = generateToken(req.user._id);
        // Hand off to the frontend via URL param — the frontend route below
        // reads this once, stores it properly, then scrubs the URL.
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
    }
);

export default router;
