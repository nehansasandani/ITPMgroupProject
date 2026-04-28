import axiosInstance from './axiosInstance';

/**
 * Submit an endorsement for a user's skill
 */
export const submitEndorsement = async (endorseeId, skill, sessionId, message = '') => {
  try {
    const response = await axiosInstance.post('/endorsements', {
      endorseeId,
      skill,
      sessionId,
      message,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error submitting endorsement:', error);
    throw error;
  }
};

/**
 * Get all endorsements for a user
 */
export const getEndorsements = async (userId) => {
  try {
    const response = await axiosInstance.get(`/endorsements/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    throw error;
  }
};

/**
 * Get endorsement summary for a user (count by skill)
 */
export const getEndorsementSummary = async (userId) => {
  try {
    const response = await axiosInstance.get(`/endorsements/${userId}/summary`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching endorsement summary:', error);
    throw error;
  }
};

/**
 * Get endorsements for a specific skill
 */
export const getEndorsementsBySkill = async (userId, skill) => {
  try {
    const response = await axiosInstance.get(`/endorsements/${userId}/skill/${skill}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching skill endorsements:', error);
    throw error;
  }
};
