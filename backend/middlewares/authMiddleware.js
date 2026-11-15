import jwt from 'jsonwebtoken'
import User from "../models/userModel.js";
 
export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Block Master Admin (.env)
    if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot access customer routes",
      });
    }

    // Verify DB user exists and strictly has role === "customer"
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access only",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export const staffOnly = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized, No Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Explicitly block Master Admin (.env) from staff routes
    if (decoded.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Admins cannot access staff pages" });
    }

    // 2. Verify user exists and strictly has role === "staff"
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "staff") {
      return res.status(403).json({ success: false, message: "Staff access only" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const adminOnly = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized, No Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Check if it's the hardcoded Master Admin from .env
    if (decoded.email === process.env.ADMIN_EMAIL) {
      req.admin = decoded;
      return next();
    }

    // 2. Otherwise, check if it's a database-backed admin or staff user
    const user = await User.findById(decoded.id);
    if (user && (user.role === "admin" || user.role === "staff")) {
      req.admin = { id: user._id, email: user.email, role: user.role };
      return next();
    }

    return res.status(403).json({ success: false, message: "Access denied. Admin only." });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};