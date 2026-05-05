import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mindchat-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('mindchat-user', JSON.stringify(data));
  };

  const signup = async (username, email, password) => {
    const { data } = await axios.post('/api/auth/signup', { username, email, password });
    setUser(data);
    localStorage.setItem('mindchat-user', JSON.stringify(data));
  };

  const googleAuth = async (credential) => {
    const { data } = await axios.post('/api/auth/google', { credential });
    setUser(data);
    localStorage.setItem('mindchat-user', JSON.stringify(data));
  };

  const forgotPassword = async (email) => {
    const { data } = await axios.post('/api/auth/forgot-password', { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await axios.post(`/api/auth/reset-password/${token}`, { password });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindchat-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleAuth, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
