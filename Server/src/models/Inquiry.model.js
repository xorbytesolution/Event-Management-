import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        exhibitorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
            default: "male"
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            trim: true,
            default: "",
            maxlength: 2000
        },
        status: {
            type: String,
            enum: ["new", "accepted", "rejected", "contacted", "closed"],
            default: "new"
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

export default mongoose.model("Inquiry", inquirySchema);