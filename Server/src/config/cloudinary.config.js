import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

export const getCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new ApiError(
      500,
      "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Server/.env.",
    );
  }

  cloudinary.config({ cloud_name, api_key, api_secret });
  return cloudinary;
};
