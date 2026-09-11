import { Router } from "express";
import { createSubmission } from "../controllers/eventSubmission.controller.js";
import { eventMediaUpload } from "../middlewares/upload.middleware.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/", optionalAuth, eventMediaUpload, createSubmission);
export default router;
