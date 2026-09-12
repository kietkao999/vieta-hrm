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
  ChevronRight
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
        let totalEmployees = 0;
        let activeContracts = 0;
        let pendingLeaves = 0;
        let deptEmployees = [];
        let personalPayroll = null;
        let personalAttendance = 26;
        let recentLogs = [];

        // 1. Lấy danh sách nhân viên (Backend tự động phân quyền theo role & department)
        try {
          const empRes = await api.get('/employees?limit=100');
          if (empRes.data) {
            deptEmployees = empRes.data.data || [];
            totalEmployees = empRes.data.pagination?.total || deptEmployees.length;
          }
        } catch (e) { console.error(e); }

        // 2. Lấy đơn nghỉ phép
        try {
          const leaveRes = await api.get('/leave-requests?status=Chờ duyệt');
          pendingLeaves = leaveRes.data?.length || 0;
        } catch (e) { console.error(e); }

        // 3. Lấy số hợp đồng hiệu lực (Admin/HR)
        if (user.roleName === 'ADMIN' || user.roleName === 'HR') {
          try {
            const contractRes = await api.get('/contracts?status=Có hiệu lực');
            activeContracts = contractRes.data?.length || 0;
          } catch (e) { console.error(e); }

          try {
            const logRes = await api.get('/system/audit-logs');
            recentLogs = (logRes.data || []).slice(0, 5);
          } catch (e) { console.error(e); }
        }

        // 4. Lấy phiếu lương cá nhân (cho nhân viên / trưởng phòng)
        try {
          const payrollRes = await api.get('/payroll?month=09&year=2026');
          if (payrollRes.data && payrollRes.data.length > 0) {
            personalPayroll = payrollRes.data[0];
          }
        } catch (e) { console.error(e); }

        setStats({
          totalEmployees,
          activeContracts,
          pendingLeaves,
          deptEmployees,
          personalPayroll,
          personalAttendance,
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

  // Layout 1: Dashboard cho Admin và HR
  const renderAdminHRDashboard = () => (
    <div className="space-y-6">
      {renderUserWelcomeBanner('from-slate-900 via-slate-800 to-brand-700', 'bg-red-500/20 text-red-200 border border-red-400/30')}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">TỔNG NHÂN SỰ TOÀN CÔNG TY</p>
            <p className="text-xl font-bold text-slate-800">{stats.totalEmployees} nhân sự</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">HỢP ĐỒNG HIỆU LỰC</p>
            <p className="text-xl font-bold text-slate-800">{stats.activeContracts} hợp đồng</p>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Access Menu */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Các phân hệ quản lý chính</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Link to="/employees" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Users className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Hồ sơ Nhân sự</span>
            </Link>
            <Link to="/attendance" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Calendar className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Chấm công tháng</span>
            </Link>
            <Link to="/payroll" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <DollarSign className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Bảng lương Công ty</span>
            </Link>
            <Link to="/kpi" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <TrendingUp className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Đánh giá KPI</span>
            </Link>
            <Link to="/rewards" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Award className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Khen thưởng & Kỷ luật</span>
            </Link>
            <Link to="/users" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Shield className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Phân quyền tài khoản</span>
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
            <p className="text-xs font-semibold text-slate-400 uppercase">PHIẾU LƯƠNG CÁ NHÂN</p>
            <Link to="/payroll" className="text-xs font-bold text-brand-700 hover:underline flex items-center mt-1">
              <span>Tra cứu phiếu lương</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

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
