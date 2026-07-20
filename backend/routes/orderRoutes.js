import  express from 'express'
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
import upload from '../middlewares/multer.js'
import { getAllOrders, getUserOrders, placeOrder, updateOrderStatus } from '../controllers/orderController.js'

const orderRoutes = express.Router()

orderRoutes.post("/place",protect,placeOrder)
orderRoutes.get("/my-orders",protect,getUserOrders)
orderRoutes.get("/order",adminOnly,getAllOrders)
orderRoutes.put("/update-status/:orderId",adminOnly,updateOrderStatus)

export default orderRoutes