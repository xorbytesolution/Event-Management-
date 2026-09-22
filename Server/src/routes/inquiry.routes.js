import { Router } from "express";
import { createInquiry } from "../controllers/inquiry.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Submit inquiry: requires logged in exhibitor
router.post("/", requireAuth, allowRoles("exhibitor"), createInquiry);

export default router;
