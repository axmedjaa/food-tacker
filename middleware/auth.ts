import { Request, Response,NextFunction } from "express"
import User, { IUser } from "../models/User.js"
import jwt from "jsonwebtoken"
declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }
}
export const protect=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    let token:string|undefined;
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer ")){
       try {
         token=req.headers.authorization.split(" ")[1]
         if(!token){
            res.status(401).json({message:"Unauthorized"})
            return
         }
         const decoded=jwt.verify(token,process.env.JWt_Token as string) as {userId:string}
         const user=await User.findById(decoded.userId).select("-password")
         if(!user){
            res.status(401).json({message:"Unauthorized"})
            return
         }
         req.user=user
         next()
       } catch (error) {
        console.log(error)
        res.status(401).json({message:"Unauthorized"})
       }
    }else{
        res.status(401).json({message:"Unauthorized"})
    }
}