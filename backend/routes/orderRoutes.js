import  express from 'express'
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js"
import upload from '../middlewares/multer.js'
import { getAllOrders, getUserOrders, placeOrder, updateOrderStatus, deleteOrder } from '../controllers/orderController.js'

const orderRoutes = express.Router()

orderRoutes.post("/place",protect,placeOrder)
orderRoutes.get("/my-orders",protect,getUserOrders)
orderRoutes.get("/order",adminOnly,getAllOrders)
orderRoutes.get("/order",staffOnly,getAllOrders)
orderRoutes.put("/update-status/:orderId",adminOnly,updateOrderStatus)
orderRoutes.put("/update-status/:orderId",staffOnly,updateOrderStatus)
orderRoutes.delete("/delete/:orderId", adminOnly, deleteOrder)
orderRoutes.delete("/delete/:orderId", staffOnly, deleteOrder)

export default orderRoutes