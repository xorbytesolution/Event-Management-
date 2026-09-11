import { Router } from "express";

import {
  currentUser,
  login,
  logout,
  registerExhibitor,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerExhibitor);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", requireAuth, currentUser);

export default router;
