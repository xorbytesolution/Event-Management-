import { z } from "zod";

const CATEGORIES_LIST = [
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

const categorySchema = z.enum(CATEGORIES_LIST);

export const exhibitorRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(2).max(50),

    lastName: z.string().trim().max(50).optional().default(""),

    email: z.string().trim().email(),

    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),

    gender: z.enum(["male", "female"], {
      error: "Gender is required",
    }),

    categories: z
      .array(categorySchema)
      .min(1, "At least one category is required"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Confirm password is required"),

    termsAccepted: z.literal(true, {
      error: "You must accept the Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

export const updateAdminProfileSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  phone: z
    .string({ required_error: "Mobile number is required" })
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  profileImage: z
    .string()
    .trim()
    .url("Profile image must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
});

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
