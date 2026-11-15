import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('schemesaarthi_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        setUser(res.data);
      } catch (err) {
        console.error('Session expired or invalid', err);
        localStorage.removeItem('schemesaarthi_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('schemesaarthi_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (fullName, email, password) => {
    const res = await authService.register(fullName, email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('schemesaarthi_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('schemesaarthi_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
