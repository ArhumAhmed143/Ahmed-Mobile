import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('nexorahub_admin_token') || null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount if token exists
  useEffect(() => {
    async function checkAuthSession() {
      const storedToken = localStorage.getItem('nexorahub_admin_token');
      if (storedToken) {
        try {
          const res = await api.getAdminProfile();
          if (res.success && res.admin) {
            setAdmin(res.admin);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Admin session validation failed or expired:', err.message);
          logout();
        }
      } else {
        setAdmin(null);
        setToken(null);
      }
      setLoading(false);
    }
    checkAuthSession();
  }, []);

  const login = async (username, password) => {
    const res = await api.loginAdmin(username, password);
    if (res.success && res.token) {
      localStorage.setItem('nexorahub_admin_token', res.token);
      setToken(res.token);
      setAdmin(res.admin);
      return res;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('nexorahub_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
