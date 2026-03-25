import { Router } from "express";
import { protect } from "../middleware/auth.js";
import uplode from "../middleware/upload.js";
import { analyzFoodImage, discardAnalyedFood, footScanner, getEnteries, safeFoodentry } from "../controller/food.js";
const footRouter = Router();
footRouter.post('/',protect,uplode.single('image'),footScanner)
footRouter.post('/analyze',protect,uplode.single('image'),analyzFoodImage)
footRouter.post('/save',protect,safeFoodentry)
footRouter.post('/discard',protect,discardAnalyedFood)
footRouter.get("/entries",protect,getEnteries)
export default footRouter;