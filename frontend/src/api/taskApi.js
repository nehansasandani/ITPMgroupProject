import axiosInstance from "./axiosInstance";

export async function createTask(data) {
  const res = await axiosInstance.post("/tasks", data);
  return res.data;
}

export async function getMyTasks() {
  const res = await axiosInstance.get("/tasks/mine");
  return res.data;
}