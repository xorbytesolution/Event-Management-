import { Router } from "express";
import {
  getPublishedEvent,
  listPublishedEvents,
} from "../controllers/event.controller.js";
const router = Router();
router.get("/", listPublishedEvents);
router.get("/:publicId", getPublishedEvent);
export default router;
