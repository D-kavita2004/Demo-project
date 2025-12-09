import { createContext, useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  
  const [user, setUser] = useState(null); // stores user info
  const [loading, setLoading] = useState(true); // loading state while verifying

  // Verify token on app load
  useEffect(() => {
    const verifyUser = async () => {
      try {

        const response = await axios.get(`http://localhost:3000/verify-token`, {
          withCredentials: true,
        });
        console.log("here is my response",response);
        if (response.status === 200) {
          setUser(response.data); 
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Token verification failed:", err.response?.data || err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
