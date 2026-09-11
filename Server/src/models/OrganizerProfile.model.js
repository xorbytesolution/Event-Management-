import mongoose from "mongoose";

const organizerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // companyName: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    // GSTNumber: {
    //     type: String,
    //     trim: true,
    //     default: null
    // },
    // businessAddress: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    // website: {
    //     type: String,
    //     trim: true,
    //     default: null
    // },
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

export default mongoose.model("OrganizerProfile", organizerProfileSchema);
