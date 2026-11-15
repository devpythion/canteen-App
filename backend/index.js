import express from 'express'
import http from 'http' // 👈 1. Import native http module
import { Server } from 'socket.io' // 👈 2. Import Socket.io Server
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import menuRoutes from './routes/menuRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import staffRoutes from './routes/staffRoutes.js'
import paymentRouter from "./routes/paymentRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import router from './routes/root.js'
import {logger} from './middlewares/logger.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()
const server = http.createServer(app) // 👈 3. Create HTTP server from express app

// 4. Initialize Socket.io and attach CORS options
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
})

// 5. Store 'io' instance in Express app so controllers can access it via req.app.get("io")
app.set("io", io)

// Socket.io connection handling & rooms
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Join role-based or user-specific rooms
    socket.on("joinRoom", ({ role, userId }) => {
        if (role === "staff" || role === "admin") {
            socket.join("management_room") // Staff & Admin receive new order alerts
        } else if (role === "customer" && userId) {
            socket.join(`user_${userId}`) // Private room for individual customer status updates
        }
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
    })
})

//database connection
connectDB()
connectCloudinary()

//Logger
app.use(logger)

//middlewares
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(cookieParser())

const PORT= process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/',router)
app.use("/api/auth",authRoutes)
app.use("/api/category",categoryRoutes)
app.use("/api/menu",menuRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/reports",reportRoutes)
app.use("/api/promo",promoRoutes)
app.use("/api/staff",staffRoutes)
app.use("/api/payment", paymentRouter);
app.use("/api/notifications", notificationRouter);

app.all('/*splat',(req,res)=>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname,'views','404.html'))
    }
    else if(req.accepts('json')){
        res.json({ message:"404 Not Found"})
    }
    else{
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

// ⚠️ IMPORTANT: Listen on 'server' instead of 'app' so both Express and Socket.io share the same port!
server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})