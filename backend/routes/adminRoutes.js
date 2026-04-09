import express from "express";
import {
  getStats,
  getUsers,
  toggleUserStatus,
  getDisputes,
  resolveDispute,
  getAnalytics,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats",                      requireAuth, requireRole("ADMIN"), getStats);
router.get("/users",                      requireAuth, requireRole("ADMIN"), getUsers);
router.patch("/users/:id/toggle-status",  requireAuth, requireRole("ADMIN"), toggleUserStatus);
router.get("/disputes",                   requireAuth, requireRole("ADMIN"), getDisputes);
router.patch("/disputes/:id/resolve",     requireAuth, requireRole("ADMIN"), resolveDispute);
router.get("/analytics",                  requireAuth, requireRole("ADMIN"), getAnalytics);

export default router;