import axios from "./axiosInstance.js";

export const submitRating = async (ratingData) => {
  const response = await axios.post("/ratings", ratingData);
  return response.data;
};

export const getUserRatings = async (userId) => {
  const response = await axios.get(`/ratings/${userId}`);
  return response.data;
};