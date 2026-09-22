import mongoose from "mongoose";
import Event from "../models/Event.model.js";
import Inquiry from "../models/Inquiry.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from "../validations/inquiry.validation.js";

/**
 * Submit an inquiry to an event organizer.
 * Accessible to authenticated exhibitors.
 * Route: POST /api/inquiries
 */
export const createInquiry = asyncHandler(async (req, res) => {
  const input = createInquirySchema.parse(req.body);
  const exhibitorId = req.user._id;

  const isObjectId = mongoose.Types.ObjectId.isValid(input.eventId);
  const event = await Event.findOne({
    $or: [
      ...(isObjectId ? [{ _id: input.eventId }] : []),
      { publicId: input.eventId },
    ],
    deletedAt: null,
  });

  if (!event) {
    throw new ApiError(404, "Event not found or no longer active.");
  }

  // Determine organizerId from event
  let organizerId = event.organizerId || event.createdBy;

  // Fallback: If organizerId is missing from Event, try looking up user by organizerEmail / organizerPhone
  if (!organizerId) {
    const organizerUser = await User.findOne({
      $or: [
        ...(event.organizerEmail ? [{ email: event.organizerEmail.toLowerCase() }] : []),
        ...(event.organizerPhone ? [{ phone: event.organizerPhone }] : []),
      ],
      roles: "organizer",
      deletedAt: null,
    });
    if (organizerUser) {
      organizerId = organizerUser._id;
    }
  }

  if (!organizerId) {
    throw new ApiError(400, "Unable to identify the organizer for this event.");
  }

  const inquiry = await Inquiry.create({
    eventId: event._id,
    organizerId,
    exhibitorId,
    firstName: input.firstName,
    lastName: input.lastName || "",
    email: input.email.toLowerCase(),
    phone: input.phone,
    gender: input.gender,
    category: input.category,
    message: input.message || "",
    status: "new",
    createdBy: exhibitorId,
  });

  res.status(201).json({
    message: "Inquiry submitted successfully! The organizer will get in touch with you shortly.",
    inquiry: {
      id: inquiry._id,
      eventId: event._id,
      eventTitle: event.title,
      category: inquiry.category,
      createdAt: inquiry.createdAt,
    },
  });
});

/**
 * List all inquiries received by the authenticated organizer.
 * Route: GET /api/organizer/inquiries
 */
export const getOrganizerInquiries = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const status = req.query.status?.trim()?.toLowerCase();
  const search = req.query.search?.trim();

  const filter = {
    organizerId,
    deletedAt: null,
  };

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { category: searchRegex },
      { message: searchRegex },
    ];
  }

  // Aggregate counts across all inquiries for this organizer
  const [total, inquiries, statusCounts] = await Promise.all([
    Inquiry.countDocuments(filter),
    Inquiry.find(filter)
      .populate("eventId", "title publicId city startDate endDate posterImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Inquiry.aggregate([
      { $match: { organizerId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const aggregates = {
    all: 0,
    new: 0,
    accepted: 0,
    rejected: 0,
  };

  for (const item of statusCounts) {
    aggregates.all += item.count;
    if (aggregates[item._id] !== undefined) {
      aggregates[item._id] = item.count;
    }
  }

  const totalPages = Math.ceil(total / limit);

  res.json({
    inquiries,
    aggregates,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

/**
 * Update the status of an inquiry (e.g. accepted, rejected, contacted, closed).
 * Accessible to authenticated organizers who own the inquiry.
 * Route: PATCH /api/organizer/inquiries/:id/status
 */
export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const input = updateInquiryStatusSchema.parse(req.body);
  const organizerId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid inquiry ID format.");
  }

  const inquiry = await Inquiry.findOne({
    _id: id,
    organizerId,
    deletedAt: null,
  }).populate("eventId", "title publicId city startDate endDate posterImage");

  if (!inquiry) {
    throw new ApiError(
      404,
      "Inquiry not found or you do not have permission to update it.",
    );
  }

  inquiry.status = input.status;
  inquiry.updatedBy = organizerId;
  await inquiry.save();

  res.json({
    message: `Inquiry marked as ${input.status} successfully.`,
    inquiry,
  });
});

