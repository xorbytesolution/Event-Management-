import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Event from "../models/Event.model.js";
import EventSubmission from "../models/EventSubmission.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ExhibitorProfile from "../models/ExhibitorProfile.model.js";
import OrganizerProfile from "../models/OrganizerProfile.model.js";

import {
  loginSchema,
  updateAdminProfileSchema,
  changeAdminPasswordSchema,
} from "../validations/auth.validation.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const tokenFor = (user) =>
  jwt.sign(
    {
      userId: user._id,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

const setAuthCookie = (res, token) => {
  res.cookie("adminAccessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const admin = await User.findOne({
    email: email.toLowerCase(),
    roles: "admin",
    deletedAt: null,
  });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  if (admin.accountStatus !== "active") {
    throw new ApiError(403, "This account is not active");
  }

  const token = tokenFor(admin);

  setAuthCookie(res, token);

  res.json({
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      roles: admin.roles,
    },
  });
});

export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie("adminAccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({
    message: "Admin logged out successfully",
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalEvents,
    publishedEvents,
    pendingReviews,
    totalExhibitors,
    recentSubmissions,
    recentEvents,
  ] = await Promise.all([
    Event.countDocuments({
      deletedAt: null,
    }),

    Event.countDocuments({
      approvalStatus: "approved",
      isPublished: true,
      deletedAt: null,
    }),

    EventSubmission.countDocuments({
      status: {
        $in: ["pending", "under_review"],
      },
    }),

    User.countDocuments({
      roles: "exhibitor",
      accountStatus: "active",
      deletedAt: null,
    }),

    EventSubmission.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title organizerName city createdAt status"),

    Event.find({
      approvalStatus: "approved",
      isPublished: true,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select(
        "publicId title city startDate endDate approvalStatus isPublished",
      ),
  ]);

  res.json({
    stats: {
      totalEvents,
      publishedEvents,
      pendingReviews,
      totalExhibitors,
    },

    recentSubmissions,

    recentEvents,
  });
});

export const getSubmission = asyncHandler(async (req, res) => {
  const submission = await EventSubmission.findById(
    req.params.submissionId,
  ).select("-__v");

  if (!submission) {
    throw new ApiError(404, "Event submission not found");
  }

  const normalizedEmail = (submission.organizerEmail || "")
    .trim()
    .toLowerCase();
  const normalizedPhone = (submission.organizerPhone || "").trim();

  const userByEmail = normalizedEmail
    ? await User.findOne({ email: normalizedEmail }).select(
        "name email phone roles accountStatus",
      )
    : null;
  const userByPhone = normalizedPhone
    ? await User.findOne({ phone: normalizedPhone }).select(
        "name email phone roles accountStatus",
      )
    : null;

  let accountType = "new_user"; // "new_user" | "existing_exhibitor" | "existing_organizer" | "admin_conflict" | "split_conflict"
  let existingAccount = null;

  if (
    userByEmail &&
    userByPhone &&
    userByEmail._id.toString() !== userByPhone._id.toString()
  ) {
    accountType = "split_conflict";
  } else {
    const matchedUser = userByEmail || userByPhone;
    if (matchedUser) {
      existingAccount = {
        id: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone,
        roles: matchedUser.roles || [],
      };

      const roles = Array.isArray(matchedUser.roles) ? matchedUser.roles : [];
      if (roles.includes("admin")) {
        accountType = "admin_conflict";
      } else if (roles.includes("organizer")) {
        accountType = "existing_organizer";
      } else if (roles.includes("exhibitor")) {
        accountType = "existing_exhibitor";
      } else {
        accountType = "existing_user";
      }
    }
  }

  res.json({
    submission,
    organizerAccountInfo: {
      accountType,
      existingAccount,
    },
  });
});

export const listAdminEvents = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );

  const search = req.query.search?.trim() || "";
  const city = req.query.city?.trim() || "";
  const date = req.query.date || "all";

  if (!["all", "upcoming", "ongoing", "past"].includes(date)) {
    throw new ApiError(400, "Invalid date filter");
  }

  const filter = {
    deletedAt: null,
    approvalStatus: "approved",
    isPublished: true,
  };

  /*
   * Search
   */
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { title: searchRegex },
      { city: searchRegex },
      { organizerName: searchRegex },
      { categories: searchRegex },
    ];
  }

  /*
   * City
   */
  if (city) {
    filter.city = new RegExp(`^${escapeRegex(city)}$`, "i");
  }

  /*
   * Date / event timing
   */
  const now = new Date();

  if (date === "upcoming") {
    filter.startDate = { $gt: now };
  }

  if (date === "ongoing") {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }

  if (date === "past") {
    filter.endDate = { $lt: now };
  }

  const [events, total, aggregateResult] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "publicId title organizerName organizerEmail city address startDate endDate categories totalStalls availableStalls approvalStatus isPublished",
      ),

    Event.countDocuments(filter),

    Event.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: {
              $cond: [{ $gt: ["$startDate", now] }, 1, 0],
            },
          },
          availableStalls: {
            $sum: { $ifNull: ["$availableStalls", 0] },
          },
        },
      },
    ]),
  ]);

  const aggregates = aggregateResult[0] || {
    totalEvents: 0,
    upcomingEvents: 0,
    availableStalls: 0,
  };

  const totalPages = Math.ceil(total / limit);

  res.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    aggregates,
  });
});

