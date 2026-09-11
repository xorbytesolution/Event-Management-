/**
 * Stall Model
 * Database schema blueprint for stalls.
 */
import mongoose from "mongoose";

const stallSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        stallCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StallCategory",
            required: true
        },
        stallNumber: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["available", "reserved", "booked"],
            default: "available"
        },
        positionX: {
            type: Number,
            default: null
        },
        positionY: {
            type: Number,
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

export default mongoose.model("Stall", stallSchema);
