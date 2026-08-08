import Notification from "../models/Notification.js";

// =========================
// Get my notifications
// GET /api/notifications
// =========================
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            status: "unread",
        });

        res.status(200).json({
            success: true,
            unreadCount,
            count: notifications.length,
            data: notifications,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Mark one notification as read
// PUT /api/notifications/:id/read
// =========================
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        notification.status = "read";
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// Mark all as read
// PUT /api/notifications/read-all
// =========================
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, status: "unread" },
            { status: "read" }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};