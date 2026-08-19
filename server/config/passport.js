import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const createGoogleUsername = async (profile) => {
    const email = profile.emails?.[0]?.value;
    const baseUsername = (profile.displayName || email?.split("@")[0] || "google-user")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24) || "google-user";

    let username = baseUsername;
    let suffix = 1;

    while (await User.exists({ username })) {
        username = `${baseUsername.slice(0, 24 - String(suffix).length - 1)}-${suffix}`;
        suffix += 1;
    }

    return username;
};

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
                    const email = profile.emails?.[0]?.value;
                    user = await User.create({
                        googleId: profile.id,
                        username: await createGoogleUsername(profile),
                        email,
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
