import express from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Explicitly target the frontend pages/images directory as per user request
    const destPath = path.join(process.cwd(), '../frontend/src/pages/images');
    cb(null, destPath);
  },
  filename(req, file, cb) {
    // Save cleanly as user_id + timestamp + extension
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! (JPEG, PNG, WEBP, GIF)"), false);
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No valid image file provided." });
  res.status(201).json({
    message: "Profile image uploaded to frontend folder successfully.",
    image: req.file.filename
  });
});

export default router;
