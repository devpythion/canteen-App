import Order from "../models/orderModel.js"
import Cart from "../models/cartModel.js"
import Menu from "../models/menuModel.js"
import PromoCode from "../models/promoModel.js"
import Notification from "../models/notificationModel.js";

export const placeOrder = async (req, res) => {
    try {
        const { id } = req.user;
        const { address, paymentMethod, promoCode } = req.body;

        if (!address)
            return res.status(200).json({ message: "Delivery address is required", success: false });

        const cart = await Cart.findOne({ user: id }).populate("items.menuItem");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty", success: false });
        }

        // Calculate initial subtotal
        let totalAmount = cart.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
        let discountAmount = 0;
        let appliedPromoCode = null;

        // Secure Server-Side Promo Code Validation & Calculation
        if (promoCode) {
            const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });

            if (!promo) {
                return res.status(400).json({ message: "Invalid promo code", success: false });
            }

            if (new Date() > new Date(promo.expiryDate)) {
                return res.status(400).json({ message: "This promo code has expired", success: false });
            }

            if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
                return res.status(400).json({ message: "Promo code usage limit reached", success: false });
            }

            if (totalAmount < promo.minOrderAmount) {
                return res.status(400).json({
                    message: `Minimum order amount of Rs. ${promo.minOrderAmount} required`,
                    success: false,
                });
            }

            if (promo.discountType === "percentage") {
                discountAmount = (totalAmount * promo.discountValue) / 100;
            } else {
                discountAmount = promo.discountValue;
            }

            if (discountAmount > totalAmount) {
                discountAmount = totalAmount;
            }

            totalAmount = totalAmount - discountAmount;
            appliedPromoCode = promo.code;

            promo.usedCount += 1;
            await promo.save();
        }

        // Create Order with server-calculated totals and promo info
        const newOrder = await Order.create({
            user: id,
            items: cart.items.map((i) => ({
                menuItem: i.menuItem.id,
                quantity: i.quantity,
            })),
            totalAmount,
            discountAmount,
            promoCode: appliedPromoCode,
            address,
            paymentMethod,
        });

        // Clear user cart
        cart.items = [];
        await cart.save();

        // 🔔 1. Populate order to match getAllOrders structure
        const populatedOrder = await Order.findById(newOrder._id)
            .populate("user", "name email")
            .populate("items.menuItem");

        // 🔔 2. Save persistent notification in MongoDB for Staff & Admin
        const customerName = populatedOrder.user?.name || "Customer";
        const staffMessage = `New order received from ${customerName} (Rs. ${totalAmount})`;

        await Notification.create({
            orderId: newOrder._id,
            message: staffMessage,
            isRead: false,
            targetRole: "staff", // Matches staff and admin portal queries
        });

        // 🔔 3. Emit live Socket.io event to Management Room
        const io = req.app.get("io");
        if (io) {
            io.to("management_room").emit("newOrder", populatedOrder);
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: newOrder,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({ user: id }).sort({ createdAt: -1 });
    res.status(200).json({ orders, success: true });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Internal server error", success: false });
  }
};

export const getAllOrders = async(req,res)=>{
    try {
        const orders = await Order.find().populate("user", "name email")
            .populate("items.menuItem").sort({createdAt:-1})
        res.status(200).json({orders,success:true})
    } catch (error) {
        console.log(error)
        return res.json({ message:"Internal server error",success:false})
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const order = await Order.findById(orderId);
        if (!status) {
            return res.status(404).json({ message: "Please fill the status." });
        }
        if (!order) return res.status(404).json({ message: "Order not found" });
        
        order.status = status;
        await order.save();

        // 1. Create and save notification in MongoDB
        const notificationMessage = `Your order status is now: ${order.status}`;
        const newNotification = await Notification.create({
            user: order.user,
            orderId: order._id,
            message: notificationMessage,
            status: order.status,
            isRead: false,
        });

        // 2. Emit live status update to the specific customer room
        const io = req.app.get("io");
        if (io) {
            const customerRoom = `user_${order.user.toString()}`;
            io.to(customerRoom).emit("orderStatusUpdated", {
                id: newNotification._id,
                orderId: order._id,
                status: order.status,
                message: notificationMessage,
                createdAt: newNotification.createdAt,
            });
        }

        res.json({ message: "Order status updated", success: true });
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};