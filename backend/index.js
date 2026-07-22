import express from 'express'
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
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import router from './routes/root.js'

dotenv.config()

const app = express()

//database connection
connectDB()
connectCloudinary()
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

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})