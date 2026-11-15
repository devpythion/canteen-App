import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// 🛠️ Create a new staff member account
export const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staffUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "staff", // Assign staff role
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      staff: { id: staffUser._id, name: staffUser.name, email: staffUser.email, role: staffUser.role },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🛠️ Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    const staffList = await User.find({ role: "staff" }).select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff: staffList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🛠️ Delete staff member
export const removeStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.role !== "staff") {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Staff account removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};