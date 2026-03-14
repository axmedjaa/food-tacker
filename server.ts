import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cors from "cors"
import authrouter from "./router/auth.router.js"
import footRouter from "./router/foot.js"
import reportsRouter from "./router/reports.js"
const app=express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/auth",authrouter)
app.use("/api/food",footRouter)
app.use("/api/reports",reportsRouter)
app.get("/health",(req,res)=>res.send("ok"))
connectDb()
app.listen(process.env.PORT||3000,()=>console.log("server is running on "+process.env.PORT))