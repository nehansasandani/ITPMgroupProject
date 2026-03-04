import axiosInstance from "./axiosInstance";

export async function registerUser(data) {
  const res = await axiosInstance.post("/users/register", data);
  return res.data;
}

export async function loginUser(data) {
  const res = await axiosInstance.post("/users/login", data);
  return res.data;
}