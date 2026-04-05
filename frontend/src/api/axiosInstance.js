import axios from "axios";

const axiosInstance = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:5000/api",
=======
<<<<<<< HEAD
  baseURL: "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
=======
  baseURL: "http://localhost:5000/api", // your backend URL
  withCredentials: true,
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
});

axiosInstance.interceptors.request.use((config) => {
<<<<<<< HEAD
  const token = localStorage.getItem("token");
=======
  const token = localStorage.getItem("token"); // make sure token is stored after login
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

<<<<<<< HEAD
export default axiosInstance;
=======
<<<<<<< HEAD
export default axiosInstance;
=======
export default axiosInstance;
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
