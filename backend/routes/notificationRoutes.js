import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import {
  getNotifications,
  markAsRead,
  clearNotifications,
} from "../controllers/notificationController.js";

const notificationRoutes = express.Router();

const notificationAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
      req.admin = decoded;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

notificationRoutes.get("/get", notificationAuth, getNotifications);
notificationRoutes.put("/mark-read", notificationAuth, markAsRead);
notificationRoutes.delete("/clear", notificationAuth, clearNotifications);

export default notificationRoutes;