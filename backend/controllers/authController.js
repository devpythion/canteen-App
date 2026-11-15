import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Shared cookie options so setting and clearing always match
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

// Generate JWT & Set Cookie
const generateToken = (res, payload, expiresIn = "1d", maxAge = 24 * 60 * 60 * 1000) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

  res.cookie("token", token, {
    ...getCookieOptions(),
    maxAge,
  });

  return token;
};

// 1. Register Customer
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: "customer" });

    return res.status(201).json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 2. Customer Login (Blocks Staff & Admin credentials)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist", success: false });
    }

    // Block Staff and Admin accounts from logging into the customer portal
    if (user.role !== "customer") {
      return res.status(403).json({
        message: "Access denied. Please use the Staff or Admin login portal.",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { id: user._id, role: user.role });

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 3. Staff Login
export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    // 1. Block Master Admin (.env) from logging into the staff portal
    if (email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: "Invalid Credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    // 2. Strictly restrict access to role === "staff" ONLY (block admin and customer)
    if (user.role !== "staff") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Staff account required." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      staff: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 4. Master Admin Login (.env)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields", success: false });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    generateToken(res, { email, role: "admin" });

    return res.status(200).json({
      message: "Admin logged in successfully",
      success: true,
      admin: {
        name: "Master Admin",
        email,
        role: "admin",
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 5. Unified Logout
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());
    return res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 6. Get Profile
export const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// 7. Unified Session Check (Handles Customer, Staff, and Master Admin)
export const isAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Master Admin (.env)
    if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
      return res.status(200).json({
        success: true,
        isAdmin: true,
        user: {
          name: "Master Admin",
          email: decoded.email,
          role: "admin",
        },
      });
    }

    // Database Customer / Staff / Admin
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      success: true,
      isAdmin: user.role === "admin",
      user,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", success: false });
  }
};