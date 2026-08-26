import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra token hiện tại khi khởi chạy ứng dụng
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('viet_a_hrm_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Không thể xác thực token hiện tại:', error);
          localStorage.removeItem('viet_a_hrm_token');
          localStorage.removeItem('viet_a_hrm_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('viet_a_hrm_token', token);
      localStorage.setItem('viet_a_hrm_user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
    }
  };

  const logout = () => {
    localStorage.removeItem('viet_a_hrm_token');
    localStorage.removeItem('viet_a_hrm_user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.roleName);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
