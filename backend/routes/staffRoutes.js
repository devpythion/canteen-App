import express from "express";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { createStaff, getAllStaff, removeStaff } from "../controllers/staffController.js";

const staffRoutes = express.Router();

staffRoutes.post("/create", adminOnly, createStaff);
staffRoutes.get("/all", adminOnly, getAllStaff);
staffRoutes.delete("/delete/:id", adminOnly, removeStaff);

export default staffRoutes;