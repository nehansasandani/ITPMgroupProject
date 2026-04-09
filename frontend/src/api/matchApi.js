import axiosInstance from "./axiosInstance";

/** Ranked candidates for the given task (task owner only) */
export async function getRankedCandidates(taskId) {
  const res = await axiosInstance.get(`/match/candidates/${taskId}`);
  return res.data;
}

/** Task owner sends a match request to a specific helper */
export async function createMatchRequest(taskId, helperId) {
  const res = await axiosInstance.post("/match/request", { taskId, helperId });
  return res.data;
}

/** Helper accepts a match request */
export async function acceptMatch(matchId) {
  const res = await axiosInstance.post(`/match/${matchId}/accept`);
  return res.data;
}

/** Helper declines a match request */
export async function declineMatch(matchId) {
  const res = await axiosInstance.post(`/match/${matchId}/decline`);
  return res.data;
}

/** Incoming match requests sent to the current user (as helper) */
export async function getMyMatchRequests() {
  const res = await axiosInstance.get("/match/my-requests");
  return res.data;
}

/** Match requests the current user sent for their tasks (as task owner) */
export async function getMyTaskMatches() {
  const res = await axiosInstance.get("/match/my-task-matches");
  return res.data;
}

/** Session details for a specific task */
export async function getSessionByTask(taskId) {
  const res = await axiosInstance.get(`/match/session/${taskId}`);
  return res.data;
}

/** Top-ranked available helper for an OPEN task (task owner only) */
export async function getTopHelper(taskId) {
  const res = await axiosInstance.get(`/match/top-helper/${taskId}`);
  return res.data;
}

/** All sessions where the current user is poster or helper */
export async function getMySessions() {
  const res = await axiosInstance.get("/match/my-sessions");
  return res.data;
}
