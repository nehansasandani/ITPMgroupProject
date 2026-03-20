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

export async function cancelTask(taskId) {
  const res = await axiosInstance.patch(`/tasks/${taskId}/cancel`);
  return res.data;
}