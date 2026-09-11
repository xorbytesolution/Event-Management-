/**
 * Event Model
 * Database schema blueprint for events.
 */
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

const eventSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventSubmission",
      required: true,
      unique: true,
    },

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

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    eventType: {
      type: String,
      required: true,
      enum: ["indoor", "outdoor", "both"],
      lowercase: true,
      trim: true,
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

    city: {
      type: String,
      required: true,
      trim: true,
      enum: INDIAN_CITIES,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 250,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    posterImage: {
      type: String,
      default: null,
    },

    floorPlanImage: {
      type: String,
      default: null,
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

    venueType: {
      type: String,
      required: true,
      trim: true,
    },

    expectedVisitors: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },

    highlights: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Event", eventSchema);
