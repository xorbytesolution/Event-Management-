import { z } from "zod";

const INDIAN_CITIES = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Pune",
  "Noida",
  "Jaipur",
  "Lucknow",
  "Kolkata",
  "Gurgaon",
  "Ahmedabad",
  "Chandigarh",
  "Rajasthan",
  "Akola",
  "Ghaziabad",
  "Ranchi",
  "Ludhiana",
  "Kochi",
  "Indore",
  "Surat",
  "Bhopal",
  "Coimbatore",
  "Visakhapatnam",
];

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

const FACILITIES_LIST = [
  "Water",
  "Tea/Coffee",
  "Parking",
  "Toilets",
  "AC",
  "Food",
  "Power",
  "Light",
];

const VENUE_TYPES = [
  "Apartments",
  "Open Ground",
  "Tech Parks",
  "Street Fair",
  "Hotels",
  "Banquet Halls",
  "Malls and Complexes",
  "Convention Centres",
  "Premium Venues",
  "Social Clubs",
  "College & Universities",
];

const STALL_MODELS = ["Open Table", "Canopy", "Octanorm", "Others"];

const STALL_TYPES = [
  "Full Stall",
  "Half Stall",
  "Food Stall",
  "Special Stall",
  "Promotional Stall",
];

const EVENT_TYPES = ["indoor", "outdoor", "both"];
const submissionSchema = z
  .object({
    organizerName: z.string().trim().min(2).max(120),
    organizerPhone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    organizerEmail: z.string().trim().email("Enter a valid email address"),
    city: z
      .string()
      .trim()
      .min(1, "City is required")
      .refine((value) => INDIAN_CITIES.includes(value), {
        message: "Please select a valid city",
      }),
    title: z.string().trim().min(3).max(200),
    venue: z.string().trim().min(3).max(250),
    venueType: z
      .string()
      .trim()
      .min(1, "Venue type is required")
      .refine((value) => VENUE_TYPES.includes(value), {
        message: "Please select a valid venue type",
      }),
    eventType: z.enum(EVENT_TYPES, {
      message: "Please select a valid event type",
    }),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    totalStalls: z.coerce.number().int().min(1).max(10000),
    availableStalls: z.coerce
      .number({
        message: "Available stalls is required",
      })
      .int("Available stalls must be a whole number")
      .min(1, "Available stalls must be at least 1")
      .max(10000, "Available stalls cannot exceed 10,000"),
    expectedVisitors: z.string().trim().max(100).optional(),
    description: z.string().trim().max(5000).optional(),
    highlights: z.string().trim().max(2000).optional(),
    categories: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(80)
          .refine((value) => CATEGORIES_LIST.includes(value), {
            message: "Please select a valid category",
          }),
      )
      .min(1, "Please select category")
      .max(50, "Too many categories selected"),
    facilities: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(80)
          .refine((value) => FACILITIES_LIST.includes(value), {
            message: "Please select a valid facility",
          }),
      )
      .min(1, "Please select facility")
      .max(30, "Too many facilities selected"),
    stallSetup: z.object({
      model: z
        .string()
        .trim()
        .min(1, "Please select a stall model")
        .refine((value) => STALL_MODELS.includes(value), {
          message: "Please select a valid stall model",
        }),
      options: z
        .array(
          z.object({
            stallType: z
              .string()
              .trim()
              .min(1, "Please select a stall type")
              .refine((value) => STALL_TYPES.includes(value), {
                message: "Please select a valid stall type",
              }),
            tables: z
              .union([z.literal(""), z.coerce.number().int().min(1).max(9)])
              .optional(),

            chairs: z
              .union([z.literal(""), z.coerce.number().int().min(1).max(9)])
              .optional(),
            priceForEvent: z.coerce
              .number()
              .finite("Please enter a valid event price")
              .min(1, "Price must be greater than 0"),
            pricePerDay: z
              .union([
                z.literal(""),
                z.coerce
                  .number()
                  .finite("Please enter a valid daily price")
                  .min(0, "Daily price cannot be negative"),
              ])
              .nullable()
              .optional(),
          }),
        )
        .min(1),
    }),
    posterImage: z.string().url().optional().or(z.literal("")),
    floorPlanImage: z.string().url().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.startDate < today)
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date cannot be in the past",
      });
    if (data.endDate < data.startDate)
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date cannot be before start date",
      });
    if (data.availableStalls > data.totalStalls)
      ctx.addIssue({
        code: "custom",
        path: ["availableStalls"],
        message: "Available stalls cannot exceed total stalls",
      });
  });

export default submissionSchema;