export const getAdminEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    deletedAt: null,
    approvalStatus: "approved",
    isPublished: true,
  }).select("-deletedBy -deletedAt -__v");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  res.json({ event });
});

export const listAdminExhibitors = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );

  const search = req.query.search?.trim() || "";
  const category = req.query.category?.trim() || "";
  const accountStatus = req.query.accountStatus?.trim() || "";
  const verified = req.query.verified?.trim() || "";

  // Validate account status filter
  if (
    accountStatus &&
    !["active", "inactive", "suspended"].includes(accountStatus)
  ) {
    throw new ApiError(400, "Invalid account status filter");
  }

  // Validate verification filter
  if (verified && !["true", "false"].includes(verified)) {
    throw new ApiError(400, "Invalid verification filter");
  }

  const userMatch = {
    roles: "exhibitor",
    deletedAt: null,
  };

  // Account status filter
  if (accountStatus) {
    userMatch.accountStatus = accountStatus;
  }

  // Verification filter
  if (verified) {
    userMatch.isVerified = verified === "true";
  }

  const searchRegex = search ? new RegExp(escapeRegex(search), "i") : null;

  const categoryRegex = category
    ? new RegExp(`^${escapeRegex(category)}$`, "i")
    : null;

  const pipeline = [
    {
      $lookup: {
        from: "users",
        let: {
          userId: "$userId",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$userId"],
              },
              ...userMatch,
            },
          },

          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              gender: 1,
              isVerified: 1,
              accountStatus: 1,
              profileImage: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],

        as: "userId",
      },
    },

    {
      $unwind: "$userId",
    },
  ];

  /*
   * Search filter
   *
   * Searches:
   * - exhibitor name
   * - email
   * - phone
   * - category
   */
  if (searchRegex) {
    pipeline.push({
      $match: {
        $or: [
          { "userId.name": searchRegex },
          { "userId.email": searchRegex },
          { "userId.phone": searchRegex },
          { categories: searchRegex },
        ],
      },
    });
  }

  /*
   * Category filter
   *
   * Matches one exact category, case-insensitively.
   */
  if (categoryRegex) {
    pipeline.push({
      $match: {
        categories: categoryRegex,
      },
    });
  }

  pipeline.push({
    $sort: {
      createdAt: -1,
    },
  });

  /*
   * Pagination
   *
   * Filtering happens BEFORE this stage,
   * so pagination and total count are based
   * on the filtered result.
   */
  pipeline.push({
    $facet: {
      exhibitors: [
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ],

      totalCount: [
        {
          $count: "total",
        },
      ],

      aggregates: [
        {
          $group: {
            _id: null,

            totalExhibitors: {
              $sum: 1,
            },

            activeExhibitors: {
              $sum: {
                $cond: [{ $eq: ["$userId.accountStatus", "active"] }, 1, 0],
              },
            },

            verifiedExhibitors: {
              $sum: {
                $cond: [{ $eq: ["$userId.isVerified", true] }, 1, 0],
              },
            },
          },
        },
      ],
    },
  });

  const [result] = await ExhibitorProfile.aggregate(pipeline);

  const exhibitors = result?.exhibitors || [];
  const total = result?.totalCount?.[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const aggregates = result?.aggregates?.[0] || {
    totalExhibitors: 0,
    activeExhibitors: 0,
    verifiedExhibitors: 0,
  };

  res.json({
    exhibitors,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    aggregates,
  });
});

export const getAdminExhibitor = asyncHandler(async (req, res) => {
  const exhibitor = await ExhibitorProfile.findOne({
    userId: req.params.exhibitorId,
  }).populate({
    path: "userId",
    match: {
      roles: "exhibitor",
      deletedAt: null,
    },
    select:
      "name email phone gender roles isVerified accountStatus profileImage createdAt updatedAt",
  });

  if (!exhibitor || !exhibitor.userId) {
    throw new ApiError(404, "Exhibitor not found");
  }

  res.json({
    exhibitor,
  });
});

export const getAdminProfile = asyncHandler(async (req, res) => {
  const adminId = req.user._id || req.user.userId;
  const admin = await User.findOne({
    _id: adminId,
    roles: "admin",
    deletedAt: null,
  }).select("-password -__v");

  if (!admin) {
    throw new ApiError(404, "Admin profile not found");
  }

  res.json({ admin });
});

