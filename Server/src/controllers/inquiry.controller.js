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

  // Prevent Self-Inquiry: Organizers cannot send stall inquiries for their own events
  const isSelfInquiry =
    (organizerId && organizerId.toString() === exhibitorId.toString()) ||
    (event.organizerId && event.organizerId.toString() === exhibitorId.toString()) ||
    (event.organizerEmail && event.organizerEmail.toLowerCase() === req.user.email?.toLowerCase()) ||
    (event.organizerPhone && event.organizerPhone === req.user.phone);

  if (isSelfInquiry) {
    throw new ApiError(
      400,
      "You cannot submit a stall inquiry for an event that you host. Please manage stalls from your Organizer Portal.",
    );
  }

  // Prevent Duplicate Inquiries: Check if an active inquiry already exists for this exhibitor + event
  const existingActiveInquiry = await Inquiry.findOne({
    eventId: event._id,
    exhibitorId,
    deletedAt: null,
    status: { $in: ["new", "accepted", "booked"] },
  }).sort({ createdAt: -1 });

  if (existingActiveInquiry) {
    if (existingActiveInquiry.status === "booked") {
      throw new ApiError(
        400,
        "Stall Confirmed & Booked! You already have an allocated stall for this event.",
      );
    }
    if (existingActiveInquiry.status === "accepted") {
      throw new ApiError(
        400,
        "Stall Inquired & Accepted! Organizer will contact you.",
      );
    }
    throw new ApiError(
      400,
      "Inquiry Already Submitted (Status: Pending Review). Please wait for the organizer to review your request.",
    );
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
      .populate("eventId", "title publicId city startDate endDate posterImage totalStalls availableStalls")
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
    booked: 0,
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
 * Update the status of an inquiry (e.g. accepted, rejected, booked, closed).
 * If status is set to "booked", deducts the requested stall count from the event.
 * If a previously "booked" inquiry is rejected/cancelled, restores the stalls to the event.
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
  });

  if (!inquiry) {
    throw new ApiError(
      404,
      "Inquiry not found or you do not have permission to update it.",
    );
  }

  const event = await Event.findById(inquiry.eventId);
  if (!event) {
    throw new ApiError(404, "Associated event could not be found.");
  }

  const previousStatus = inquiry.status;
  const previousStallsBooked = inquiry.stallsBooked || 0;

  // Case 1: Marking as Booked / Converted (Stage 2)
  if (input.status === "booked") {
    const requestedStalls = input.stallsBooked || 1;

    if (previousStatus === "booked") {
      const diff = requestedStalls - previousStallsBooked;
      if (diff > 0 && event.availableStalls < diff) {
        throw new ApiError(
          400,
          `Cannot allocate ${requestedStalls} stalls. Only ${event.availableStalls} additional stall(s) available.`,
        );
      }
      event.availableStalls = Math.max(0, event.availableStalls - diff);
    } else {
      if (event.availableStalls < requestedStalls) {
        throw new ApiError(
          400,
          `Cannot allocate ${requestedStalls} stalls. Only ${event.availableStalls} stall(s) currently available.`,
        );
      }
      event.availableStalls = Math.max(0, event.availableStalls - requestedStalls);
    }

    await event.save();

    inquiry.status = "booked";
    inquiry.stallsBooked = requestedStalls;
    inquiry.bookedAt = new Date();
    if (input.bookingNotes !== undefined) {
      inquiry.bookingNotes = input.bookingNotes;
    }
  }
  // Case 2: Status changed AWAY from "booked" (e.g. cancelled/rejected deal)
  else if (previousStatus === "booked" && previousStallsBooked > 0) {
    // Restore the stalls back to event availability
    event.availableStalls = Math.min(
      event.totalStalls,
      event.availableStalls + previousStallsBooked,
    );
    await event.save();

    inquiry.status = input.status;
    inquiry.stallsBooked = 0;
    inquiry.bookedAt = null;
    if (input.bookingNotes !== undefined) {
      inquiry.bookingNotes = input.bookingNotes;
    }
  }
  // Case 3: Standard lead status change (new -> accepted, new -> rejected, etc.)
  // Does NOT alter event stall count (Stage 1)
  else {
    inquiry.status = input.status;
    if (input.bookingNotes !== undefined) {
      inquiry.bookingNotes = input.bookingNotes;
    }
  }

  inquiry.updatedBy = organizerId;
  await inquiry.save();

  await inquiry.populate(
    "eventId",
    "title publicId city startDate endDate posterImage totalStalls availableStalls",
  );

  res.json({
    message:
      input.status === "booked"
        ? `Inquiry marked as Booked & ${inquiry.stallsBooked} stall(s) allocated successfully.`
        : `Inquiry marked as ${input.status} successfully.`,
    inquiry,
    event: {
      _id: event._id,
      totalStalls: event.totalStalls,
      availableStalls: event.availableStalls,
    },
  });
});

