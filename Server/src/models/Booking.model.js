/**
 * Booking Model
 * Database schema blueprint for stall bookings.
 */
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        exhibitorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        stallId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stall",
            required: true
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        totalAmount: {
            type: Number,
            required: true
        },
        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending"
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

export default mongoose.model("Booking", bookingSchema);