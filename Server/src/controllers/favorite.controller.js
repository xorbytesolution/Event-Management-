import mongoose from "mongoose";
import User from "../models/User.model.js";
import Event from "../models/Event.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Toggle favorite status of an event for the authenticated user
 * POST /api/favorites/toggle/:eventId
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  // Ensure the event exists and is not deleted
  const event = await Event.findOne({
    _id: eventId,
    deletedAt: null,
  });

  if (!event) {
    throw new ApiError(404, "Event not found or has been removed");
  }

  const userId = req.user._id;
  const user = await User.findById(userId).select("favorites");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFavorited = user.favorites.some(
    (favId) => favId.toString() === eventId,
  );

  let updatedUser;
  let isFavorite;
  let message;

  if (alreadyFavorited) {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: eventId } },
      { new: true },
    ).select("favorites");
    isFavorite = false;
    message = "Event removed from your favorites";
  } else {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: eventId } },
      { new: true },
    ).select("favorites");
    isFavorite = true;
    message = "Event saved to your favorites";
  }

  res.status(200).json({
    success: true,
    isFavorite,
    favorites: updatedUser.favorites,
    message,
  });
});

/**
 * Get all favorited events for the authenticated user
 * GET /api/favorites
 */
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "favorites",
    match: { deletedAt: null },
    select:
      "title description venue venueType city startDate endDate totalStalls availableStalls expectedVisitors posterUrl categories eventType status organizerName organizerPhone organizerEmail isFeatured",
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Filter out any null entries if an event was deleted
  const activeFavorites = (user.favorites || []).filter(Boolean);

  res.status(200).json({
    success: true,
    count: activeFavorites.length,
    favorites: activeFavorites,
  });
});

/**
 * Remove an event from favorites
 * DELETE /api/favorites/:eventId
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: eventId } },
    { new: true },
  ).select("favorites");

  res.status(200).json({
    success: true,
    favorites: updatedUser?.favorites || [],
    message: "Event removed from your favorites",
  });
});
