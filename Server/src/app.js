import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import eventSubmissionRoutes from "./routes/eventSubmission.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import organizerRoutes from "./routes/organizer.routes.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-submissions", eventSubmissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizer", organizerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
