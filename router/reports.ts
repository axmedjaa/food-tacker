import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDaily, getMonthly, getWeekly } from "../controller/reports.js";
const reportsRouter = Router();
reportsRouter.use(protect)
reportsRouter.get("/daily",getDaily)
reportsRouter.get("/weekly",getWeekly)
reportsRouter.get("/monthly",getMonthly)
export default reportsRouter