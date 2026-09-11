/**
 * Server Startup & Listener Entry Point
 * Initializes HTTP server, database connections, and exports app for Vercel serverless.
 */
import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.config.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
