import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import OrganizerProfile from "../models/OrganizerProfile.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Generates a secure readable temporary password
 * Format: Temp#<12 hex chars> (17 chars total)
 */
const generateTemporaryPassword = () => {
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  return `Temp#${randomSuffix}`;
};

/**
 * Provision or resolve an organizer user account and profile.
 * Handles the 5 provisioning scenarios:
 * - Case A: New user -> create user with temporary password, create OrganizerProfile
 * - Case B: Existing Exhibitor -> add 'organizer' role, ensure OrganizerProfile
 * - Case C & D: Existing Organizer -> reuse account, ensure OrganizerProfile
 * - Case E: Existing Admin -> throw 409 conflict
 *
 * Provides a cleanup/rollback function for manual transaction-less rollback.
 *
 * @param {Object} params
 * @param {string} params.organizerName
 * @param {string} params.organizerEmail
 * @param {string} params.organizerPhone
 * @param {string} [params.adminId]
 * @returns {Promise<{ user: Object, isNewUser: boolean, temporaryPassword: string|null, cleanup: Function }>}
 */
export const provisionOrganizer = async ({
  organizerName,
  organizerEmail,
  organizerPhone,
  adminId = null,
}) => {
  const normalizedEmail = organizerEmail.trim().toLowerCase();
  const normalizedPhone = organizerPhone.trim();

  // Search existing user by email and phone
  const userByEmail = await User.findOne({ email: normalizedEmail });
  const userByPhone = await User.findOne({ phone: normalizedPhone });

  // Conflict: Email and Phone belong to two different existing accounts
  if (
    userByEmail &&
    userByPhone &&
    userByEmail._id.toString() !== userByPhone._id.toString()
  ) {
    throw new ApiError(
      409,
      "The organizer email and phone number belong to two different registered accounts. Please verify contact details."
    );
  }

  const existingUser = userByEmail || userByPhone;

  // Handle existing account
  if (existingUser) {
    const roles = Array.isArray(existingUser.roles)
      ? [...existingUser.roles]
      : [];

    // Case E: Administrator conflict
    if (roles.includes("admin")) {
      throw new ApiError(
        409,
        "The organizer email or phone is registered to an administrator account and cannot be provisioned as an organizer."
      );
    }

    const originalRoles = [...roles];
    let rolesUpdated = false;

    // Case B: Existing user lacks "organizer" role (e.g. exhibitor)
    if (!roles.includes("organizer")) {
      roles.push("organizer");
      existingUser.roles = roles;
      if (adminId) {
        existingUser.updatedBy = adminId;
      }
      await existingUser.save();
      rolesUpdated = true;
    }
    // Case C & D: Already has "organizer" role -> keep roles as is

    // Ensure OrganizerProfile exists
    let profile = await OrganizerProfile.findOne({ userId: existingUser._id });
    let createdProfile = null;

    if (!profile) {
      profile = await OrganizerProfile.create({
        userId: existingUser._id,
        createdBy: adminId || null,
        updatedBy: adminId || null,
      });
      createdProfile = profile;
    }

    return {
      user: existingUser,
      isNewUser: false,
      temporaryPassword: null,
      cleanup: async () => {
        if (createdProfile) {
          await OrganizerProfile.findByIdAndDelete(createdProfile._id).catch(
            () => {}
          );
        }
        if (rolesUpdated) {
          await User.findByIdAndUpdate(existingUser._id, {
            roles: originalRoles,
          }).catch(() => {});
        }
      },
    };
  }

  // Case A: Create brand-new user account
  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

  const newUser = await User.create({
    name: organizerName.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    roles: ["organizer"],
    gender: "prefer_not_to_say",
    isVerified: true,
    accountStatus: "active",
    createdBy: adminId || null,
    updatedBy: adminId || null,
  });

  let newProfile = null;
  try {
    newProfile = await OrganizerProfile.create({
      userId: newUser._id,
      createdBy: adminId || null,
      updatedBy: adminId || null,
    });
  } catch (profileError) {
    await User.findByIdAndDelete(newUser._id).catch(() => {});
    throw profileError;
  }

  return {
    user: newUser,
    isNewUser: true,
    temporaryPassword,
    cleanup: async () => {
      if (newProfile) {
        await OrganizerProfile.findByIdAndDelete(newProfile._id).catch(() => {});
      }
      await User.findByIdAndDelete(newUser._id).catch(() => {});
    },
  };
};
