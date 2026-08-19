import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Match an existing account by googleId first, then by email
                // (so someone who registered with email/password and later
                // uses "Continue with Google" links to the same account
                // instead of creating a duplicate).
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.findOne({ email: profile.emails?.[0]?.value });

                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                }

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        isVerified: true, // Google already verified this email
                        role: "user",
                    });
                }

                if (!user.isActive) {
                    return done(null, false, { message: "This account has been blocked." });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Only needed because the OAuth handshake briefly uses express-session —
// nothing else in the app relies on sessions, everything else is JWT.
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
