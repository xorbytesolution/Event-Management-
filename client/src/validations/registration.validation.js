import { z } from "zod";

export const CATEGORIES_LIST = [
  "Mens Wear",
  "Kids Wear",
  "Home Decor",
  "Handicrafts",
  "Organic Products",
  "Promotional Stalls",
  "Food Stalls",
  "Jewellery",
  "Bridal & Ethnic Wear",
  "Automobiles",
  "Sports Wear",
  "Fashion Accessories",
  "Devotional Products",
  "Footwear",
  "Stationary & Books",
  "Event Organizer",
  "Health & Medical",
  "Electronic Gadgets",
  "Kitchenware",
  "Women Wear",
  "Handmade Products",
  "Cosmetics & Beauty",
  "Startups",
  "Home Furnishing",
  "Real Estate",
  "Fitness Equipments",
  "Nutrition & Wellness",
  "Home Appliances",
  "Toys",
  "NGO's",
  "Others",
];

export const registrationSchema = z
  .object({
    mobile: z
      .string({ required_error: "Mobile number is required" })
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),

    firstName: z
      .string({ required_error: "First name is required" })
      .trim()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
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
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),

    confirmPassword: z
      .string({ required_error: "Please confirm your password" })
      .min(1, "Please confirm your password"),

    gender: z
      .string({ required_error: "Please select your gender" })
      .min(1, "Please select your gender")
      .refine((val) => ["male", "female"].includes(val?.toLowerCase()), {
        message: "Please select your gender",
      }),

    categories: z
      .array(z.string())
      .min(1, "Please select at least one category"),

    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "Please accept the Terms & Conditions",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
