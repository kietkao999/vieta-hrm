import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Users, 
  Calendar, 
  Clock, 
  Shield, 
  Award, 
  Lightbulb, 
  FileText, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  UserCheck, 
  DollarSign,
  Building2,
  Briefcase,
  ChevronRight,
  Cake
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    pendingLeaves: 0,
    deptEmployees: [],
    personalPayroll: null,
    personalAttendance: 0,
    recentLogs: [],
    recentNotifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const isAdminOrHR = user?.roleName === 'ADMIN' || user?.roleName === 'HR';

        // Tải đồng thời tất cả dữ liệu qua Promise.allSettled (siêu tốc, không bị nghẽn dây chuyền)
        const [empResult, leaveResult, contractResult, logResult, payrollResult] = await Promise.allSettled([
          api.get('/employees?limit=100'),
          api.get('/leave-requests?status=Chờ duyệt'),
          isAdminOrHR ? api.get('/contracts?status=Có hiệu lực') : Promise.resolve({ data: [] }),
          isAdminOrHR ? api.get('/system/audit-logs') : Promise.resolve({ data: [] }),
          api.get('/payroll?year=2026')
        ]);

        let totalEmployees = 0;
        let deptEmployees = [];
        if (empResult.status === 'fulfilled' && empResult.value?.data) {
          deptEmployees = empResult.value.data.data || (Array.isArray(empResult.value.data) ? empResult.value.data : []);
          totalEmployees = empResult.value.data.pagination?.total || deptEmployees.length;
        }

        let pendingLeaves = 0;
        if (leaveResult.status === 'fulfilled' && leaveResult.value?.data) {
          pendingLeaves = Array.isArray(leaveResult.value.data) ? leaveResult.value.data.length : 0;
        }

        let activeContracts = 0;
        if (contractResult.status === 'fulfilled' && contractResult.value?.data) {
          activeContracts = Array.isArray(contractResult.value.data) ? contractResult.value.data.length : 0;
        }

        let recentLogs = [];
        if (logResult.status === 'fulfilled' && logResult.value?.data) {
          recentLogs = (Array.isArray(logResult.value.data) ? logResult.value.data : []).slice(0, 5);
        }

        let personalPayroll = null;
        if (payrollResult.status === 'fulfilled' && payrollResult.value?.data && payrollResult.value.data.length > 0) {
          personalPayroll = payrollResult.value.data[0];
        }

        setStats({
          totalEmployees,
          activeContracts,
          pendingLeaves,
          deptEmployees,
          personalPayroll,
          personalAttendance: 26,
          recentLogs,
          recentNotifications: [
            { id: 1, title: 'Hệ thống HRM 2026', content: 'Chào mừng bạn đến với hệ thống quản trị nhân sự Nệm Việt Á.', date: 'Hôm nay' },
            { id: 2, title: 'Bảo mật thông tin', content: 'Mỗi tài khoản được bảo mật thông tin lương và hồ sơ theo phân quyền.', date: 'Hôm nay' }
          ]
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Banner thông tin người đăng nhập dùng chung
  const renderUserWelcomeBanner = (bgGradient, roleColor) => (
    <div className={`rounded-2xl bg-gradient-to-r ${bgGradient} p-6 text-white shadow-xl relative overflow-hidden`}>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${roleColor}`}>
              {user?.roleDisplayName || user?.roleName}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Mã NV: {user?.employeeCode || user?.username}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Chào mừng trở lại, {user?.fullname || user?.username}!
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-200 flex items-center space-x-2">
            <span>{user?.positionName || user?.position_name || 'Chuyên viên'}</span>
            <span>•</span>
            <span>{user?.departmentName || user?.department_name || 'Công ty TNHH TM SX Việt Á'}</span>
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-slate-300">Thời gian hệ thống</p>
          <p className="text-sm font-semibold text-white">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );

  // Widget Chúc mừng sinh nhật nhân sự trong tháng
  const renderBirthdayWidget = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();

    const birthdayEmployees = (stats.deptEmployees || []).filter(e => {
      if (!e.dob) return false;
      const parts = e.dob.split('-');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === currentMonth;
      }
      const d = new Date(e.dob);
      return !isNaN(d.getTime()) && (d.getMonth() + 1) === currentMonth;
    }).sort((a, b) => {
      const dayA = parseInt(a.dob.split('-')[2] || '0', 10);
      const dayB = parseInt(b.dob.split('-')[2] || '0', 10);
      return dayA - dayB;
    });

    return (
      <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Cake size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Sinh Nhật Trong Tháng {currentMonth < 10 ? `0${currentMonth}` : currentMonth}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Chúc mừng ngày sinh nhật các thành viên công ty</p>
            </div>
          </div>
          <span className="rounded-full bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 border border-rose-200 shadow-sm">
            🎉 {birthdayEmployees.length} nhân sự
          </span>
        </div>

        {birthdayEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
            {birthdayEmployees.map(emp => {
              const day = parseInt(emp.dob?.split('-')[2] || '0', 10);
              const isToday = day === currentDay;
              return (
                <div
                  key={emp.id || emp.code}
                  className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    isToday
                      ? 'bg-rose-100/90 border-rose-400 shadow-md ring-2 ring-rose-400'
                      : 'bg-white border-slate-200/80 hover:border-rose-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    isToday ? 'bg-rose-600 text-white shadow' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {emp.fullname ? emp.fullname.split(' ').pop().charAt(0) : 'NV'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-black text-slate-800 truncate">{emp.fullname}</p>
                      {isToday && (
                        <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 animate-pulse">
                          Hôm nay 🎉
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{emp.position_name || emp.department_name || 'Nệm Việt Á'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {day < 10 ? `0${day}` : day}/{currentMonth < 10 ? `0${currentMonth}` : currentMonth}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs bg-white/80 rounded-xl border border-slate-100">
            Không có thành viên nào có ngày sinh nhật trong tháng {currentMonth}.
          </div>
        )}
      </div>
    );
  };

  // Layout 1: Dashboard cho Admin và HR
  const renderAdminHRDashboard = () => (
    <div className="space-y-6">
      {renderUserWelcomeBanner('from-slate-900 via-slate-800 to-brand-700', 'bg-red-500/20 text-red-200 border border-red-400/30')}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">TỔNG NHÂN SỰ TOÀN CÔNG TY</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalEmployees} nhân sự</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">HỢP ĐỒNG HIỆU LỰC</p>
            <p className="text-2xl font-black text-slate-900">{stats.activeContracts} hợp đồng</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">ĐƠN NGHỈ PHÉP CHỜ DUYỆT</p>
            <p className="text-2xl font-black text-slate-900">{stats.pendingLeaves} đơn</p>
          </div>
        </div>
      </div>

      {/* Birthday Widget */}
      {renderBirthdayWidget()}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Access Menu */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Các phân hệ quản lý chính</h3>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            <Link to="/employees" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-500 hover:bg-blue-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Users size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Hồ sơ Nhân sự</span>
            </Link>
            <Link to="/attendance" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Calendar size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Chấm công tháng</span>
            </Link>
            <Link to="/payroll" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-500 hover:bg-amber-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <DollarSign size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Bảng lương Công ty</span>
            </Link>
            <Link to="/kpi" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-500 hover:bg-indigo-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Đánh giá KPI</span>
            </Link>
            <Link to="/rewards" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-500 hover:bg-purple-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Award size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Khen thưởng & Kỷ luật</span>
            </Link>
            <Link to="/users" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-rose-500 hover:bg-rose-50/40 group transition-all text-center shadow-2xs hover:shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Shield size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700">Phân quyền tài khoản</span>
            </Link>
          </div>
        </div>

        {/* Notifications and system state */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông báo hệ thống</h3>
          <div className="space-y-3">
            {stats.recentNotifications.map(n => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-lg space-y-1 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{n.date}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Audit Logs section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nhật ký thao tác hệ thống gần đây</h3>
          <span className="text-xs text-slate-500">Ghi nhận bảo mật</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Thời gian</th>
                <th className="py-2.5">Người dùng</th>
                <th className="py-2.5">Thao tác</th>
                <th className="py-2.5">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 text-slate-600 hover:bg-slate-50/50">
                  <td className="py-2">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                  <td className="py-2 font-semibold text-slate-700">{log.username}</td>
                  <td className="py-2">{log.action}</td>
                  <td className="py-2 text-slate-500">{log.details}</td>
                </tr>
              ))}
              {stats.recentLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">Không có nhật ký thao tác nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Layout 2: Dashboard cho Trưởng Phòng / Quản lý
  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {renderUserWelcomeBanner('from-teal-900 via-slate-800 to-brand-800', 'bg-amber-400/20 text-amber-200 border border-amber-400/30')}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">NHÂN SỰ TRỰC THUỘC BỘ PHẬN</p>
            <p className="text-xl font-bold text-slate-800">{stats.deptEmployees.length} Nhân sự</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ĐƠN NGHỈ PHÉP CHỜ DUYỆT</p>
            <p className="text-xl font-bold text-slate-800">{stats.pendingLeaves} đơn</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ĐÁNH GIÁ KPI BỘ PHẬN</p>
            <p className="text-xl font-bold text-slate-800">Hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Birthday Widget */}
      {renderBirthdayWidget()}

      {/* Department Staff List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Danh sách nhân sự thuộc {user?.departmentName || user?.department_name || 'Phòng ban'}
            </h3>
            <p className="text-xs text-slate-400">Xem và quản lý nhân viên thuộc bộ phận (Bảo mật: Lương nhân viên được ẩn tự động)</p>
          </div>
          <Link to="/employees" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
            <span>Xem chi tiết</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Mã NV</th>
                <th className="py-2.5">Họ tên</th>
                <th className="py-2.5">Chức vụ</th>
                <th className="py-2.5">Số điện thoại</th>
                <th className="py-2.5">Ngày vào làm</th>
                <th className="py-2.5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.deptEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-50 text-slate-600 hover:bg-slate-50/50">
                  <td className="py-2.5 font-bold text-brand-700 font-mono">{emp.code}</td>
                  <td className="py-2.5 font-semibold text-slate-800">{emp.fullname}</td>
                  <td className="py-2.5">{emp.position_name || 'Nhân viên'}</td>
                  <td className="py-2.5 font-mono">{emp.phone || '---'}</td>
                  <td className="py-2.5">{emp.join_date || '---'}</td>
                  <td className="py-2.5 text-center">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {emp.status || 'Đang làm việc'}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.deptEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">Không có nhân viên nào trong phòng ban.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Layout 3: Dashboard cho Nhân viên
  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      {renderUserWelcomeBanner('from-blue-900 via-indigo-900 to-slate-900', 'bg-blue-400/20 text-blue-200 border border-blue-400/30')}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">NGÀY CÔNG THÁNG 09/2026</p>
            <p className="text-xl font-bold text-slate-800">26 ngày công</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">PHÉP NĂM CÒN LẠI</p>
            <p className="text-xl font-bold text-slate-800">12 ngày</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">KPI THÁNG HIỆN TẠI</p>
            <p className="text-xl font-bold text-slate-800">100% Hoàn thành</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">
              {stats.personalPayroll?.month ? `THỰC LĨNH THÁNG ${stats.personalPayroll.month}/${stats.personalPayroll.year}` : 'THỰC LĨNH THÁNG GẦN NHẤT'}
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.personalPayroll?.net_salary ? Number(stats.personalPayroll.net_salary).toLocaleString('vi-VN') + ' đ' : 'Chưa có phiếu'}
            </p>
            <Link to="/payroll" className="text-[11px] font-bold text-brand-700 hover:underline flex items-center mt-1">
              <span>Xem chi tiết phiếu lương</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Birthday Widget for Employee view */}
      {renderBirthdayWidget()}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Leave Requests shortcut */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Đơn nghỉ phép cá nhân</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-3">Bạn cần tạo đơn xin nghỉ phép hoặc có việc riêng?</p>
            <Link to="/attendance" className="inline-flex items-center space-x-1 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors shadow">
              <span>Gửi yêu cầu nghỉ phép</span>
            </Link>
          </div>
        </div>

        {/* Organization chart shortcut */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sơ đồ tổ chức & Danh bạ</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-3">Tra cứu cơ cấu phòng ban và thông tin liên hệ các bộ phận công ty</p>
            <Link to="/settings/departments-positions" className="inline-flex items-center space-x-1 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors shadow">
              <Building2 size={14} className="mr-1" />
              <span>Xem Sơ đồ tổ chức</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  // Phân phối layout dashboard theo phân quyền người dùng
  if (user?.roleName === 'ADMIN' || user?.roleName === 'HR') {
    return renderAdminHRDashboard();
  } else if (user?.roleName === 'MANAGER') {
    return renderManagerDashboard();
  } else {
    return renderEmployeeDashboard();
  }
};

export default DashboardPage;
