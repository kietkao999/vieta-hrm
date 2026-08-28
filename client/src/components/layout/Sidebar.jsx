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
  GraduationCap,
  Compass,
  ShieldAlert,
  Lightbulb,
  BarChart3,
  Database,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Building,
  Layers,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    tochuc: true,
    caidathrm: true,
    nhansu: true,
    phattrien: false,
    ghinhan: false,
    baocao: false,
    hethong: false
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const menuGroups = [
    {
      id: 'tochuc',
      title: 'TỔ CHỨC',
      roles: ['ADMIN', 'HR'],
      items: [
        { name: 'Chi nhánh', path: '/branches', icon: Building, roles: ['ADMIN', 'HR'] }
      ]
    },
    {
      id: 'caidathrm',
      title: 'CÀI ĐẶT HRM',
      roles: ['ADMIN', 'HR'],
      items: [
        { name: 'Phòng ban & Chức vụ', path: '/settings/departments-positions', icon: Layers, roles: ['ADMIN', 'HR'] }
      ]
    },
    {
      id: 'nhansu',
      title: 'NHÂN SỰ',
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
      items: [
        { name: 'Hồ sơ nhân viên', path: '/employees', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Chấm công', path: '/attendance', icon: Calendar, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Nghỉ phép', path: '/leave', icon: Clock, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Hợp đồng', path: '/contracts', icon: FileText, roles: ['ADMIN', 'HR', 'MANAGER'] },
        { name: 'Lương', path: '/payroll', icon: DollarSign, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { name: 'Thâm niên & Công tác', path: '/seniority', icon: Award, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] }
      ]
    },
    {
      id: 'phattrien',
      title: 'PHÁT TRIỂN NHÂN VIÊN',
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
      items: [
        { name: 'KPI & Đánh giá', path: '/kpi', icon: TrendingUp, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Đào tạo', path: '/training', icon: GraduationCap, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Lộ trình nghề nghiệp', path: '/career', icon: Compass, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] }
      ]
    },
    {
      id: 'ghinhan',
      title: 'GHI NHẬN',
      roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
      items: [
        { name: 'Khen thưởng', path: '/rewards', icon: Award, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Kỷ luật', path: '/discipline', icon: ShieldAlert, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
        { name: 'Sáng kiến & Cải tiến', path: '/innovations', icon: Lightbulb, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] }
      ]
    },
    {
      id: 'baocao',
      title: 'BÁO CÁO',
      roles: ['ADMIN', 'HR', 'MANAGER'],
      items: [
        { name: 'Báo cáo tổng hợp', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'HR', 'MANAGER'] }
      ]
    },
    {
      id: 'hethong',
      title: 'HỆ THỐNG',
      roles: ['ADMIN'],
      items: [
        { name: 'Tài khoản & Quyền', path: '/users', icon: Shield, roles: ['ADMIN'] },
        { name: 'Nhật ký thao tác', path: '/audit-logs', icon: Database, roles: ['ADMIN'] },
        { name: 'Sao lưu cơ sở dữ liệu', path: '/backup', icon: Database, roles: ['ADMIN'] }
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg">
              VA
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-sm">VIỆT Á HRM</span>
              <p className="text-[10px] text-slate-400">Doanh Nghiệp Việt Á</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-800 lg:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {menuGroups.map((group) => {
            // Check if user has permission to see group
            if (!group.roles.includes(user?.roleName)) return null;

            return (
              <div key={group.id} className="space-y-1">
                {/* Header group */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-slate-200"
                >
                  <span>{group.title}</span>
                  {expandedGroups[group.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {/* Sub items */}
                {expandedGroups[group.id] && (
                  <div className="space-y-1 pl-1">
                    {group.items.map((item) => {
                      if (!item.roles.includes(user?.roleName)) return null;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            isActive(item.path)
                              ? 'bg-brand-500 text-white shadow-md'
                              : 'hover:bg-slate-800 hover:text-slate-100'
                          }`}
                        >
                          <Icon size={16} className={isActive(item.path) ? 'text-white' : 'text-slate-400'} />
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-white font-medium">
              {user?.fullname ? user.fullname.charAt(0) : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.fullname}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.roleDisplayName}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
