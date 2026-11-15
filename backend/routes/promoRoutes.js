import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import {
  createPromoCode,
  getAllPromoCodes,
  deletePromoCode,
  applyPromoCode,
} from "../controllers/promoController.js";

const promoRoutes = express.Router();

// User route to validate/apply promo
promoRoutes.post("/apply", protect, applyPromoCode);

// Admin routes
promoRoutes.post("/create", adminOnly, createPromoCode);
promoRoutes.get("/all", adminOnly, getAllPromoCodes);
promoRoutes.delete("/delete/:id", adminOnly, deletePromoCode);

export default promoRoutes;