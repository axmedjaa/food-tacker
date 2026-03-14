import mongoose from "mongoose"

const connectDb=async():Promise<void>=>{
    try {
        const url=process.env.NODE_ENV==="development"?process.env.MONGODB_URL_DEV:process.env.MONGODB_URL_BRO
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