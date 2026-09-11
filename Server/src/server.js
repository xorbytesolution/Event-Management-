/**
 * Server Startup & Listener Entry Point
 * Initializes HTTP server, database connections, WebSockets, and handles process signals for graceful shutdown.
 */
import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.config.js";

// Load environment variables
dotenv.config();

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGODB_URI and JWT_SECRET must be set in .env");
}

// Connect to MongoDB
await connectDB();

// Start Express server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
