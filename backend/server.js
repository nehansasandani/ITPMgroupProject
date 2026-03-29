import express from "express";
<<<<<<< HEAD
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

=======
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import matchRoutes from "./routes/matchRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { checkTimeouts } from "./controllers/matchController.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));
<<<<<<< HEAD

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
=======
app.use("/api/match", matchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB error ❌:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

// Run timeout check every 1 min
setInterval(checkTimeouts, 60 * 1000);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
