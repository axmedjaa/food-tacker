import { Request, Response } from "express"
import sharp, { Sharp } from "sharp"
import crypto from "crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { r2Config } from "../config/r2.js"
import { analyzeFood } from "../services/openAi.js"
import FoodEntry from "../models/FoodEntry.js"
const optimizeImage=async(buffer:Buffer):Promise<Buffer>=>{
    const orginalLength=buffer.length
    const optimizedBuffer=await sharp(buffer)
    .rotate()
    .resize(1024,1024,{
        fit:"inside",
        withoutEnlargement:true
    })
    .jpeg({
        quality:85,
        mozjpeg:true
    })
    .toBuffer()
    return optimizedBuffer
}
const uploadR2=async(buffer:Buffer):Promise<{url:string,keyName:string}>=>{
    const fileName=`${crypto.randomBytes(16).toString("hex")}.jpg`
    const keyName=`food/${fileName}`
    try {
        const command=new PutObjectCommand({
            Bucket:r2Config.bucketName,
            Key:keyName,
            Body:buffer,
            ContentType:"image/jpeg", 
        })
        const result=await r2Config.client.send(command)
        return {
            url:`${r2Config.publicUrl}/${keyName}`,
            keyName
        }
    } catch (error) {
        console.log("error uploading image",error)
        throw error
    }
}
export const footScanner=async(req:Request,res:Response):Promise<void>=>{
    try {
    const file=req.file
    if(!file){
        res.status(400).json({message:"please upload a file"})
        return
    }
    const image=file.buffer
    console.log("optimizing image")
    const optimizedImage=await optimizeImage(image)
    console.log("uploading image")
    const {url,keyName}=await uploadR2(optimizedImage)
    console.log("analyzing image")
    const foodAnalysis=await analyzeFood(url)
    const foodEntry=await FoodEntry.create({
        userId:req.user?._id,
        foodName:foodAnalysis.foodName,
        calories:foodAnalysis.calories,
        protein:foodAnalysis.protein,
        fat:foodAnalysis.fat,
        carbs:foodAnalysis.carbs,
        mealType:foodAnalysis.mealType,
        imageUrl:url,
        storageKey:keyName
    })
    res.status(200).json({message:"Food scanned successfully",foodEntry})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }
}
export const analyzFoodImage=async(req:Request,res:Response):Promise<void>=>{
    try {
    const file=req.file
    if(!file){
        res.status(400).json({message:"please upload a file"})
        return
    }
    if(!req.user?._id){
        res.status(401).json({message:"Unauthorized"})
        return
    }
    const image=file.buffer
    console.log("optimizing image")
    const optimizedImage=await optimizeImage(image)
    console.log("uploading image")
    const {url,keyName}=await uploadR2(optimizedImage)
    console.log("analyzing image")
    const foodData=await analyzeFood(url)
    const imageBase64=`data:image/jpeg;base64,${optimizedImage.toString("base64")}`
    console.log("imageBase64 encoded")
    res.status(200).json({
        message:"Food scanned successfully",
        foodData,
        imageUrl:url,
        storageKey:keyName,
        imageBase64
    })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }
}
export const safeFoodentry=async(req:Request,res:Response):Promise<void>=>{
    try {
        const{foodName,calories,protein,fat,carbs,mealType,imageUrl,storageKey}=req.body
    if(!foodName||calories===undefined||!imageUrl||!storageKey){
        res.status(400).json({message:"all fields are required except protein,fat and carbs"})
        return
    }
    const foodEntry=await FoodEntry.create({
        userId:req.user?._id,
        foodName:foodName,
        calories,
        protein,
        fat,
        carbs,
        mealType:mealType||"snack",
        imageUrl,
        storageKey
    })
    res.status(200).json({message:"Food scanned successfully",foodEntry})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }
}
export const discardAnalyedFood=async(req:Request,res:Response):Promise<void>=>{
    try {
        const{storageKey}=req.body
        if(!storageKey){
            res.status(400).json({message:"storageKey is required"})
            return
        }
        // delete fromr2
        try {
            const commant=new DeleteObjectCommand({
                Bucket:r2Config.bucketName,
                Key:storageKey
            })
            await r2Config.client.send(commant)
            res.status(200).json({message:"Food deleted successfully"})
        } catch (error) {
            console.log("error deleting image",error)
            res.status(500).json({message:"Something went wrong"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Something went wrong"})
    }
}
export const getEnteries=async(req:Request,res:Response):Promise<void>=>{
    try {
        if(!req.user?._id){
            res.status(401).json({message:"Unauthorized"})
            return
        }
        const{date,startDate,endDate,limit=50}=req.query
        let query:Record<string,unknown>={userId:req.user?._id}
        if(date&&typeof date==="string"){
            const targetDate=new Date(date)
            const startedDate=new Date(targetDate)
            startedDate.setHours(0,0,0,0)
            const endedDate=new Date(targetDate)
            endedDate.setHours(23,59,59,999)
            query.timestamp={$gte:startedDate,$lte:endedDate}
        }
        if(startDate&&typeof startDate==="string"&&endDate&&typeof endDate==="string"){
           query.timestamp={
            $gte:new Date(startDate),
            $lte:new Date(endDate)
           }
        }
        const entries=await FoodEntry.find(query)
        .sort({timestamp:-1})
        .limit(parseInt(limit as string))
        res.json({entries})
    } catch (error) {
        console.log(error)
        const errorMessage=error instanceof Error?error.message:"unknown error"
        res.status(500).json({message:errorMessage})
    }
}