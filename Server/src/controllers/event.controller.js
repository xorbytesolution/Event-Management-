import mongoose from "mongoose";
import Event from "../models/Event.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listPublishedEvents = asyncHandler(async (req, res) => {
  const filter = {
    approvalStatus: "approved",
    isPublished: true,
    deletedAt: null,
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
  }).select("-deletedBy -deletedAt");

  if (!event) throw new ApiError(404, "Event not found");
  res.json({ event });
});
