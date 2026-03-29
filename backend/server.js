import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { connectDB } from "./config/db.js";
import { checkTimeouts } from "./controllers/matchController.js";
import { expireOverdueTasks } from "./utils/taskExpiry.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));

app.use("/api/match", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;

await connectDB();

// Run once on startup
await expireOverdueTasks();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

// Existing match timeout check
setInterval(checkTimeouts, 60 * 1000);

// Task expiry check every 1 minute
setInterval(expireOverdueTasks, 60 * 1000);