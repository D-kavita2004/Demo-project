import { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./userContext";
import api from "@/api/axiosInstance";

export const FormsContext = createContext();

export const FormsProvider = ({ children }) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const [formsList, setFormsList] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Do NOT fetch until user exists and user is finished loading
    if (userLoading) return;
    if (!user) return;

    const fetchAllForms = async () => {
      try {
        const res = await api.post(
          `${apiUrl}/form/allForms`,
          { Team: user.team },
          { withCredentials: true }
        );
        setFormsList(res.data.forms || []);
      } catch (err) {
        console.error("Error fetching forms:", err);
      }
    };

    fetchAllForms();
  }, [user, userLoading]); //  run only when user is ready

  return (
    <FormsContext.Provider value={{ formsList, setFormsList }}>
      {children}
    </FormsContext.Provider>
  );
};
