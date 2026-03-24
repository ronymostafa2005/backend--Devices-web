
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

// get the mongo uri
export const mongoUri = () => {
    const base = (process.env.MONGODB_URI || "").replace(/\/+$/, "");
    return `${base}/${DB_NAME}`;
};

// connect to the database
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(mongoUri());
        console.log(
            `\n MongoDB connected successfully to host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;
