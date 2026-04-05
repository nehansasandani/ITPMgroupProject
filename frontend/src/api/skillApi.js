import axiosInstance from "./axiosInstance";

// Get logged-in user skills
export const getMySkills = async () => {
<<<<<<< HEAD
  const res = await axiosInstance.get("/skills");
=======
<<<<<<< HEAD
  const res = await axiosInstance.get("/skills");
=======
  const res = await axiosInstance.get("/users/me/skills");
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
  return res.data;
};

// Add new skill
export const addSkill = async (skillData) => {
<<<<<<< HEAD
  const res = await axiosInstance.post("/skills", skillData);
=======
<<<<<<< HEAD
  const res = await axiosInstance.post("/skills", skillData);
=======
  const res = await axiosInstance.post("/users/me/skills", skillData);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
  return res.data;
};

// Remove skill
export const removeSkill = async (skillId) => {
<<<<<<< HEAD
  const res = await axiosInstance.delete(`/skills/${skillId}`);
  return res.data;
};

export const getSkillQuiz = async (skillName) => {
  const res = await axiosInstance.get(`/skills/quiz/${skillName}`);
  return res.data;
};

export const submitSkillQuiz = async (skillName, answers, skillId) => {
  const res = await axiosInstance.post(`/skills/quiz/submit`, { skillName, answers, skillId });
=======
<<<<<<< HEAD
  const res = await axiosInstance.delete(`/skills/${skillId}`);
=======
  const res = await axiosInstance.delete(`/users/me/skills/${skillId}`);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
  return res.data;
};
