import express from "express";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";
import {
  createReport,
  getUserReports,
  getAllReports,
  resolveReport,
} from "../controllers/reportController.js";

const reportRoutes = express.Router();

// 👤 User Routes (Protected)
reportRoutes.post("/create", protect, createReport);
reportRoutes.get("/my-reports", protect, getUserReports);

// Admin route for reports
reportRoutes.get("/all", adminOnly, getAllReports);

// Staff route for reports (if staff have their own view/endpoint)
reportRoutes.get("/all", staffOnly, getAllReports);
reportRoutes.put("/resolve/:reportId", adminOnly, resolveReport);

export default reportRoutes;