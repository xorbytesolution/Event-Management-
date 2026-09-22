import { z } from "zod";

export const createInquirySchema = z.object({
  eventId: z.string({ required_error: "Event ID is required" }).min(1, "Event ID is required"),
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional()
    .default(""),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address"),
  phone: z
    .string({ required_error: "Mobile number is required" })
    .trim()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  gender: z
    .enum(["male", "female", "other"], {
      required_error: "Gender is required",
    })
    .default("male"),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .min(1, "Category is required"),
  message: z
    .string()
    .trim()
    .max(2000, "Message cannot exceed 2000 characters")
    .optional()
    .default(""),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(["new", "accepted", "rejected", "contacted", "closed"], {
    required_error: "Status is required",
  }),
});

