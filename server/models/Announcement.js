import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["info", "promo", "restock", "coming_soon"],
            default: "info",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Optional — lets an announcement auto-expire without manual cleanup
        // (e.g. "flash sale ends Friday" stops showing itself after Friday).
        expiresAt: {
            type: Date,
        },
        // Optional — controls display order on the homepage; lower shows first.
        priority: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
