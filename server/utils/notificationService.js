import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const notifyUser = async ({ userId, type, message, relatedOrder, relatedProduct }) => {
    return Notification.create({ user: userId, type, message, relatedOrder, relatedProduct });
};

// Notify every admin — used for low-stock alerts
export const notifyAllAdmins = async ({ type, message, relatedProduct }) => {
    const admins = await User.find({ role: "admin" }).select("_id");
    const notifications = admins.map((admin) => ({
        user: admin._id,
        type,
        message,
        relatedProduct,
    }));
    if (notifications.length) {
        await Notification.insertMany(notifications);
    }
};

export default { notifyUser, notifyAllAdmins };