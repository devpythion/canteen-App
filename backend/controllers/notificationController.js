import Notification from "../models/notificationModel.js";

const buildRoleQuery = (req) => {
  if (req.admin || req.user?.role === "admin" || req.user?.role === "staff") {
    return { targetRole: { $in: ["staff", "admin"] } };
  }
  if (req.user?.role === "customer") {
    return { user: req.user._id, targetRole: "customer" };
  }
  return null;
};

export const getNotifications = async (req, res) => {
  try {
    const query = buildRoleQuery(req);
    if (!query) {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const query = buildRoleQuery(req);
    if (!query) {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    await Notification.updateMany({ ...query, isRead: false }, { isRead: true });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    const query = buildRoleQuery(req);
    if (!query) {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    await Notification.deleteMany(query);
    res.json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    console.error("clearNotifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};