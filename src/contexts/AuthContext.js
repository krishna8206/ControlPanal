import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, otp) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email with OTP "123456"
      if (otp === "123456") {
        const userData = { email, id: '1', role: 'admin' };
        setUser(userData);
        localStorage.setItem('auth_token', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid OTP' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('auth_token');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const userData = JSON.parse(token);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}