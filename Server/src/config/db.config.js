
import mongoose from "mongoose";

const connectDB = async () => {
  // If already connected or connecting, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

export default connectDB;
