import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cors from "cors"
import authrouter from "./router/auth.router.js"
import footRouter from "./router/foot.js"
import reportsRouter from "./router/reports.js"
import { Request, Response, NextFunction } from "express";
const app=express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/auth",authrouter)
app.use("/api/food",footRouter)
app.use("/api/reports",reportsRouter)
// error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// 404 middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});
connectDb()
app.listen(process.env.PORT||3000,()=>console.log("server is running on "+process.env.PORT))