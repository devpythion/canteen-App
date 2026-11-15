import crypto from "crypto-js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

const createEsewaSignature = (totalAmount, transactionUuid, productCode, secretKey) => {
  const data = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const hash = crypto.HmacSHA256(data, secretKey);
  return crypto.enc.Base64.stringify(hash);
};

// 1. Initialize eSewa Payment
export const initEsewaPayment = async (req, res) => {
  try {
    const { amount, promoCode, address } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    // eSewa only allows alphanumeric & hyphens in transaction_uuid
    // Store address & promoCode in an httpOnly cookie during checkout!
    res.cookie(
      "pendingOrderMeta",
      JSON.stringify({
        address: address || "No remarks provided",
        promoCode: promoCode || null,
      }),
      { httpOnly: true, maxAge: 15 * 60 * 1000, path: "/" }
    );

    const transactionUuid = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const productCode = "EPAYTEST";
    const secretKey = "8gBm/:&EnhH.1/q";
    const totalAmount = Number(amount);
    const signature = createEsewaSignature(totalAmount, transactionUuid, productCode, secretKey);

    // Clean URL with NO query parameters! eSewa will safely append '?data=...'
    const successUrl = `http://localhost:5000/api/payment/success/${userId}`;
    const failureUrl = `http://localhost:5173/checkout?error=payment_failed`;

    const paymentPayload = {
      amount: totalAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
      url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    };

    return res.status(200).json({ success: true, paymentPayload });
  } catch (error) {
    console.error("eSewa Init Error:", error);
    return res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};

// 2. eSewa Success Callback
export const esewaSuccess = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data } = req.query; // Now req.query.data parses properly!

    if (!data) {
      console.error("No data query param received from eSewa");
      return res.redirect("http://localhost:5173/checkout?error=payment_failed");
    }

    const decodedString = Buffer.from(data, "base64").toString("utf-8");
    const paymentInfo = JSON.parse(decodedString);

    if (paymentInfo.status === "COMPLETE") {
      const cart = await Cart.findOne({ user: userId }).populate("items.menuItem");
      if (!cart || cart.items.length === 0) {
        return res.redirect("http://localhost:5173/cart");
      }

      // Retrieve remarks & promoCode from the temporary cookie
      let orderMeta = { address: "No remarks provided", promoCode: null };
      if (req.cookies?.pendingOrderMeta) {
        try {
          orderMeta = JSON.parse(req.cookies.pendingOrderMeta);
        } catch (e) {}
      }

      await Order.create({
        user: userId,
        items: cart.items.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
        totalAmount: Number(String(paymentInfo.total_amount).replace(/,/g, "")), // Strip commas if eSewa formats like "1,200.0"
        address: orderMeta.address,
        paymentMethod: "Online Payment",
        paymentStatus: "Paid",
        orderStatus: "Pending",
        promoCode: orderMeta.promoCode,
      });

      // Clear cart and temporary metadata cookie
      await Cart.findOneAndDelete({ user: userId });
      res.clearCookie("pendingOrderMeta", { path: "/" });

      return res.redirect("http://localhost:5173/my-orders?success=true");
    } else {
      return res.redirect("http://localhost:5173/checkout?error=payment_failed");
    }
  } catch (error) {
    console.error("Success callback error:", error);
    return res.redirect("http://localhost:5173/checkout?error=server_error");
  }
};