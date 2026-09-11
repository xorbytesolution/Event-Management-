import { z } from "zod";

export const organizerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full Name is required")
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  profileImage: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Please enter a valid image URL starting with http:// or https://"),
});

export const organizerPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      !data.currentPassword ||
      !data.newPassword ||
      data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from current password",
      path: ["newPassword"],
    },
  );
