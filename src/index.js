import dotenv from "dotenv";
dotenv.config({ path: ".env" });

if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in .env");
    process.exit(1);
}

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }).on("error", (err) => {
            console.log("Error in server", err);
            process.exit(1);
        });
    } catch (err) {
        console.log("Error starting server", err);
        process.exit(1);
    }
};

startServer();
