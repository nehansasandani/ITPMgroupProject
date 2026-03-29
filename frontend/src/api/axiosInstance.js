import axios from "axios";

const axiosInstance = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
=======
  baseURL: "http://localhost:5000/api", // your backend URL
  withCredentials: true,
});

// Add JWT token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // make sure token is stored after login
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

<<<<<<< HEAD
export default axiosInstance;
=======
export default axiosInstance;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
