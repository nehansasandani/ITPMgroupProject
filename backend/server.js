import "dotenv/config"; // ← FIRST - loads .env before everything

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Teammate's routes
import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Your routes
import skillRoutes from "./routes/skillRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import reputationRoutes from "./routes/reputationRoutes.js";

// Teammate's utils
import { connectDB } from "./config/db.js";
import { checkTimeouts } from "./controllers/matchController.js";
import { expireOverdueTasks } from "./utils/taskExpiry.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));

// ── Teammate's routes ──
app.use("/api/match", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// ── Your routes ──
app.use("/api/skills", skillRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reputation", reputationRoutes);

const PORT = process.env.PORT || 5000;

// ── Single DB connection using teammate's connectDB ──
await connectDB();
await expireOverdueTasks();

// ── Single app.listen ──
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// ── Intervals ──
setInterval(checkTimeouts, 60 * 1000);
setInterval(expireOverdueTasks, 60 * 1000);