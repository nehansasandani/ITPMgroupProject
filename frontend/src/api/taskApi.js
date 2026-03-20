import axiosInstance from "./axiosInstance";

export async function createTask(data) {
  const res = await axiosInstance.post("/tasks", data);
  return res.data;
}

export async function getMyTasks() {
  const res = await axiosInstance.get("/tasks/mine");
  return res.data;
}

export async function getOpenTasks() {
  const res = await axiosInstance.get("/tasks/open");
  return res.data;
}

export async function getAcceptedByMeTasks() {
  const res = await axiosInstance.get("/tasks/accepted-by-me");
  return res.data;
}

export async function getTaskById(taskId) {
  const res = await axiosInstance.get(`/tasks/${taskId}`);
  return res.data;
}

export async function updateTask(taskId, data) {
  const res = await axiosInstance.patch(`/tasks/${taskId}`, data);
  return res.data;
}

export async function acceptTask(taskId) {
  const res = await axiosInstance.patch(`/tasks/${taskId}/accept`);
  return res.data;
}

export async function cancelTask(taskId) {
  const res = await axiosInstance.patch(`/tasks/${taskId}/cancel`);
  return res.data;
}

export async function deleteTask(taskId) {
  const res = await axiosInstance.delete(`/tasks/${taskId}`);
  return res.data;
}