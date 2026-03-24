import mongoose from "mongoose";
import { config } from "./config.js";

// 1. Create a variable OUTSIDE the function to cache the connection
let isConnected = false;

const connectDb = async (): Promise<void> => {
    // 2. If already connected, don't try again (This is the "Forever" fix)
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        const url = config.mongodbUri;
        if (!url) {
            throw new Error("MONGODB_URL not found");
        }

        // 3. Add timeouts so it doesn't "buffer" forever
        const db = await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000, // Fail after 5s instead of 30s
            socketTimeoutMS: 45000,
        });

        isConnected = !!db.connections[0].readyState;
        console.log("Database connected successfully");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "error connection database";
        console.log(errorMessage, "error connection database");
        // Don't set isConnected to true if it fails
        isConnected = false;
        throw error; // Important to throw so the server knows it failed
    }
};

export default connectDb;