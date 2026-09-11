import { Router } from "express";
import {
  listOrganizerEvents,
  getOrganizerEvent,
} from "../controllers/organizer.controller.js";
import { requireAuth, allowRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all organizer routes: requires auth and 'organizer' role
router.use(requireAuth, allowRoles("organizer"));

router.get("/events", listOrganizerEvents);
router.get("/events/:eventId", getOrganizerEvent);

export default router;
