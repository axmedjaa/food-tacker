import { Request, Response } from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
const generateToken=(userId:string)=>{
    return jwt.sign({userId},config.jwtSecret as string,{expiresIn:"30d"})
}
interface IUser{
    name:string,
    email:string,
    dailyColorieGoal:number,
    token:string
}
export const register=async(req:Request,res:Response):Promise<Response<IUser>>=>{
    try {
           const {name,email,password,dailyColorieGoal}=req.body
    if(!name || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    const normalizeImail=email.toLowerCase().trim()
    const userExists=await User.findOne({email:normalizeImail})
    if(userExists){
        return res.status(400).json({message:"User already exists"})
    }
    const user=await User.create({name,email,password,dailyColorieGoal:dailyColorieGoal||2000})
    return res.status(201).json({message:"User created successfully",user:{
        name:user.name,
        email:user.email,
        dailyColorieGoal:user.dailyColorieGoal,
        token:generateToken(user._id.toString())
    }})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Something went wrong"})
    }
}
export const login=async(req:Request,res:Response):Promise<Response<IUser>>=>{
    try {
        const{email,password}=req.body
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }
        const user=await User.findOne({email}).select("+password")
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const isMatch=await user.comparePassword(password)
        if(!isMatch){
            return res.status(401).json({message:"Invalid credentials"})
        }
        return res.status(200).json({message:"User logged in successfully",user:{
            name:user.name,
            email:user.email,
            dailyColorieGoal:user.dailyColorieGoal,
            token:generateToken(user._id.toString())
        }})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Something went wrong"})
    }
}
export const getUsr=async(req:Request,res:Response)=>{
    try {
        res.status(200).json({message:"User fetched successfully",user:req.user})
    } catch (error) {
        console.log("error fetching user",error)
        res.status(500).json({message:"Something went wrong"})
    }
}
export const updateProfile=async(req:Request,res:Response)=>{
    try {
        const{name,dailyColorieGoal,onboardingCompleted}=req.body
        const user=await User.findById(req.user?._id)
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        if(name) user.name=name
        if(dailyColorieGoal) user.dailyColorieGoal=dailyColorieGoal
        if(onboardingCompleted!==undefined) user.onboardingCompleted=onboardingCompleted
        await user.save()
        return res.status(200).json({
            id:user._id,
            name:user.name,
            email:user.email,
            dailyColorieGoal:user.dailyColorieGoal,
            onboardingCompleted:user.onboardingCompleted
        })
    } catch (error) {
        console.log(error) 
        return res.status(500).json({message:"failed to update user"})  
    }
}