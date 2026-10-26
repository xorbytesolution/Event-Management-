import { Router } from "express";
import {
  checkEventInquiry,
  createInquiry,
  getMyInquiries,
} from "../controllers/inquiry.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all exhibitor inquiry routes
router.use(requireAuth, allowRoles("exhibitor", "organizer", "admin"));

// Check inquiry status for a specific event
router.get("/check/:eventId", checkEventInquiry);

// Get all inquiries submitted by the logged in exhibitor
router.get("/my-inquiries", getMyInquiries);

// Submit inquiry
router.post("/", createInquiry);

export default router;
