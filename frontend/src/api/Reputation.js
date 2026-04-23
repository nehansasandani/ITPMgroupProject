import axiosInstance from "./axiosInstance";

export const getReputation = async (userId) => {
  const res = await axiosInstance.get(`/reputation/${userId}`);
  return res.data;
};

export const getUserRatings = async (userId) => {
  const res = await axiosInstance.get(`/reputation/ratings/${userId}`);
  return res.data;
};

export const getLeaderboard = (params = {}) =>
  axiosInstance.get("/reputation/leaderboard", { params }).then(r => r.data);

/**
 * Get reputation change history for a user
 */
export const getReputationHistory = async (userId, limit = 50, skip = 0) => {
  try {
    const response = await axiosInstance.get(`/reputation/${userId}/history`, {
      params: { limit, skip },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    throw error;
  }
};

/**
 * Get reputation settings for a user
 */
export const getReputationSettings = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reputation/${userId}/settings`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reputation settings:', error);
    throw error;
  }
};

/**
 * Update user's score visibility preference
 */
export const updateScoreVisibility = async (userId, visibility) => {
  try {
    const response = await axiosInstance.patch(
      `/reputation/${userId}/visibility`,
      { visibility }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating score visibility:', error);
    throw error;
  }
};

/**
 * Get AI-powered reputation insights (explanation, suggestions, anomalies)
 */
export const getReputationInsights = async (userId) => {
  try {
    const response = await axiosInstance.get(`/reputation/${userId}/insights`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reputation insights:', error);
    throw error;
  }
};

/**
 * Get reputation score prediction for future days
 */
export const predictReputationScore = async (userId, daysAhead = 7) => {
  try {
    const response = await axiosInstance.get(`/reputation/${userId}/predict`, {
      params: { daysAhead },
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting reputation score:', error);
    throw error;
  }
};