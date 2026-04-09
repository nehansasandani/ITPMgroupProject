import axiosInstance from "./axiosInstance";

/** Fetch all messages for a session (participants only) */
export async function getMessages(sessionId) {
  const res = await axiosInstance.get(`/messages/${sessionId}`);
  return res.data;
}

/** Send a message to the session chat */
export async function sendMessage(sessionId, content) {
  const res = await axiosInstance.post(`/messages/${sessionId}`, { content });
  return res.data;
}
