import { Router } from "express";
import {
  approveSubmission,
  listSubmissions,
  reviewSubmission,
} from "../controllers/eventSubmission.controller.js";
import { requireAdminAuth } from "../middlewares/auth.middleware.js";
import {
  adminLogin,
  adminLogout,
  getDashboard,
  getSubmission,
  listAdminEvents,
  getAdminEvent,
  listAdminExhibitors,
  getAdminExhibitor,
  listAdminUsers,
  getAdminUser,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/admin.controller.js";
const router = Router();
router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.use(requireAdminAuth);
router.get("/dashboard", getDashboard);

router.get("/profile", getAdminProfile);
router.patch("/profile", updateAdminProfile);
router.patch("/profile/password", changeAdminPassword);

router.get("/event-submissions", listSubmissions);
router.get("/event-submissions/:submissionId", getSubmission);

router.get("/events", listAdminEvents);
router.get("/events/:eventId", getAdminEvent);

// Unified Users Management
router.get("/users", listAdminUsers);
router.get("/users/:userId", getAdminUser);

// Backward-compatible Exhibitor routes
router.get("/exhibitors", listAdminExhibitors);
router.get("/exhibitors/:exhibitorId", getAdminExhibitor);

router.patch("/event-submissions/:submissionId", reviewSubmission);
router.post("/event-submissions/:submissionId/approve", approveSubmission);
export default router;
