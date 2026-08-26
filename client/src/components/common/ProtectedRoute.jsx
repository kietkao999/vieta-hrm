import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-slate-600 text-sm font-medium">Đang tải dữ liệu hệ thống Việt Á...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Lưu lại vị trí định truy cập để quay lại sau khi đăng nhập thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.roleName)) {
    // Nếu đã đăng nhập nhưng không đủ quyền, quay về dashboard chính
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
