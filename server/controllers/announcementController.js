import Announcement from "../models/Announcement.js";

// =========================
// PUBLIC — Get active, non-expired announcements
// GET /api/announcements
// =========================
export const getActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }],
        }).sort({ priority: 1, createdAt: -1 });

        res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Get all announcements (active, inactive, expired)
// GET /api/announcements/all
// =========================
export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Create announcement
// POST /api/announcements
// =========================
export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, expiresAt, priority } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required.",
            });
        }

        const announcement = await Announcement.create({ title, message, type, expiresAt, priority });

        res.status(201).json({ success: true, message: "Announcement created.", data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Update announcement
// PUT /api/announcements/:id
// =========================
export const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found." });
        }

        res.status(200).json({ success: true, message: "Announcement updated.", data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ADMIN — Delete announcement
// DELETE /api/announcements/:id
// =========================
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found." });
        }

        await announcement.deleteOne();
        res.status(200).json({ success: true, message: "Announcement deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
