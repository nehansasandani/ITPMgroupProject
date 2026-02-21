import Skill from "../models/Skill.js";

// GET
export const getMySkills = async (req, res) => {
  try {
    const userId = req.userId;

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ skills });
  } catch (err) {
    console.log("GET skills error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST
export const addSkill = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, subCategory, skill, level } = req.body;

    if (!category || !subCategory || !skill || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
    const userId = req.userId;
    const skillId = req.params.id;

    await Skill.deleteOne({ _id: skillId, userId });

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ skills });
  } catch (err) {
    console.log("DELETE skill error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
