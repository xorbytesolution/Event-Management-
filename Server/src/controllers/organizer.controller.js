import mongoose from "mongoose";
import Event from "../models/Event.model.js";
import EventSubmission from "../models/EventSubmission.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegex = (string = "") =>
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * List events belonging exclusively to the authenticated organizer.
 * Aggregates both published/approved Events and pending/rejected EventSubmissions.
 * Route: GET /api/organizer/events
 */
export const listOrganizerEvents = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const organizerEmail = req.user.email?.toLowerCase();
  const organizerPhone = req.user.phone;
  const search = req.query.search?.trim() || "";
  const status = req.query.status?.trim()?.toLowerCase() || "";

  // 1. Filter for approved Events
  const eventFilter = {
    organizerId,
    deletedAt: null,
  };

  if (status && status !== "all") {
    eventFilter.approvalStatus = status;
  }

  // 2. Filter for EventSubmissions (pending, under_review, rejected)
  const submissionConditions = [];
  if (organizerEmail) {
    submissionConditions.push({ organizerEmail });
  }
  if (organizerPhone) {
    submissionConditions.push({ organizerPhone });
  }

  const subFilter = {
    $or: submissionConditions.length > 0 ? submissionConditions : [{ organizerEmail: "__none__" }],
  };

  if (status && status !== "all") {
    if (status === "pending") {
      subFilter.status = { $in: ["pending", "under_review"] };
    } else if (status === "rejected") {
      subFilter.status = "rejected";
    } else {
      // e.g. status === "approved" - submissions are not included here
      subFilter.status = "__no_match__";
    }
  } else {
    // For "all" or omitted, fetch pending, under_review, and rejected submissions
    subFilter.status = { $in: ["pending", "under_review", "rejected"] };
  }

  const shouldFetchEvents = !status || status === "all" || status === "approved";
  const shouldFetchSubmissions = !status || status === "all" || status === "pending" || status === "rejected";

  const [events, submissions] = await Promise.all([
    shouldFetchEvents
      ? Event.find(eventFilter).sort({ createdAt: -1 }).select("-deletedBy -deletedAt")
      : Promise.resolve([]),
    shouldFetchSubmissions
      ? EventSubmission.find(subFilter).sort({ createdAt: -1 })
      : Promise.resolve([]),
  ]);

  // Format submissions to align with Event shape
  const formattedSubmissions = submissions.map((sub) => ({
    _id: sub._id,
    publicId: `SUB-${sub._id.toString().slice(-6).toUpperCase()}`,
    title: sub.title,
    description: sub.description || sub.highlights || "",
    eventType: sub.eventType,
    city: sub.city,
    address: sub.venue,
    venue: sub.venue,
    venueType: sub.venueType,
    startDate: sub.startDate,
    endDate: sub.endDate,
    posterImage: sub.posterImage,
    floorPlanImage: sub.floorPlanImage,
    facilities: sub.facilities || [],
    stallSetup: sub.stallSetup,
    totalStalls: sub.totalStalls,
    availableStalls: sub.availableStalls,
    expectedVisitors: sub.expectedVisitors,
    highlights: sub.highlights,
    categories: sub.categories || [],
    approvalStatus: sub.status === "under_review" ? "pending" : sub.status,
    rawStatus: sub.status,
    isSubmission: true,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  }));

  let allEvents = [...events, ...formattedSubmissions];

  // Apply search query if provided
  if (search) {
    const searchLower = search.toLowerCase();
    allEvents = allEvents.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const city = (item.city || "").toLowerCase();
      const publicId = (item.publicId || "").toLowerCase();
      const categories = Array.isArray(item.categories)
        ? item.categories.join(" ").toLowerCase()
        : "";
      return (
        title.includes(searchLower) ||
        city.includes(searchLower) ||
        publicId.includes(searchLower) ||
        categories.includes(searchLower)
      );
    });
  }

  // Sort descending by creation date
  allEvents.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );

  res.json({
    events: allEvents,
    total: allEvents.length,
  });
});

/**
 * Get a specific event, verifying that it belongs to the authenticated organizer.
 * Checks Event collection first, then falls back to EventSubmission collection.
 * Route: GET /api/organizer/events/:eventId
 */
export const getOrganizerEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const isObjectId = mongoose.Types.ObjectId.isValid(eventId);

  // 1. Try finding in Event collection
  const event = await Event.findOne({
    $or: [
      ...(isObjectId ? [{ _id: eventId }] : []),
      { publicId: eventId },
    ],
    deletedAt: null,
  }).select("-deletedBy -deletedAt");

  if (event) {
    if (
      !event.organizerId ||
      event.organizerId.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, "You are not authorized to view or access this event");
    }
    return res.json({ event });
  }

  // 2. Try finding in EventSubmission collection
  const userEmail = req.user.email?.toLowerCase();
  const userPhone = req.user.phone;

  let submission = null;
  if (isObjectId) {
    submission = await EventSubmission.findById(eventId);
  } else if (typeof eventId === "string" && eventId.startsWith("SUB-")) {
    const suffix = eventId.replace("SUB-", "").toLowerCase();
    // Search user's submissions to find matching suffix
    const userSubmissions = await EventSubmission.find({
      $or: [
        { organizerEmail: userEmail },
        ...(userPhone ? [{ organizerPhone: userPhone }] : []),
      ],
    });
    submission = userSubmissions.find(
      (s) => s._id.toString().slice(-6).toLowerCase() === suffix,
    ) || null;
  }

  if (submission) {
    const isOwner =
      submission.organizerEmail?.toLowerCase() === userEmail ||
      (userPhone && submission.organizerPhone === userPhone);

    if (!isOwner) {
      throw new ApiError(403, "You are not authorized to view this event submission");
    }

    const formattedSubmission = {
      ...submission.toObject(),
      publicId: `SUB-${submission._id.toString().slice(-6).toUpperCase()}`,
      address: submission.venue,
      approvalStatus: submission.status === "under_review" ? "pending" : submission.status,
      rawStatus: submission.status,
      isSubmission: true,
    };

    return res.json({ event: formattedSubmission });
  }

  throw new ApiError(404, "Event not found");
});
