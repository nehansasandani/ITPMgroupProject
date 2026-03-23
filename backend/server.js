import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// His routes
import userRoutes from "./routes/userRoutes.js";

// Your routes
import skillRoutes from "./routes/skillRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import reputationRoutes from "./routes/reputationRoutes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));

// His routes
app.use("/api/users", userRoutes);

// Your routes
app.use("/api/skills", skillRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/reputation", reputationRoutes);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));