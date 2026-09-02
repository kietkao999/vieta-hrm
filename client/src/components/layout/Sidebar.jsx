import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Award,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Building2,
  ClipboardList,
  Landmark
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    tochuc: true,
    nhansu: true,
    chamcong: true,
    ghinhan: true,
    hethong: true
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isActive = (path) => location.pathname === path;

  // Cấu trúc sidebar mới, gọn gàng, chuẩn nghiệp vụ
  const menuGroups = [
    {
      id: 'tochuc',
      title: 'TỔ CHỨC',
      roles: ['ADMIN', 'HR'],
      items: [
        { name: 'Phòng ban & Chức danh', path: '/settings/departments-positions', icon: Layers, roles: ['ADMIN', 'HR'] }
      ]
    },
    {
      id: 'nhansu',
      title: 'NHÂN SỰ',
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
      items: [
        { name: 'Hồ sơ nhân viên', path: '/employees', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Hợp đồng lao động', path: '/contracts', icon: FileText, roles: ['ADMIN', 'HR', 'MANAGER'] }
      ]
    },
    {
      id: 'chamcong',
      title: 'CHẤM CÔNG & TIỀN LƯƠNG',
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
      items: [
        { name: 'Chấm công & Nghỉ phép', path: '/attendance', icon: Calendar, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Quản lý KPI', path: '/kpi', icon: TrendingUp, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Bảng lương', path: '/payroll', icon: DollarSign, roles: ['ADMIN', 'HR', 'EMPLOYEE'] }
      ]
    },
    {
      id: 'ghinhan',
      title: 'GHI NHẬN',
      roles: ['ADMIN', 'HR', 'MANAGER'],
      items: [
        { name: 'Khen thưởng & Kỷ luật', path: '/rewards', icon: Award, roles: ['ADMIN', 'HR', 'MANAGER'] }
      ]
    },
    {
      id: 'hethong',
      title: 'HỆ THỐNG & BÁO CÁO',
      roles: ['ADMIN', 'HR', 'MANAGER'],
      items: [
        { name: 'Báo cáo thống kê', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'HR', 'MANAGER'] },
        { name: 'Phân quyền tài khoản', path: '/users', icon: Shield, roles: ['ADMIN'] }
      ]
    }
  ];

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar main panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-slate-800 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-2.5" onClick={() => setIsOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm shadow-md">
              VA
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-[13px]">VIỆT Á HRM</span>
              <p className="text-[10px] text-slate-500 leading-none">Quản lý Nhân sự</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-800 lg:hidden text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation List — compact padding */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuGroups.map((group) => {
            if (!group.roles.includes(user?.roleName)) return null;

            const visibleItems = group.items.filter(item => item.roles.includes(user?.roleName));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between py-1.5 px-2 text-[10px] font-bold tracking-[0.08em] text-slate-500 hover:text-slate-300 uppercase transition-colors"
                >
                  <span>{group.title}</span>
                  {expandedGroups[group.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {/* Menu Items */}
                {expandedGroups[group.id] && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all ${
                            isActive(item.path)
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <Icon size={15} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer info in sidebar */}
        <div className="px-3 py-3 border-t border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-white font-medium text-xs">
              {user?.fullname ? user.fullname.charAt(0) : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.fullname}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.roleDisplayName}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
