import Skill from "../models/Skill.js";
import Quiz from "../models/Quiz.js";
import { generateQuiz } from "../utils/gemini.js";
import { notifySkillVerified, notifySkillAdded } from "../utils/notificationHelper.js";

// GET all skills for logged in user
export const getMySkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ skills });
  } catch (err) {
    console.log("GET skills error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST add new skill
export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, subCategory, skill, level } = req.body;

    if (!category || !subCategory || !skill || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Skill.findOne({ userId, category, subCategory, skill });
    if (exists) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    await Skill.create({ userId, category, subCategory, skill, level });
    
    // Send notification
    await notifySkillAdded(userId, skill, level);

    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    res.status(201).json({ skills });
  } catch (err) {
    console.log("ADD skill error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE remove skill
export const removeSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;
    await Skill.deleteOne({ _id: skillId, userId });
    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ skills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/skills/quiz/:skillId - Generate AI Quiz
export const getQuizForSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;

    const skillObj = await Skill.findOne({ _id: skillId, userId });
    if (!skillObj) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Generate questions using Groq
    console.log(`Generating AI quiz for ${skillObj.skill} (${skillObj.level})`);
    const questionsWithAnswers = await generateQuiz(skillObj.skill, skillObj.level);

    // Save quiz to DB for verification later (expires automatically via TTL)
    await Quiz.findOneAndDelete({ userId, skillId }); // Clear old quiz if exists
    
    const newQuiz = await Quiz.create({
      userId,
      skillId,
      skillName: skillObj.skill,
      questions: questionsWithAnswers
    });

    // Strip correctIndex before sending to frontend
    const questionsForFrontend = questionsWithAnswers.map((q, idx) => ({
      id: idx,
      question: q.question,
      options: q.options
    }));

    console.log(`✅ Quiz generated successfully for ${skillObj.skill}`);
    res.status(200).json(questionsForFrontend);
  } catch (err) {
    console.error("❌ Quiz Generation Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/skills/quiz/submit - Verify AI Quiz
export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId, answers } = req.body;
    
    if (!skillId || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the stored quiz
    const storedQuiz = await Quiz.findOne({ userId, skillId });
    if (!storedQuiz) {
      return res.status(404).json({ message: "Quiz expired or not found. Please regenerate." });
    }

    // Evaluate answers
    let score = 0;
    storedQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        score++;
      }
    });
    
    // Pass condition: 4/5 or more
    const passed = score >= 4;
    const percentage = Math.round((score / 5) * 100);

    if (passed) {
      await Skill.updateOne(
        { _id: skillId, userId },
        { isVerified: true }
      );
      
      // Find the skill name for notification
      const skill = await Skill.findById(skillId);
      
      // Send notification
      await notifySkillVerified(userId, skill.skill, percentage);
      
      // Clean up quiz after successful verification
      await Quiz.deleteOne({ _id: storedQuiz._id });
    }
    
    // Fetch fresh list after potential update
    const skills = await Skill.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ 
      score, 
      passed, 
      skills,
      review: storedQuiz.questions // Full questions with correctIndex and explanation
    });
  } catch (err) {
    console.error("Quiz Submission Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
