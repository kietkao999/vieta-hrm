import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Nơi định hướng quay lại sau login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper đăng nhập nhanh phục vụ kiểm thử
  const handleQuickLogin = (userType) => {
    switch (userType) {
      case 'admin':
        setUsername('admin');
        setPassword('Admin@123');
        break;
      case 'hr':
        setUsername('hr_manager');
        setPassword('Hr@123');
        break;
      case 'manager':
        setUsername('dept_manager');
        setPassword('Manager@123');
        break;
      case 'employee':
        setUsername('employee1');
        setPassword('Emp@123');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 px-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
          <div className="bg-brand-700 p-8 text-center text-white relative">
            <div className="absolute top-4 right-4 text-white/20">
              <Shield size={64} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold tracking-wide">VIỆT Á HRM SYSTEM</h2>
              <p className="mt-1 text-xs text-indigo-200">CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {location.search.includes('expired') && !error && (
              <div className="flex items-center space-x-2 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-700 border border-amber-200">
                <AlertCircle size={16} className="text-amber-500 shrink-0" />
                <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">TÊN ĐĂNG NHẬP</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">MẬT KHẨU</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:bg-slate-400 shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>ĐANG ĐĂNG NHẬP...</span>
                </>
              ) : (
                <span>ĐĂNG NHẬP</span>
              )}
            </button>
          </form>

          {/* Quick Login Section for Developer & User testing roles */}
          <div className="border-t border-slate-100 bg-slate-50 p-6">
            <p className="text-center text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-3">
              TÀI KHOẢN THỬ NGHIỆM ĐĂNG NHẬP NHANH
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 text-center transition-all cursor-pointer"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('hr')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 text-center transition-all cursor-pointer"
              >
                HR MANAGER
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 text-center transition-all cursor-pointer"
              >
                QUẢN LÝ
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 text-center transition-all cursor-pointer"
              >
                NHÂN VIÊN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
