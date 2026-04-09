import axiosInstance from "./axiosInstance";

// Get logged-in user skills
export const getMySkills = async () => {
  const res = await axiosInstance.get("/skills");
  return res.data;
};

// Add new skill
export const addSkill = async (skillData) => {
  const res = await axiosInstance.post("/skills", skillData);
  return res.data;
};

// Remove skill
export const removeSkill = async (skillId) => {
  const res = await axiosInstance.delete(`/skills/${skillId}`);
  return res.data;
};

// Skill quiz (assessment)
export const getSkillQuiz = async (skillId) => {
  const res = await axiosInstance.get(`/skills/quiz/${skillId}`);
  return res.data;
};

export const submitSkillQuiz = async (answers, skillId) => {
  const res = await axiosInstance.post(`/skills/quiz/submit`, {
    answers,
    skillId,
  });
  return res.data;
};
