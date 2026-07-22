import User from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

//Generate JWT 
const generateToken = (res,payload)=>{
    const token =jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1d"})
    res.cookie("token",token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"Strict",
        maxAge:24*60*60*1000 //expire Time
    })
    return token
}

//register user
export const registerUser = async(req,res)=>{
    try{
        const { name, email, password } = req.body // Object Destructuring requests
        if(!name || !email || !password){ //checking whether the credentials are empty or not
            return res.json({ message: "Please fill the fields", success:false})
        }

        const existingUser = await User.findOne({email}) //Check duplicate Email
        if(existingUser){ //If email already exists res error
            return res.json({ message:"User already exists",success:false})
        }

        const hashedPassword = await bcrypt.hash(password,10) //Generate hashed Password to store in Database
        const user = await User.create({name, email, password:hashedPassword}) //Create User in Database with name email & password

        return res.json({ message:"User registered successfully", success: true}) //Show Success message in response
    }
    catch(error){
        //Error goes here
        console.log(error.message)
        return res.json({ message: "Internal server error", success:false})
    }
}

//login user
export const loginUser = async(req,res)=>{
    try{

        const { email, password }= req.body //Object Destructuring for Login 


        if(!email || !password){ //Checking whether the email or password is empty
            return res.json({message: "Please fill all the fields",success:false})
        }

        const user=await User.findOne({email})// Find by email

        if(!user){ //whether user exits or not
            return res.json({message:"User does not exist", success:false})
        }

        const isMatch = await bcrypt.compare(password,user.password) //Compare the received hashed value and entered Hashed value

        if(!isMatch){//Check password hash don't match
            return res.json({message:"Invalid credentials",success:false})
        }

        //After Checking All,  generate jwt Token
        generateToken(res,{id: user._id, roles:user.isAdmin? "admin":"user"})
        res.json({
            message:"User logged in successfully",
            success:true,
            user:{
                name:user.name,
                email:user.email
            }
        })
    }
    catch(error){
        console.log(error.message)
        return res.json({message:"Internal sever error",success:false})
    }
}

//Logout user
export const logoutUser = async(req,res)=>{
    try{
        res.clearCookie("token")// clear cookie with log out
        return res.json({ message:" User logged out successfully", success: true})
    }
    catch(error){
        console.log(error.message);
        return res.json({ message: "Internal server error",success:false})
    }
}

export const adminLogin = async(req,res)=>{
    try{
        const { email, password } = req.body

        if(!email || !password){
            return res.json({message:"Please fill all the fields", success:false})
        }
        const adminEmail = process.env.ADMIN_EMAIL;
        
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if(email !== adminEmail || password !== adminPassword ){
            return res.json({message:"Invalid credentials",success:false})
        }

        const token = jwt.sign({email},process.env.JWT_SECRET,{
            expiresIn: "1d"
        })

        res.cookie("token",token,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"none",
        maxAge:24*60*60*1000 //expire Time
    })
        return res.json({ 
        message:"Admin logged in successfully",
        success:true,
        admin:{
            admin:adminEmail
        }})

    }
    catch(error){
        console.log(error.message)
        return res.json({message:"Internal server error",success:false})
    }
}

export const getProfile = async(req,res)=>{
    try{
        const { id } = req.user
        const user = await User.findById(id).select("-password")
        if(!user){
            return res.status(404).json({message:"User not found",success:false})
        }
        res.json(user)
    }
    catch(error){
        return res.json({message:"Internal server error",success:false})
    }
}

export const isAuth = async(req,res)=>{
    try {
        const  {id} = req.user;
        const user = await User.findById(id).select("-password")
        res.json({success:true,user})
    } catch (error) {
        return res.json({message: "Internal server error", success:false})
    }
}