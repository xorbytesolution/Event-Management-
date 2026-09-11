import mongoose from "mongoose";

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

const exhibitorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    categories: {
      type: [
        {
          type: String,
          trim: true,
          enum: CATEGORIES_LIST,
        },
      ],
      required: true,
      validate: {
        validator: (categories) => categories.length > 0,
        message: "At least one category is required",
      },
    },
  },
  {
    timestamps: true,
  },
);

const ExhibitorProfile = mongoose.model(
  "ExhibitorProfile",
  exhibitorProfileSchema,
);

export default ExhibitorProfile;
