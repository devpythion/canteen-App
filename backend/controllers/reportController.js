import Order from "../models/orderModel.js";
import Report from "../models/reportModel.js";

// User submits a report on one of their orders
export const createReport = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { orderId, menuItemId, issueType, description } = req.body;

    if (!orderId || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "Order, issue type, and description are required",
      });
    }

    // 1. Verify the order exists and belongs to this user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized",
      });
    }

    // 2. If a specific menu item is selected, verify it was part of this order
    if (menuItemId) {
      const itemExistsInOrder = order.items.some(
        (item) => item.menuItem.toString() === menuItemId
      );
      if (!itemExistsInOrder) {
        return res.status(400).json({
          success: false,
          message: "Selected item is not part of this order",
        });
      }
    }

    const report = await Report.create({
      user: userId,
      order: orderId,
      menuItem: menuItemId || null,
      issueType,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// User views their own submitted reports
export const getUserReports = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const reports = await Report.find({ user: userId })
      .populate("order", "totalAmount status createdAt")
      .populate("menuItem", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin views all customer reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email")
      .populate("order", "totalAmount status createdAt")
      .populate("menuItem", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Admin updates report status and replies
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminReply } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    if (status) report.status = status;
    if (adminReply !== undefined) report.adminReply = adminReply;

    await report.save();
    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};