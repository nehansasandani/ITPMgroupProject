import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { connectDB } from "./config/db.js";
import { checkTimeouts } from "./controllers/matchController.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));

app.use("/api/match", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// Connect DB then start server (safe)
const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

// Run timeout check every 1 min
setInterval(checkTimeouts, 60 * 1000);