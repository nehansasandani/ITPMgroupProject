import axiosInstance from "./axiosInstance";

export const getReputation = async (userId) => {
  const res = await axiosInstance.get(`/reputation/${userId}`);
  return res.data;
};

export const getUserRatings = async (userId) => {
  const res = await axiosInstance.get(`/reputation/ratings/${userId}`);
  return res.data;
};