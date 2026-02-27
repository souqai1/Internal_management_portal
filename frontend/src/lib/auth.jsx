import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "souqai_admin_auth";
const VALID_PASSWORD = "Souqai2025";

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") setAuthenticated(true);
    setLoading(false);
  }, []);

  const login = (password) => {
    if (password === VALID_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
