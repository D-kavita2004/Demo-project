import axios from "axios";
import { logOutUser } from "@/utils/logout";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
if (error?.response?.status === 302) {

      await logOutUser();
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;
