import mongoose from "mongoose";
import { ZodError } from "zod";

export const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  // -------------------------
  // Zod validation error
  // -------------------------
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Please correct the highlighted fields.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // -------------------------
  // Mongoose validation error
  // -------------------------
  if (
    error.name === "ValidationError" ||
    error instanceof mongoose.Error.ValidationError
  ) {
    const errors = {};

    if (error.errors) {
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
    }

    return res.status(400).json({
      message: error.message || "Please correct the submitted data.",
      errors,
    });
  }

  // -------------------------
  // MongoDB duplicate key
  // -------------------------
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];

    return res.status(409).json({
      message: field
        ? `${field} already exists.`
        : "This record already exists.",
      field,
    });
  }

  // -------------------------
  // Invalid MongoDB ObjectId
  // -------------------------
  if (error instanceof mongoose.Error.CastError || error.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${error.path || "resource ID"}: ${error.value}`,
    });
  }

  // -------------------------
  // Application error
  // -------------------------
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  // -------------------------
  // Unknown/server error
  // -------------------------
  return res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on the server. Please try again later."
        : error.message || "Something went wrong on the server. Please try again later.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