export const updateAdminProfile = asyncHandler(async (req, res) => {
  const validatedData = updateAdminProfileSchema.parse(req.body);
  const adminId = req.user._id || req.user.userId;

  const admin = await User.findOne({
    _id: adminId,
    roles: "admin",
    deletedAt: null,
  });

  if (!admin) {
    throw new ApiError(404, "Admin profile not found");
  }

  const currentName = (admin.name || "").trim();
  const newName = (validatedData.name || "").trim();
  const currentPhone = (admin.phone || "").trim();
  const newPhone = (validatedData.phone || "").trim();
  const currentImg = admin.profileImage || null;
  const newImg = validatedData.profileImage
    ? validatedData.profileImage.trim()
    : null;

  if (
    currentName === newName &&
    currentPhone === newPhone &&
    currentImg === newImg
  ) {
    throw new ApiError(400, "No changes detected to update.");
  }

  admin.name = newName;
  admin.phone = newPhone;
  admin.profileImage = newImg;

  await admin.save();

  res.json({
    message: "Profile updated successfully",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      profileImage: admin.profileImage,
      roles: admin.roles,
    },
  });
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changeAdminPasswordSchema.parse(
    req.body,
  );
  const adminId = req.user._id || req.user.userId;

  const admin = await User.findOne({
    _id: adminId,
    roles: "admin",
    deletedAt: null,
  });

  if (!admin) {
    throw new ApiError(404, "Admin profile not found");
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    admin.password,
  );

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const isSamePassword = await bcrypt.compare(newPassword, admin.password);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password",
    );
  }

  admin.password = await bcrypt.hash(newPassword, 12);

  await admin.save();

  res.json({
    message: "Password changed successfully",
  });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50,
  );

  const search = req.query.search?.trim() || "";
  const role = req.query.role?.trim() || "all";
  const accountStatus = req.query.accountStatus?.trim() || "";
  const verified = req.query.verified?.trim() || "";

  // Validate account status filter
  if (
    accountStatus &&
    !["active", "inactive", "suspended"].includes(accountStatus)
  ) {
    throw new ApiError(400, "Invalid account status filter");
  }

  // Validate verification filter
  if (verified && !["true", "false"].includes(verified)) {
    throw new ApiError(400, "Invalid verification filter");
  }

  // Base match: non-deleted platform users (exhibitors / organizers)
  const userMatch = {
    deletedAt: null,
    $or: [{ roles: "exhibitor" }, { roles: "organizer" }],
  };

  // Role filters
  if (role === "exhibitor") {
    userMatch.roles = "exhibitor";
  } else if (role === "organizer") {
    userMatch.roles = "organizer";
  } else if (role === "both") {
    userMatch.roles = { $all: ["exhibitor", "organizer"] };
  } else if (role === "exhibitor_only") {
    userMatch.roles = ["exhibitor"];
  } else if (role === "organizer_only") {
    userMatch.roles = ["organizer"];
  }

  // Account status filter
  if (accountStatus) {
    userMatch.accountStatus = accountStatus;
  }

  // Verification filter
  if (verified) {
    userMatch.isVerified = verified === "true";
  }

  // Search filter (name, email, phone)
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    userMatch.$and = userMatch.$and || [];
    userMatch.$and.push({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    });
  }

  const [
    users,
    total,
    totalPlatformUsers,
    exhibitorsCount,
    organizersCount,
    dualRoleCount,
  ] = await Promise.all([
    User.find(userMatch)
      .select(
        "name email phone gender roles isVerified accountStatus profileImage createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(userMatch),
    User.countDocuments({
      deletedAt: null,
      $or: [{ roles: "exhibitor" }, { roles: "organizer" }],
    }),
    User.countDocuments({ deletedAt: null, roles: "exhibitor" }),
    User.countDocuments({ deletedAt: null, roles: "organizer" }),
    User.countDocuments({
      deletedAt: null,
      roles: { $all: ["exhibitor", "organizer"] },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    aggregates: {
      totalUsers: totalPlatformUsers,
      totalExhibitors: exhibitorsCount,
      totalOrganizers: organizersCount,
      dualRoleUsers: dualRoleCount,
    },
  });
});

export const getAdminUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({
    _id: userId,
    deletedAt: null,
  }).select("-password -__v");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isExhibitor = user.roles?.includes("exhibitor");
  const isOrganizer = user.roles?.includes("organizer");

  const [exhibitorProfile, organizerProfile, events, submissions] =
    await Promise.all([
      isExhibitor ? ExhibitorProfile.findOne({ userId }) : null,
      isOrganizer ? OrganizerProfile.findOne({ userId }) : null,
      isOrganizer
        ? Event.find({ organizerId: userId }).sort({ createdAt: -1 })
        : [],
      isOrganizer
        ? EventSubmission.find({
            $or: [
              { organizerEmail: user.email },
              { organizerPhone: user.phone },
              { submittedBy: user._id },
            ],
          }).sort({ createdAt: -1 })
        : [],
    ]);

  res.json({
    user,
    exhibitorProfile,
    organizerProfile,
    events,
    submissions,
  });
});

