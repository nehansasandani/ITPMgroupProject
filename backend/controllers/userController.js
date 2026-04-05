import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const STUDENT_ID_REGEX = /^(IT|BM|EN|HS)\d{8}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;

function validateRegisterInput({ fullName, email, studentId, password }) {
  const errors = [];

  const cleanName = (fullName || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanStudentId = (studentId || "").trim().toUpperCase();
  const cleanPassword = password || "";

  if (!cleanName) {
    errors.push("Full name is required.");
  } else {
    if (cleanName.length < 3) errors.push("Full name must be at least 3 characters.");
    if (cleanName.length > 60) errors.push("Full name must be at most 60 characters.");
    if (!/^[A-Za-z\s.'-]+$/.test(cleanName)) {
      errors.push("Full name can only contain letters, spaces, apostrophes, dots, and hyphens.");
    }
    if (/\s{2,}/.test(cleanName)) {
      errors.push("Full name cannot contain repeated spaces.");
    }
  }

  if (!cleanEmail) {
    errors.push("Email is required.");
  }

  if (!cleanStudentId) {
    errors.push("Student ID is required.");
  } else if (!STUDENT_ID_REGEX.test(cleanStudentId)) {
    errors.push("Student ID must be like IT23323452.");
  }

  if (!cleanPassword) {
    errors.push("Password is required.");
  } else {
    if (cleanPassword.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }
    if (cleanPassword.length > 64) {
      errors.push("Password must be at most 64 characters.");
    }
    if (/\s/.test(cleanPassword)) {
      errors.push("Password cannot contain spaces.");
    }
    if (!PASSWORD_REGEX.test(cleanPassword)) {
      errors.push(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }
    if (cleanStudentId && cleanPassword.toUpperCase().includes(cleanStudentId)) {
      errors.push("Password cannot contain your student ID.");
    }
    if (cleanEmail && cleanPassword.toLowerCase().includes(cleanEmail.split("@")[0])) {
      errors.push("Password should not contain your email username.");
    }
  }

  return errors;
}

export async function register(req, res) {
  try {
    const { fullName, email, studentId, password } = req.body;

    if (!fullName || !email || !studentId || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const validationErrors = validateRegisterInput({
      fullName,
      email,
      studentId,
      password,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Registration validation failed.",
        issues: validationErrors,
      });
    }

    const safeRole = "STUDENT";

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedStudentId = studentId.toUpperCase().trim();
    const normalizedFullName = fullName.trim().replace(/\s+/g, " ");

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const existingStudentId = await User.findOne({ studentId: normalizedStudentId });
    if (existingStudentId) {
      return res.status(409).json({ message: "Student ID already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      studentId: normalizedStudentId,
      passwordHash,
      role: safeRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        profilePic: user.profilePic,
        skills: user.skills,
        reputation: user.reputation,
        completedTasksCount: user.completedTasksCount,
      },
      token,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { emailOrStudentId, password } = req.body;

    if (!emailOrStudentId || !password) {
      return res.status(400).json({ message: "Missing credentials." });
    }

    const key = emailOrStudentId.trim();
    const query = key.includes("@")
      ? { email: key.toLowerCase() }
      : { studentId: key.toUpperCase() };

    const user = await User.findOne(query).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials." });

    const token = signToken(user);

    return res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        profilePic: user.profilePic,
        skills: user.skills,
        reputation: user.reputation,
        completedTasksCount: user.completedTasksCount,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { bio, githubUrl, linkedinUrl, profilePic } = req.body;

    const updateData = { 
      bio: bio?.slice(0, 200) || "", 
      githubUrl: githubUrl || "", 
      linkedinUrl: linkedinUrl || "" 
    };

    if (profilePic !== undefined) {
      updateData.profilePic = profilePic;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    const token = signToken(user);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        bio: user.bio,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        profilePic: user.profilePic,
        skills: user.skills,
        reputation: user.reputation,
        completedTasksCount: user.completedTasksCount,
      },
      token
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}