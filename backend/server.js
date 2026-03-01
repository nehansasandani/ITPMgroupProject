import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import skillRoutes from "./routes/skillRoutes.js";

dotenv.config();

const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Routes
app.use("/api/skills", skillRoutes);

app.use('/api', userRoutes);
// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
