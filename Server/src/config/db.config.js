
import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  // If connection is already established, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const errorMsg = "MONGODB_URI environment variable is missing in Vercel settings.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
    if (process.env.VERCEL) {
      const errorMsg =
        "Invalid MONGODB_URI on Vercel: localhost/127.0.0.1 cannot be reached from cloud serverless functions. Please use MongoDB Atlas connection string.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  try {
    cachedConnection = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await cachedConnection;
    console.log("MongoDB connected successfully");
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;

