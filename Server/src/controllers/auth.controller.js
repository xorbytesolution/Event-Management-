import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import ExhibitorProfile from "../models/ExhibitorProfile.model.js";

import {
  exhibitorRegistrationSchema,
  loginSchema,
} from "../validations/auth.validation.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const registerExhibitor = asyncHandler(async (req, res) => {
  const input = exhibitorRegistrationSchema.parse(req.body);

  const email = input.email.toLowerCase();
  const phone = input.phone;

  const userByEmail = await User.findOne({ email });
  const userByPhone = await User.findOne({ phone });

  if (
    userByEmail &&
    userByPhone &&
    userByEmail._id.toString() !== userByPhone._id.toString()
  ) {
    throw new ApiError(
      409,
      "The email and phone number belong to two different registered accounts. Please verify your details.",
    );
  }

  const existingUser = userByEmail || userByPhone;

  if (existingUser) {
    if (existingUser.roles.includes("admin")) {
      throw new ApiError(
        409,
        "An account already exists with this email or phone number",
      );
    }

    if (existingUser.roles.includes("exhibitor")) {
      throw new ApiError(
        409,
        "An exhibitor account already exists with this email or phone number. Please log in directly.",
      );
    }

    // Verify existing account password before adding exhibitor privileges
    const isPasswordValid = await bcrypt.compare(
      input.password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "An account with this email/phone already exists. Please enter your existing account password to add exhibitor access.",
      );
    }

    existingUser.roles.push("exhibitor");
    existingUser.updatedBy = existingUser._id;

    await existingUser.save();

    let exhibitorProfile = await ExhibitorProfile.findOne({
      userId: existingUser._id,
    });

    if (!exhibitorProfile) {
      exhibitorProfile = await ExhibitorProfile.create({
        userId: existingUser._id,
        categories: input.categories,
      });
    } else if (input.categories && input.categories.length > 0) {
      exhibitorProfile.categories = input.categories;
      await exhibitorProfile.save();
    }

    const token = tokenFor(existingUser);
    setAuthCookie(res, token);

    return res.status(200).json({
      message:
        "Exhibitor access added to your existing account successfully! You can now contact organizers and book stalls.",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        gender: existingUser.gender,
        roles: existingUser.roles,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: `${input.firstName} ${input.lastName}`.trim(),
    email,
    password: hashedPassword,
    phone,
    gender: input.gender,
    roles: ["exhibitor"],
    accountStatus: "active",
  });

  await ExhibitorProfile.create({
    userId: user._id,
    categories: input.categories,
  });

  res.status(201).json({
    message: "Exhibitor registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      roles: user.roles,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({
    email: email.toLowerCase(),
    roles: { $in: ["exhibitor", "organizer"] },
    deletedAt: null,
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  if (user.accountStatus !== "active") {
    throw new ApiError(403, "This account is not active");
  }

  const token = tokenFor(user);

  setAuthCookie(res, token);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      roles: user.roles,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.json({
    message: "Logged out successfully",
  });
});

export const currentUser = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});
