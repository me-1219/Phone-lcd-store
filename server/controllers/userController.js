import User from "../models/User.js";

// =========================
// ADMIN — Get all users
// GET /api/users
// =========================
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Get single user
// GET /api/users/:id
// =========================
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// User — get current authenticated profile
// GET /api/users/me
// =========================
export const getMyProfile = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// User — update own profile
// PUT /api/users/me
// =========================
export const updateMyProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user._id);
        user.name = name ?? user.name;
        user.phone = phone ?? user.phone;
        user.address = address ?? user.address;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated.",
            data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Block / unblock a user
// PUT /api/users/:id/block
// body: { isActive }
// =========================
export const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.isActive = req.body.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "unblocked" : "blocked"}.`,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Change user role (e.g. promote to staff/admin)
// PUT /api/users/:id/role
// body: { role }
// =========================
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["user", "admin", "staff"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "Role updated.", data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Delete user
// DELETE /api/users/:id
// =========================
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: "User deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};