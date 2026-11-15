import PromoCode from "../models/promoModel.js";

// 🛠️ Admin: Create a Promo Code
export const createPromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: "Promo code already exists" });
    }

    const newPromo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
      usageLimit,
    });

    res.status(201).json({ success: true, message: "Promo code created successfully", promo: newPromo });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🛠️ Admin: Get all promo codes
export const getAllPromoCodes = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 🛠️ Admin: Delete promo code
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    await PromoCode.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Promo code deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// 👤 User: Apply & Validate Promo Code on Server Side
export const applyPromoCode = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Please enter a promo code" });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) {
      return res.status(404).json({ success: false, message: "Invalid or expired promo code" });
    }

    // Check Expiration
    if (new Date() > new Date(promo.expiryDate)) {
      return res.status(400).json({ success: false, message: "This promo code has expired" });
    }

    // Check Usage Limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: "Promo code usage limit reached" });
    }

    // Check Minimum Order Amount
    if (cartTotal < promo.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of Rs. ${promo.minOrderAmount} required for this promo`,
      });
    }

    // 🧮 Compute discount securely on server side
    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = (cartTotal * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Ensure discount doesn't exceed total cart amount
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    const finalAmount = cartTotal - discountAmount;

    res.status(200).json({
      success: true,
      message: "Promo code applied successfully!",
      promoCode: promo.code,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};