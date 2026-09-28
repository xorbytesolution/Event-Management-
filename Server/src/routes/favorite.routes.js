import { Router } from "express";
import {
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from "../controllers/favorite.controller.js";
import { allowRoles, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all favorite routes: user must be authenticated with exhibitor, organizer, or admin role
router.use(requireAuth);
router.use(allowRoles("exhibitor", "organizer", "admin"));

router.get("/", getFavorites);
router.post("/toggle/:eventId", toggleFavorite);
router.delete("/:eventId", removeFavorite);

export default router;
