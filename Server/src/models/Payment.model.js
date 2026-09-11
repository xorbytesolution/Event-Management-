/**
 * Payment Model
 * Database schema blueprint for payments.
 */
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        amountPaid: {
            type: Number,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "partial", "paid", "refunded"],
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

export default mongoose.model("Payment", paymentSchema);
