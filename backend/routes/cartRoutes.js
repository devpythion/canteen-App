import  express from 'express'
import { protect, adminOnly } from "../middlewares/authMiddleware.js"
import upload from '../middlewares/multer.js'
import { AddToCart, getCart, removeFromCart } from '../controllers/cartController.js'

const cartRoutes = express.Router()

cartRoutes.post("/add",protect,AddToCart)
cartRoutes.get("/get",protect,getCart)
cartRoutes.delete("/remove/:menuId",protect,removeFromCart)

export default cartRoutes