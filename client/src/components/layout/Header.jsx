import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, LogOut, User, Lock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Left side: Hamburger and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 lg:hidden text-slate-600"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="Việt Á Logo" className="h-10 object-contain rounded-md" />
          <div>
            <h1 className="text-lg font-bold text-slate-800 hidden md:block">
              CÔNG TY TNHH TM SX VIỆT Á
            </h1>
            <h1 className="text-sm font-bold text-slate-800 md:hidden">
              VIỆT Á HRM
            </h1>
          </div>
        </div>
      </div>

      {/* Right side: User Profile dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
        >
          <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-medium shadow-sm">
            {user?.fullname ? user.fullname.charAt(0) : 'U'}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-800">{user?.fullname}</p>
            <p className="text-[10px] text-slate-400 font-medium">{user?.roleDisplayName}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg ring-1 ring-black/5 z-20 animate-in fade-in-50 slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400">Đang đăng nhập bằng</p>
                <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                <span className="inline-block mt-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                  {user?.roleDisplayName}
                </span>
              </div>

              <Link
                to="/"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User size={16} className="text-slate-400" />
                <span>Trang cá nhân (Dashboard)</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={16} className="text-red-400" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
