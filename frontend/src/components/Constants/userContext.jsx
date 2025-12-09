import { createContext, useState, useEffect } from "react";
import api from "@/api/axiosInstance";


export const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(null); // stores user info
  const [loading, setLoading] = useState(true); // loading state while verifying
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Verify token on app load
  useEffect(() => {
    const verifyUser = async () => {
      try {

        const response = await api.get(`/verify-token`, {
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

  if (loading) {
    return <div>Loading...</div>; // or your loader
  }
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
