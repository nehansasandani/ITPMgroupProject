import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export function requireAuth(req, res, next) {
  // ✅ Dev fallback
  const devUserId = req.header("x-user-id");
  if (devUserId) {
    if (!mongoose.Types.ObjectId.isValid(devUserId)) {
      return res.status(400).json({ message: "Invalid x-user-id header" });
    }
    req.user = { id: devUserId, role: "STUDENT", source: "dev-header" };
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "No token. Unauthorized." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, source: "jwt" };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token. Unauthorized." });
  }
}

// ✅ Role-based guard
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}