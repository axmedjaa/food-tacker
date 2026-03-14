import dotenv from "dotenv";
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || "3000"),
    mongodbUri: process.env.NODE_ENV === "production" ? process.env.MONGODB_URL_BRO : process.env.MONGODB_URL_DEV,
    jwtSecret: process.env.JWt_Token,
    openaiApiKey: process.env.OPENAI_API_KEY,
    r2BucketName: process.env.R2_BUCKET_NAME,
    r2AccessKeyId: process.env.R2_ACCESS_KEY,
    r2SecretAccessKey: process.env.R2_SECRET_KEY,
    r2AccountId: process.env.R2_ACCOUNT_ID,
    r2PublicUrl: process.env.OPENAI_API_KEY,
}
