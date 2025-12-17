import axios from "axios";

export const logOutUser = async () => {
  // API call only — no navigate, no context
  try {
    await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`,{withCredentials:true});
    localStorage.setItem("loggedIn",false);
  } catch (err) {
    console.log("Logout API failed:", err);
  }
};
