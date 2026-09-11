import jwt from "jsonwebtoken";

import User from "../models/User.model.js";

import ApiError from "../utils/ApiError.js";

import asyncHandler from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  // Read JWT from the HttpOnly cookie
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(401, "Please log in to continue");
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Your session is invalid or has expired");
  }

  const user = await User.findById(payload.userId).select("-password");

  if (!user || user.deletedAt || user.accountStatus !== "active") {
    throw new ApiError(401, "This account is not available");
  }

  req.user = user;

  next();
});

export const allowRoles =
  (...roles) =>
  (req, res, next) => {
    const hasRequiredRole = roles.some(
      (role) => req.user.roles?.includes(role) || req.user.role === role,
    );

    if (!hasRequiredRole) {
      throw new ApiError(403, "You do not have permission for this action");
    }

    next();
  };

export const requireAdminAuth = asyncHandler(async (req, res, next) => {
  // Read JWT from the dedicated adminAccessToken HttpOnly cookie
  const token = req.cookies.adminAccessToken;

  if (!token) {
    throw new ApiError(401, "Please log in to the administrator portal");
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Your admin session is invalid or has expired");
  }

  const user = await User.findById(payload.userId).select("-password");

  if (!user || user.deletedAt || user.accountStatus !== "active") {
    throw new ApiError(401, "This administrator account is not available");
  }

  const hasAdminRole = user.roles?.includes("admin") || user.role === "admin";

  if (!hasAdminRole) {
    throw new ApiError(403, "You do not have administrator permissions");
  }

  req.user = user;

  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (user && !user.deletedAt && user.accountStatus === "active") {
      req.user = user;
    }
  } catch {
    // If token verification fails or expired, proceed as unauthenticated guest
  }

  next();
});

