import express from "express";
import { initEsewaPayment, esewaSuccess } from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const paymentRoutes = express.Router();

paymentRoutes.post("/init-esewa", protect, initEsewaPayment);
// Clean path without '?' so eSewa's '?data=...' parses cleanly!
paymentRoutes.get("/success/:userId", esewaSuccess);

export default paymentRoutes;