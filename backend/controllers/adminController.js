import User from "../models/User.js";
import Task from "../models/Task.js";
import Session from "../models/Session.js";
import Dispute from "../models/Dispute.js";

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [totalUsers, activeSessions, completedSessions, pendingDisputes] =
      await Promise.all([
        User.countDocuments({ role: "STUDENT" }),
        Session.countDocuments({ status: "ACTIVE" }),
        Session.countDocuments({ status: "COMPLETED" }),
        Dispute.countDocuments({ status: "Pending" }),
      ]);

    res.json({ totalUsers, activeSessions, completedSessions, pendingDisputes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "STUDENT" })
      .select("fullName email studentId reputation completedTasksCount cooldownUntil lastActive createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "ADMIN") {
      return res.status(400).json({ message: "Cannot suspend an admin" });
    }

    const isSuspended = user.cooldownUntil && new Date(user.cooldownUntil) > new Date();

    if (isSuspended) {
      user.cooldownUntil = null;        // unsuspend
    } else {
      user.cooldownUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // suspend 1 year
    }

    await user.save();
    res.json({ user, suspended: !isSuspended });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/disputes
export const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("reportedBy", "fullName studentId")
      .populate("against",    "fullName studentId")
      .populate("session",    "task")
      .sort({ createdAt: -1 });

    res.json({ disputes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/disputes/:id/resolve
export const resolveDispute = async (req, res) => {
  try {
    const { action } = req.body; // "approve" | "reject"
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });
    if (dispute.status !== "Pending") {
      return res.status(400).json({ message: "Dispute already resolved" });
    }

    dispute.status = action === "approve"
      ? "Resolved - Penalty Applied"
      : "Resolved - Dismissed";

    if (action === "approve") {
      // Deduct reputation — your scale is 0-5 so 0.5 is meaningful
      await User.findByIdAndUpdate(dispute.against, {
        $inc: { reputation: -0.5 },
      });
    }

    await dispute.save();
    res.json({ dispute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const [skillDemand, disputeTypes, sessionStats] = await Promise.all([
      Task.aggregate([
        { $group: { _id: "$skillRequired", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Dispute.aggregate([
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Session.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ skillDemand, disputeTypes, sessionStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};