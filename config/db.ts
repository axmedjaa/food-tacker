import mongoose from "mongoose"
import { config } from "./config.js"
const connectDb=async():Promise<void>=>{
    try {
        const url=config.mongodbUri
        if(!url){
            throw new Error("MONGODB_URL not found")
        }
        await mongoose.connect(url)
        console.log("database connected")
    } catch (error) {
        const errormMessage=error instanceof Error?error.message:"error connection database"
        console.log(errormMessage,"error connection database")
    }
}

export default connectDb