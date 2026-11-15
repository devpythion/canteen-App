import express, { Router } from 'express'
import { loginUser, registerUser, adminLogin, logoutUser, getProfile, isAuth, staffLogin} from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'
const authRoutes = express.Router()

authRoutes.post("/register",registerUser)
authRoutes.post("/login",loginUser)
authRoutes.post("/admin/login",adminLogin)
authRoutes.post("/staff/login",staffLogin)
authRoutes.post("/logout",logoutUser)
authRoutes.get("/profile",protect, getProfile)
authRoutes.get("/is-auth",protect, isAuth) 


export default  authRoutes