/**
 * Check if the authenticated exhibitor has an existing inquiry for a specific event
 * Route: GET /api/inquiries/check/:eventId
 */
export const checkEventInquiry = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const exhibitorId = req.user._id;

  const isObjectId = mongoose.Types.ObjectId.isValid(eventId);
  const event = await Event.findOne({
    $or: [
      ...(isObjectId ? [{ _id: eventId }] : []),
      { publicId: eventId },
    ],
    deletedAt: null,
  });

  if (!event) {
    throw new ApiError(404, "Event not found or no longer active.");
  }

  const inquiry = await Inquiry.findOne({
    eventId: event._id,
    exhibitorId,
    deletedAt: null,
  }).sort({ createdAt: -1 });

  if (!inquiry) {
    return res.status(200).json({
      hasInquiry: false,
      canSubmit: true,
      inquiry: null,
    });
  }

  // If status is new (Pending Review)
  if (inquiry.status === "new") {
    return res.status(200).json({
      hasInquiry: true,
      canSubmit: false,
      status: "new",
      message: "Inquiry Already Submitted (Status: Pending Review)",
      inquiry: {
        id: inquiry._id,
        status: inquiry.status,
        category: inquiry.category,
        createdAt: inquiry.createdAt,
      },
    });
  }

  // If status is booked
  if (inquiry.status === "booked") {
    return res.status(200).json({
      hasInquiry: true,
      canSubmit: false,
      status: "booked",
      message: `Stall Confirmed & Booked! (${inquiry.stallsBooked || 1} stall(s) allocated)`,
      inquiry: {
        id: inquiry._id,
        status: inquiry.status,
        category: inquiry.category,
        stallsBooked: inquiry.stallsBooked || 1,
        bookedAt: inquiry.bookedAt,
        createdAt: inquiry.createdAt,
      },
    });
  }

  // If status is accepted
  if (inquiry.status === "accepted") {
    return res.status(200).json({
      hasInquiry: true,
      canSubmit: false,
      status: "accepted",
      message: "Stall Inquired & Accepted! Organizer will contact you.",
      inquiry: {
        id: inquiry._id,
        status: inquiry.status,
        category: inquiry.category,
        createdAt: inquiry.createdAt,
      },
    });
  }

  // If status is rejected or closed, allow fresh inquiry
  return res.status(200).json({
    hasInquiry: true,
    canSubmit: true,
    status: inquiry.status,
    message: "Previous inquiry was declined. You can submit a fresh inquiry.",
    inquiry: {
      id: inquiry._id,
      status: inquiry.status,
      category: inquiry.category,
      createdAt: inquiry.createdAt,
    },
  });
});

/**
 * List all inquiries submitted by the authenticated exhibitor
 * Route: GET /api/inquiries/my-inquiries
 */
export const getMyInquiries = asyncHandler(async (req, res) => {
  const exhibitorId = req.user._id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
  const status = req.query.status?.trim()?.toLowerCase();
  const search = req.query.search?.trim();

  const filter = {
    exhibitorId,
    deletedAt: null,
  };

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const matchingEvents = await Event.find({
      $or: [{ title: searchRegex }, { city: searchRegex }, { venue: searchRegex }],
    }).select("_id");
    const matchingEventIds = matchingEvents.map((e) => e._id);

    filter.$or = [
      { eventId: { $in: matchingEventIds } },
      { category: searchRegex },
      { message: searchRegex },
    ];
  }

  const [total, inquiries, statusCounts] = await Promise.all([
    Inquiry.countDocuments(filter),
    Inquiry.find(filter)
      .populate(
        "eventId",
        "title publicId slug city state startDate endDate posterImage venue address totalStalls availableStalls",
      )
      .populate("organizerId", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Inquiry.aggregate([
      { $match: { exhibitorId, deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const aggregates = {
    all: 0,
    new: 0,
    accepted: 0,
    booked: 0,
    rejected: 0,
  };

  for (const item of statusCounts) {
    aggregates.all += item.count;
    if (aggregates[item._id] !== undefined) {
      aggregates[item._id] = item.count;
    }
  }

  res.status(200).json({
    inquiries,
    aggregates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

