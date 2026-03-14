import { Router } from "express";
import { getUsr, login, register } from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.js";
const authrouter = Router();
authrouter.post('/register',register)
authrouter.post('/login',login)
authrouter.get("/me",protect,getUsr)
export default authrouter