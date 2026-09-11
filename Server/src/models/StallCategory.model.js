import mongoose from "mongoose";

const stallCategorySchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        name: {
            type: String,
            required: true,
            enum: ["Premium", "Gold", "Silver"],
            trim: true
        },
        pricePerDay: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            trim: true,
            default: null
        },
        facilities: {
            type: [String],
            default: []
        },
        description: {
            type: String,
            trim: true,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("StallCategory", stallCategorySchema);