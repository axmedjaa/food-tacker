import multer from "multer";
import path from "path";
import { Request } from "express";
const storage=multer.memoryStorage()
const filter=(req:Request,file:Express.Multer.File,cb:multer.FileFilterCallback):void=>{
    const allowedTypes=/jpg|jpeg|png|gif|webp/
    const extname=allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype=allowedTypes.test(file.mimetype)
    if(extname && mimetype){
        return cb(null,true)
    }
    cb(new Error("only images files are allowed (jpg,jpeg,png,gif,webp)"))
}
const uplode=multer({
    storage,
    limits:{
        fileSize: 4 * 1024 * 1024
    },
    fileFilter:filter
})
export default uplode