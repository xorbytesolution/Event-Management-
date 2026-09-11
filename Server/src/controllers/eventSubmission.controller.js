import EventSubmission from "../models/EventSubmission.model.js";
import Event from "../models/Event.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import submissionSchema from "../validations/eventSubmission.validation.js";
import { uploadImageBuffer } from "../utils/cloudinaryUpload.js";
import { z } from "zod";
import { provisionOrganizer } from "../services/organizerProvisioning.service.js";

const parseJsonField = (value, fieldName) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    throw new ApiError(400, `Invalid ${fieldName} payload`);
  }
};

const getUploadedFile = (files, fieldName) => files?.[fieldName]?.[0] || null;

export const createSubmission = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  body.categories = parseJsonField(body.categories, "categories");
  body.facilities = parseJsonField(body.facilities, "facilities");
  body.stallSetup = parseJsonField(body.stallSetup, "stallSetup");

  delete body.posterImage;
  delete body.floorPlanImage;

  const input = submissionSchema.parse(body);

  if (req.user) {
    // If the submission is made while logged in, enforce the authenticated user's identity
    input.organizerEmail = req.user.email;
    if (req.user.phone) {
      input.organizerPhone = req.user.phone;
    }
  }

  const duplicateSubmission = await EventSubmission.findOne({
    organizerPhone: input.organizerPhone,
    title: input.title,
    city: input.city,
    startDate: { $lte: input.endDate },
    endDate: { $gte: input.startDate },
    status: { $in: ["pending", "under_review", "approved"] },
  });

  if (duplicateSubmission) {
    throw new ApiError(
      409,
      "An event with the same name already exists for this organizer during these dates.",
    );
  }

  const files = req.files || {};
  const posterFile = getUploadedFile(files, "posterImage");
  const floorPlanFile = getUploadedFile(files, "floorPlanImage");

  const [posterImage, floorPlanImage] = await Promise.all([
    posterFile
      ? uploadImageBuffer(posterFile.buffer, "event-management/posters")
      : Promise.resolve(null),
    floorPlanFile
      ? uploadImageBuffer(floorPlanFile.buffer, "event-management/floor-plans")
      : Promise.resolve(null),
  ]);

  const submission = await EventSubmission.create({
    ...input,
    submittedBy: req.user?._id || null,
    posterImage,
    floorPlanImage,
  });
  res.status(201).json({
    message: "Your event has been submitted for verification",
    submissionId: submission._id,
    status: submission.status,
  });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";

  if (
    !["pending", "under_review", "approved", "rejected", "all"].includes(status)
  ) {
    throw new ApiError(400, "Invalid status filter");
  }

  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );

  const filter = status === "all" ? {} : { status };

  const [submissions, total] = await Promise.all([
    EventSubmission.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    EventSubmission.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  const action = z.enum(["under_review", "rejected"]).parse(req.body.action);
  const notes = z
    .string()
    .trim()
    .max(2000)
    .optional()
    .parse(req.body.adminNotes);
  const submission = await EventSubmission.findById(req.params.submissionId);
  if (!submission) throw new ApiError(404, "Event submission not found");
  if (submission.status === "approved")
    throw new ApiError(409, "This submission has already been approved");
  submission.status = action;
  submission.adminNotes = notes || null;
  submission.reviewedBy = req.user._id;
  submission.reviewedAt = new Date();
  await submission.save();
  res.json({ message: "Submission updated", submission });
});

export const approveSubmission = asyncHandler(async (req, res) => {
  const submission = await EventSubmission.findById(req.params.submissionId);
  if (!submission) throw new ApiError(404, "Event submission not found");
  if (submission.status === "approved") {
    throw new ApiError(409, "This submission has already been approved");
  }

  // 1. Provision or link the organizer user and profile
  const {
    user: organizer,
    isNewUser,
    temporaryPassword,
    cleanup: rollbackOrganizer,
  } = await provisionOrganizer({
    organizerName: submission.organizerName,
    organizerEmail: submission.organizerEmail,
    organizerPhone: submission.organizerPhone,
    adminId: req.user._id,
  });

  let createdEvent = null;

  try {
    // 2. Prevent duplicate event if already created for this submission
    const existingEvent = await Event.findOne({ submissionId: submission._id });
    if (existingEvent) {
      throw new ApiError(
        409,
        "An event has already been created and published for this submission."
      );
    }

    let publicId = `EVT-${submission._id.toString().slice(-6).toUpperCase()}`;
    const publicIdConflict = await Event.findOne({ publicId });
    if (publicIdConflict) {
      publicId = `EVT-${submission._id.toString().slice(-8).toUpperCase()}`;
    }

    const cleanPhone =
      (submission.organizerPhone || "").replace(/\D/g, "").slice(-10) ||
      (organizer.phone || "").replace(/\D/g, "").slice(-10) ||
      "9999999999";

    const venueAddress =
      submission.venue && submission.venue.trim().length >= 3
        ? submission.venue.trim()
        : `${submission.venue || "Venue"} location`;

    const cleanStallOptions = (submission.stallSetup?.options || []).map(
      (opt) => ({
        stallType: opt.stallType,
        tables: opt.tables ?? 0,
        chairs: opt.chairs ?? 0,
        priceForEvent: opt.priceForEvent,
        pricePerDay: opt.pricePerDay || null,
      })
    );

    createdEvent = await Event.create({
      publicId,
      organizerId: organizer._id,
      submissionId: submission._id,
      organizerName: submission.organizerName,
      organizerPhone: cleanPhone,
      organizerEmail: submission.organizerEmail,
      title: submission.title,
      description:
        submission.description?.trim() ||
        submission.highlights?.trim() ||
        "Event details will be updated shortly.",
      eventType: submission.eventType,
      city: submission.city,
      address: venueAddress,
      startDate: submission.startDate,
      endDate: submission.endDate,
      posterImage: submission.posterImage || null,
      floorPlanImage: submission.floorPlanImage || null,
      facilities: submission.facilities || [],
      stallSetup: {
        model: submission.stallSetup?.model || "Open Table",
        options: cleanStallOptions,
      },
      totalStalls: submission.totalStalls,
      availableStalls: submission.availableStalls,
      venueType: submission.venueType,
      expectedVisitors: submission.expectedVisitors?.trim() || null,
      highlights: submission.highlights?.trim() || null,
      categories: submission.categories || [],
      approvalStatus: "approved",
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // 3. Mark the submission approved and link published event
    submission.status = "approved";
    submission.adminNotes = req.body?.adminNotes?.trim() || null;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.publishedEventId = createdEvent._id;
    await submission.save();
  } catch (error) {
    console.error("Error creating/approving event in approveSubmission:", error);
    // Failure protection / rollback logic
    if (createdEvent?._id) {
      await Event.findByIdAndDelete(createdEvent._id).catch(() => {});
    }
    if (typeof rollbackOrganizer === "function") {
      await rollbackOrganizer().catch(() => {});
    }
    throw error;
  }

  // 4. Return complete response for admin/Postman
  res.status(200).json({
    message: "Event approved and published successfully",
    event: createdEvent,
    organizer: {
      id: organizer._id,
      name: organizer.name,
      email: organizer.email,
      phone: organizer.phone,
      roles: organizer.roles,
    },
    isNewOrganizer: isNewUser,
    credentials: isNewUser
      ? {
          email: organizer.email,
          temporaryPassword,
        }
      : null,
  });
});
