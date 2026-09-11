import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
    {
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        },
        transactionId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        transactionType: {
            type: String,
            required: true,
            enum: ["payment", "refund"]
        },
        paymentMethod: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        transactionStatus: {
            type: String,
            required: true,
            enum: ["pending", "success", "failed"]
        },
        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },
        processedAt: {
            type: Date,
            default: Date.now
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

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);