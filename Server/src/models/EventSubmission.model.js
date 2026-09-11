import mongoose from "mongoose";

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

const stallOptionSchema = new mongoose.Schema(
  {
    stallType: {
      type: String,
      required: true,
      trim: true,
      enum: STALL_TYPES,
    },

    // Empty UI value is stored as 0.
    tables: {
      type: Number,
      default: 0,
      min: 0,
      max: 9,
    },

    chairs: {
      type: Number,
      default: 0,
      min: 0,
      max: 9,
    },

    priceForEvent: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { _id: false },
);

// A public organizer submits this before they receive an organizer account.
const eventSubmissionSchema = new mongoose.Schema(
  {
    organizerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    organizerPhone: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{10}$/,
    },

    organizerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      enum: INDIAN_CITIES,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 250,
    },

    venueType: {
      type: String,
      required: true,
      trim: true,
      enum: VENUE_TYPES,
    },

    eventType: {
      type: String,
      required: true,
      enum: ["indoor", "outdoor", "both"],
      lowercase: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalStalls: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },

    availableStalls: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
      validate: {
        validator: function (value) {
          return value <= this.totalStalls;
        },
        message: "Available stalls cannot exceed total stalls",
      },
    },

    expectedVisitors: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    highlights: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    categories: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (items) => items.length >= 1,
          message: "At least one category is required",
        },
        {
          validator: (items) =>
            items.every((item) => CATEGORIES_LIST.includes(item)),
          message: "Invalid category selected",
        },
      ],
    },

    facilities: {
      type: [String],
      required: true,
      validate: [
        {
          validator: (items) => items.length >= 1,
          message: "At least one facility is required",
        },
        {
          validator: (items) =>
            items.every((item) => FACILITIES_LIST.includes(item)),
          message: "Invalid facility selected",
        },
      ],
    },

    stallSetup: {
      model: {
        type: String,
        required: true,
        trim: true,
        enum: STALL_MODELS,
      },

      options: {
        type: [stallOptionSchema],
        required: true,
        validate: [
          {
            validator: (items) => items.length > 0,
            message: "At least one stall type is required",
          },
        ],
      },
    },

    posterImage: {
      type: String,
      default: null,
    },

    floorPlanImage: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    publishedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
  },
  { timestamps: true },
);

eventSubmissionSchema.index({
  city: 1,
  status: 1,
  startDate: 1,
});

export default mongoose.model("EventSubmission", eventSubmissionSchema);
