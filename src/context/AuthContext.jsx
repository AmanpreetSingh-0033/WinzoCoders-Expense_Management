import { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    // No subscription needed with stubbed authService
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await authService.signIn(email, password);
    const profile = await authService.getCurrentUser();
    setUser(profile);
    return profile;
  };

  const signUp = async (email, password, userData) => {
    await authService.signUp(email, password, userData);
    return await signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    isEmployee: user?.role === "employee",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
