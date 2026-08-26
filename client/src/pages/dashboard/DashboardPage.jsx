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
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    pendingLeaves: 0,
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
        let recentLogs = [];

        // 1. Lấy tổng số nhân viên (tự động phân quyền theo Backend)
        try {
          const empRes = await api.get('/employees?limit=1');
          totalEmployees = empRes.data.pagination?.total || 0;
        } catch (e) { console.error(e); }

        // 2. Lấy đơn nghỉ phép chờ duyệt (tự động phân quyền theo Backend)
        try {
          const leaveRes = await api.get('/leave-requests?status=Chờ duyệt');
          pendingLeaves = leaveRes.data?.length || 0;
        } catch (e) { console.error(e); }

        // 3. Lấy số hợp đồng hiệu lực (chỉ admin/HR được xem)
        if (user.roleName === 'ADMIN' || user.roleName === 'HR') {
          try {
            const contractRes = await api.get('/contracts?status=Hiệu lực');
            activeContracts = contractRes.data?.length || 0;
          } catch (e) { console.error(e); }
        }

        // 4. Lấy audit logs nếu là admin
        if (user.roleName === 'ADMIN') {
          try {
            const logRes = await api.get('/system/audit-logs');
            recentLogs = logRes.data.slice(0, 5);
          } catch (e) { console.error(e); }
        }

        setStats({
          totalEmployees,
          activeContracts,
          pendingLeaves,
          recentLogs,
          recentNotifications: [
            { id: 1, title: 'Thông báo hệ thống', content: 'Hệ thống Quản lý Nhân sự mới đã đi vào hoạt động chính thức.', date: 'Hôm nay' },
            { id: 2, title: 'Thông báo nhân sự', content: 'Vui lòng cập nhật thông tin và thưởng KPI cho nhân viên nếu có thay đổi.', date: 'Hôm nay' }
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

  // Layout 1: Dashboard cho Admin và HR
  const renderAdminHRDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-700 p-6 text-white shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold">Chào mừng trở lại, {user?.fullname}!</h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Hôm nay là ngày {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Bạn đang đăng nhập với quyền <span className="font-semibold text-brand-100">{user?.roleDisplayName}</span>.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG NHÂN SỰ</p>
            <p className="text-xl font-bold text-slate-800">{stats.totalEmployees} nhân sự</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">HỢP ĐỒNG HIỆU LỰC</p>
            <p className="text-xl font-bold text-slate-800">{stats.activeContracts} hợp đồng</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">ĐƠN NGHỈ PHÉP CHỜ DUYỆT</p>
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
            <Link to="/leave" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Clock className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Đơn xin nghỉ phép</span>
            </Link>
            <Link to="/payroll" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <DollarSign className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Quản lý Lương</span>
            </Link>
            <Link to="/kpi" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <TrendingUp className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Đánh giá KPI</span>
            </Link>
            <Link to="/innovations" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-brand-500 hover:bg-brand-50/50 group transition-all text-center">
              <Lightbulb className="text-slate-400 group-hover:text-brand-500 mb-2 transition-colors" size={28} />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700">Sáng kiến cải tiến</span>
            </Link>
          </div>
        </div>

        {/* Notifications and system state */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông báo mới nhận</h3>
          <div className="space-y-3">
            {stats.recentNotifications.map(n => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-lg space-y-1">
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
      {user.roleName === 'ADMIN' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nhật ký thao tác hệ thống gần đây</h3>
            <Link to="/audit-logs" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1">
              <span>Xem chi tiết</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5">Người dùng</th>
                  <th className="py-2.5">Thao tác</th>
                  <th className="py-2.5">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 text-slate-600 hover:bg-slate-50/50">
                    <td className="py-2">{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td className="py-2 font-semibold text-slate-700">{log.username}</td>
                    <td className="py-2">{log.action}</td>
                    <td className="py-2 font-mono text-[10px]">{log.ip_address}</td>
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
      )}
    </div>
  );

  // Layout 2: Dashboard cho Trưởng Phòng / Quản lý
  const renderManagerDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-slate-800 to-brand-700 p-6 text-white shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold">Xin chào Trưởng phòng, {user?.fullname}!</h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Bạn đang quản lý điều hành các nhân sự thuộc phòng ban được phân quyền.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">NHÂN VIÊN CẤP DƯỚI</p>
            <p className="text-xl font-bold text-slate-800">{stats.totalEmployees} Nhân sự</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">DUYỆT NGHỈ PHÉP CHỜ</p>
            <p className="text-xl font-bold text-slate-800">{stats.pendingLeaves} đơn chờ duyệt</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">ĐÁNH GIÁ KPI THÁNG</p>
            <p className="text-xl font-bold text-slate-800">Hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Danh sách nhân viên phòng ban</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5">Mã NV</th>
                <th className="py-2.5">Họ tên</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Chức vụ</th>
                <th className="py-2.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50 text-slate-600">
                <td className="py-2.5 font-bold text-brand-700">NV0004</td>
                <td className="py-2.5 font-semibold text-slate-800">Nguyễn Hoàng Nam</td>
                <td className="py-2.5">nam.nguyen@vieta.com.vn</td>
                <td className="py-2.5">Nhân viên Kinh doanh</td>
                <td className="py-2.5"><span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">Đang làm việc</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Layout 3: Dashboard cho Nhân viên
  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 via-indigo-800 to-indigo-900 p-6 text-white shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold">Chào bạn, {user?.fullname}!</h2>
        <p className="mt-1 text-xs md:text-sm text-slate-300">
          Xem thông tin chấm công, gửi yêu cầu nghỉ phép và kiểm tra phiếu lương cá nhân của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">NGÀY CÔNG THÁNG NÀY</p>
            <p className="text-xl font-bold text-slate-800">22.5 ngày công</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">PHÉP NĂM CÒN LẠI</p>
            <p className="text-xl font-bold text-slate-800">12 ngày</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">KPI HIỆN TẠI</p>
            <p className="text-xl font-bold text-slate-800">92 điểm (A)</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">LƯƠNG THỰC NHẬN MỚI NHẤT</p>
            <p className="text-xl font-bold text-slate-800">13,000,000 đ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Leave Requests shortcut */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Đơn nghỉ phép cá nhân</h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-3">Bạn cần xin nghỉ phép năm hoặc có việc riêng?</p>
            <Link to="/leave" className="inline-flex items-center space-x-1 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800 transition-colors shadow">
              <span>Tạo đơn phép mới</span>
            </Link>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nhật ký chấm công gần đây</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">25/08/2026</span>
              <span className="font-semibold text-slate-800">07:55 - 17:05</span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">Đúng giờ</span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">24/08/2026</span>
              <span className="font-semibold text-slate-800">08:05 - 17:00</span>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">Đi trễ 5p</span>
            </div>
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
  if (user.roleName === 'ADMIN' || user.roleName === 'HR') {
    return renderAdminHRDashboard();
  } else if (user.roleName === 'MANAGER') {
    return renderManagerDashboard();
  } else {
    return renderEmployeeDashboard();
  }
};

export default DashboardPage;
