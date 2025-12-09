import axios from "axios";
import { logOutUser } from "@/utils/logout";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // VERY IMPORTANT for cookies
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await logOutUser();
      window.location.href = "/login"; // safest, no hook needed
    }
    return Promise.reject(error);
  }
);

export default api;
