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

const EVENT_TYPES = ["Indoor", "Outdoor", "Both"];

const stallOptionSchema = z.object({
  stallType: z
    .string()
    .trim()
    .min(1, "Please select a stall type")
    .refine((value) => STALL_TYPES.includes(value), {
      message: "Please select a valid stall type",
    }),

  tables: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  }, z.number().int("Tables must be a whole number").min(1, "Tables must be at least 1").max(9, "Tables cannot exceed 9").optional()),

  chairs: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return Number(value);
  }, z.number().int("Chairs must be a whole number").min(1, "Chairs must be at least 1").max(9, "Chairs cannot exceed 9").optional()),

  priceForEvent: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({
        message: "Please enter the event price",
      })
      .finite("Please enter a valid event price")
      .min(1, "Price must be greater than 0"),
  ),
});

export const eventSubmissionSchema = z
  .object({
    mobileNumber: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),

    organiserName: z
      .string()
      .trim()
      .min(1, "Organiser name is required")
      .min(2, "Organiser name must be at least 2 characters")
      .max(120, "Organiser name cannot exceed 120 characters"),

    organizerEmail: z
      .string()
      .trim()
      .min(1, "Organizer email is required")
      .email("Enter a valid email address"),

    city: z
      .string()
      .min(1, "Please select a city")
      .refine((value) => INDIAN_CITIES.includes(value), {
        message: "Please select a valid city",
      }),

    eventName: z
      .string()
      .trim()
      .min(1, "Event name is required")
      .min(3, "Event name must be at least 3 characters")
      .max(200, "Event name cannot exceed 200 characters"),

    eventVenue: z
      .string()
      .trim()
      .min(1, "Event venue is required")
      .min(3, "Event venue must be at least 3 characters")
      .max(250, "Event venue cannot exceed 250 characters"),

    venueType: z
      .string()
      .min(1, "Please select a venue type")
      .refine((value) => VENUE_TYPES.includes(value), {
        message: "Please select a valid venue type",
      }),

    eventType: z
      .string()
      .min(1, "Please select an event type")
      .refine((value) => EVENT_TYPES.includes(value), {
        message: "Please select a valid event type",
      }),

    startingDate: z
      .string()
      .min(1, "Starting date is required")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Please enter a valid starting date",
      ),

    endingDate: z
      .string()
      .min(1, "Ending date is required")
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        "Please enter a valid ending date",
      ),

    totalStalls: z.coerce
      .number({
        message: "Total stalls is required",
      })
      .int("Total stalls must be a whole number")
      .min(1, "Total stalls must be at least 1")
      .max(10000, "Total stalls cannot exceed 10,000"),

    availableStalls: z.coerce
      .number({
        message: "Available stalls is required",
      })
      .int("Available stalls must be a whole number")
      .min(1, "Available stalls must be at least 1")
      .max(10000, "Available stalls cannot exceed 10,000"),

    visitorCount: z.string().trim().optional(),

    moreDetail: z
      .string()
      .trim()
      .max(5000, "More detail cannot exceed 5,000 characters")
      .optional(),

    eventHighlights: z
      .string()
      .trim()
      .max(2000, "Event highlights cannot exceed 2,000 characters")
      .optional(),

    stallSetup: z.object({
      model: z
        .string()
        .min(1, "Please select a stall model")
        .refine((value) => STALL_MODELS.includes(value), {
          message: "Please select a valid stall model",
        }),

      options: z
        .array(stallOptionSchema)
        .min(1, "Please add at least one stall type"),
    }),

    categories: z
      .array(z.string().trim().min(1))
      .min(1, "Please select category"),

    facilities: z
      .array(z.string().trim().min(1))
      .min(1, "Please select facility"),

    posterFile: z.any().optional(),

    floorPlanFile: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    /*
     * Ending date cannot be before starting date
     */
    if (
      data.startingDate &&
      data.endingDate &&
      !Number.isNaN(new Date(data.startingDate).getTime()) &&
      !Number.isNaN(new Date(data.endingDate).getTime())
    ) {
      const startDate = new Date(data.startingDate);
      const endDate = new Date(data.endingDate);

      if (endDate < startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endingDate"],
          message: "Ending date cannot be before starting date",
        });
      }
    }

    /*
     * Starting date cannot be in the past
     */
    if (data.startingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(data.startingDate);
      startDate.setHours(0, 0, 0, 0);

      if (!Number.isNaN(startDate.getTime()) && startDate < today) {
        ctx.addIssue({
          code: "custom",
          path: ["startingDate"],
          message: "Starting date cannot be in the past",
        });
      }
    }

    /*
     * Available stalls cannot exceed total stalls
     */
    if (
      typeof data.totalStalls === "number" &&
      typeof data.availableStalls === "number" &&
      data.availableStalls > data.totalStalls
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["availableStalls"],
        message: "Available stalls cannot exceed total stalls",
      });
    }
  });
