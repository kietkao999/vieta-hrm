import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Khởi tạo ngay lập tức từ bộ nhớ máy (0ms) tránh hiện tượng màn hình trắng chờ mạng
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('viet_a_hrm_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('viet_a_hrm_token');
    const savedUser = localStorage.getItem('viet_a_hrm_user');
    // Nếu đã có token và user trong máy, cho vào ngay (loading = false)
    return !(token && savedUser);
  });

  // Xác thực ngầm trong nền (non-blocking background verification)
  useEffect(() => {
    const checkAuthInBackground = async () => {
      const token = localStorage.getItem('viet_a_hrm_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('viet_a_hrm_user', JSON.stringify(res.data));
          }
        } catch (error) {
          // Chỉ logout nếu thực sự lỗi 401 token hết hạn
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('viet_a_hrm_token');
            localStorage.removeItem('viet_a_hrm_user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuthInBackground();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('viet_a_hrm_token', token);
      localStorage.setItem('viet_a_hrm_user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      
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
