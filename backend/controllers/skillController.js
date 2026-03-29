import Skill from "../models/Skill.js";

// GET
export const getMySkills = async (req, res) => {
  try {
<<<<<<< HEAD
    const userId = req.user.id;
=======
    const userId = req.userId;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ skills });
  } catch (err) {
    console.log("GET skills error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

<<<<<<< HEAD
const VALID_LEVELS = ["Beginner", "Intermediate", "Expert"];

// POST
export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
=======
// POST
export const addSkill = async (req, res) => {
  try {
    const userId = req.userId;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
    const { category, subCategory, skill, level } = req.body;

    if (!category || !subCategory || !skill || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

<<<<<<< HEAD
    if (typeof category !== "string" || category.trim().length < 2 || category.trim().length > 60) {
      return res.status(400).json({ message: "Category must be 2–60 characters" });
    }
    if (typeof subCategory !== "string" || subCategory.trim().length < 2 || subCategory.trim().length > 60) {
      return res.status(400).json({ message: "Sub-category must be 2–60 characters" });
    }
    if (typeof skill !== "string" || skill.trim().length < 2 || skill.trim().length > 60) {
      return res.status(400).json({ message: "Skill name must be 2–60 characters" });
    }
    if (!VALID_LEVELS.includes(level)) {
      return res.status(400).json({ message: `Level must be one of: ${VALID_LEVELS.join(", ")}` });
    }

=======
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
    const exists = await Skill.findOne({ userId, category, subCategory, skill });
    if (exists) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    await Skill.create({ userId, category, subCategory, skill, level });

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });

    res.status(201).json({ skills });
  } catch (err) {
    console.log("ADD skill error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const removeSkill = async (req, res) => {
  try {
<<<<<<< HEAD
    const userId = req.user.id;
=======
    const userId = req.userId;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
    const skillId = req.params.id;

    await Skill.deleteOne({ _id: skillId, userId });

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ skills });
  } catch (err) {
    console.log("DELETE skill error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
