import mongoose from "mongoose";
import Event from "../models/Event.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listPublishedEvents = asyncHandler(async (req, res) => {
  const filter = {
    approvalStatus: "approved",
    isPublished: true,
    deletedAt: null,
    // Only include events that have not yet ended and are not archived
    endDate: { $gte: new Date() },
    isArchived: false,
  };
  if (req.query.city)
    filter.city = new RegExp(`^${req.query.city.trim()}$`, "i");
  const events = await Event.find(filter)
    .sort({ startDate: 1 })
    .limit(100)
    .select("-deletedBy -deletedAt");
  res.json({ events });
});

// Server/src/controllers/event.controller.js
export const getPublishedEvent = asyncHandler(async (req, res) => {
  const identifier = req.params.publicId;
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

  const event = await Event.findOne({
    $or: [
      { publicId: identifier },
      ...(isObjectId ? [{ _id: identifier }] : []),
    ],
    approvalStatus: "approved",
    isPublished: true,
    deletedAt: null,
    // Ensure the event hasn't expired
    endDate: { $gte: new Date() },
    isArchived: false,
  }).select("-deletedBy -deletedAt");

  if (!event) throw new ApiError(404, "Event not found");
  res.json({ event });
});

// New endpoint: Return past (expired) events for organizers
export const getPastEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  const pastEvents = await Event.find({
    endDate: { $lt: now },
    // Keep archived flag for consistency
    isArchived: true,
  })
    .sort({ endDate: -1 })
    .select("-deletedBy -deletedAt");
  res.json({ events: pastEvents });
});
