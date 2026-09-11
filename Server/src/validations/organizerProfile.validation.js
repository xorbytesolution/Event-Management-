import { z } from "zod";

export const updateOrganizerProfileSchema = z.object({
  name: z
    .string({ required_error: "Full Name is required" })
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name cannot exceed 100 characters"),
  phone: z
    .string({ required_error: "Mobile number is required" })
    .trim()
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

export const changeOrganizerPasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(8, "New password must be at least 8 characters long")
    .max(100, "New password cannot exceed 100 characters"),
});
