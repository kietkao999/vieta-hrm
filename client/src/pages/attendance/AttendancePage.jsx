import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  Clock3,
  Download,
  Plus,
  Filter,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Printer,
  ClipboardList,
  FileText,
  Search,
  Building2,
  Users,
  LayoutGrid,
  ListFilter,
  TrendingUp,
  X,
  RotateCcw,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TimesheetMatrixView from './TimesheetMatrixView';

/* ═══════════════════════════════════════════════════════════════
   AttendancePage — Hợp nhất "Bảng Chấm Công" + "Đơn Xin Nghỉ Phép"
   ═══════════════════════════════════════════════════════════════ */

const AttendancePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state — 'attendance' | 'leaves'
  const initialTab = searchParams.get('tab') === 'leaves' ? 'leaves' : 'attendance';
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'leaves' ? { tab: 'leaves' } : {});
  };

  // ─── CHẤM CÔNG STATE ───
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [attRecords, setAttRecords] = useState([]);
  const [attLoading, setAttLoading] = useState(true);
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  // Bộ lọc tối ưu cho Bảng chấm công
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusAttFilter, setStatusAttFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' (Bảng tính Google Sheets) | 'summary' (Tổng hợp) | 'list' (Chi tiết)

  const [attModalOpen, setAttModalOpen] = useState(false);
  const [attFormData, setAttFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    check_in: '',
    check_out: '',
    status: 'Có mặt',
    note: ''
  });

  // ─── NGHỈ PHÉP STATE ───
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: 'Phép năm',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // ─── SHARED STATE ───
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tải danh mục phòng ban
  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data || []))
      .catch(err => console.error('Lỗi tải danh mục phòng ban:', err));
  }, []);

  // ═══ CHẤM CÔNG LOGIC ═══
  const fetchAttendance = async () => {
    setAttLoading(true);
    try {
      const params = { month, year };
      if (departmentFilter && departmentFilter !== 'all') params.department_id = departmentFilter;
      if (statusAttFilter && statusAttFilter !== 'all') params.status = statusAttFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      const res = await api.get('/attendance', { params });
      setAttRecords(res.data || []);
    } catch (err) {
      setError('Lỗi tải dữ liệu chấm công');
    } finally {
      setAttLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year, departmentFilter, statusAttFilter]);

  // Bộ lọc tức thì trên dữ liệu đã tải
  const filteredRecords = useMemo(() => {
    return attRecords.filter(r => {
      if (departmentFilter !== 'all') {
        const matchDept = String(r.department_id) === String(departmentFilter) || r.department_name === departmentFilter;
        if (!matchDept) return false;
      }
      if (statusAttFilter !== 'all') {
        if (!r.status?.toLowerCase().includes(statusAttFilter.toLowerCase())) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchName = r.fullname?.toLowerCase().includes(term);
        const matchCode = r.employee_code?.toLowerCase().includes(term);
        if (!matchName && !matchCode) return false;
      }
      return true;
    });
  }, [attRecords, departmentFilter, statusAttFilter, searchTerm]);

  // Gom nhóm tổng hợp theo từng nhân viên (Monthly Matrix)
  const employeeSummary = useMemo(() => {
    const map = {};
    filteredRecords.forEach(r => {
      const key = r.employee_id;
      if (!map[key]) {
        map[key] = {
          employee_id: r.employee_id,
          employee_code: r.employee_code,
          fullname: r.fullname,
          department_name: r.department_name,
          position_name: r.position_name,
          fullDays: 0,
          halfDays: 0,
          paidLeaves: 0,
          unpaidLeaves: 0,
          businessTrips: 0,
          weeklyOffs: 0,
          totalWorkDays: 0,
          totalOtHours: 0,
          totalLateMinutes: 0,
          recordsCount: 0
        };
      }
      const item = map[key];
      item.recordsCount += 1;
      item.totalOtHours += (Number(r.ot_hours) || 0);
      item.totalLateMinutes += (Number(r.late_minutes) || 0);

      const st = (r.status || '').toLowerCase();
      if (st.includes('nửa ngày') || st === 'nn') {
        item.halfDays += 1;
        item.totalWorkDays += 0.5;
      } else if (st.includes('phép') || st === 'p') {
        item.paidLeaves += 1;
        item.totalWorkDays += 1.0;
      } else if (st.includes('không lương') || st === 'kl') {
        item.unpaidLeaves += 1;
      } else if (st.includes('công tác') || st === 'ct') {
        item.businessTrips += 1;
        item.totalWorkDays += 1.0;
      } else if (st.includes('tuần') || st === 'off') {
        item.weeklyOffs += 1;
      } else {
        item.fullDays += 1;
        item.totalWorkDays += 1.0;
      }
    });

    return Object.values(map).sort((a, b) => a.fullname.localeCompare(b.fullname, 'vi'));
  }, [filteredRecords]);

  // Thống kê tổng quan đầu trang
  const summaryStats = useMemo(() => {
    const totalDays = employeeSummary.reduce((sum, e) => sum + e.totalWorkDays, 0);
    const totalEmployees = employeeSummary.length;
    const totalFull = employeeSummary.reduce((sum, e) => sum + e.fullDays, 0);
    const totalHalf = employeeSummary.reduce((sum, e) => sum + e.halfDays, 0);
    const totalLeaves = employeeSummary.reduce((sum, e) => sum + e.paidLeaves + e.unpaidLeaves, 0);
    const totalOt = employeeSummary.reduce((sum, e) => sum + e.totalOtHours, 0);
    return { totalDays, totalEmployees, totalFull, totalHalf, totalLeaves, totalOt };
  }, [employeeSummary]);

  const handleResetFilters = () => {
    setDepartmentFilter('all');
    setStatusAttFilter('all');
    setSearchTerm('');
  };

  const handleAttSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', attFormData);
      setSuccess('Ghi nhận chấm công thành công');
      setAttModalOpen(false);
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi ghi nhận');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ═══ NGHỈ PHÉP LOGIC ═══
  const fetchLeaveRequests = async () => {
    setLeaveLoading(true);
    try {
      const res = await api.get(`/leave-requests?status=${statusFilter}`);
      setLeaveRequests(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu nghỉ phép');
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-requests', leaveFormData);
      setSuccess('Tạo đơn xin nghỉ thành công');
      setLeaveModalOpen(false);
      fetchLeaveRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo đơn');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    if (window.confirm(`Bạn có chắc muốn ${status === 'Đã duyệt' ? 'duyệt' : 'từ chối'} đơn này?`)) {
      try {
        await api.put(`/leave-requests/${id}/status`, { status });
        setSuccess(`Đã ${status.toLowerCase()} đơn xin nghỉ`);
        fetchLeaveRequests();
        // Nếu duyệt, reload chấm công để phản ánh trạng thái mới
        if (status === 'Đã duyệt') {
          fetchAttendance();
        }
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi cập nhật');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDeleteLeave = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn này?')) {
      try {
        await api.delete(`/leave-requests/${id}`);
        setSuccess('Đã xóa đơn');
        fetchLeaveRequests();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // ═══ IN ĐƠN XIN NGHỈ PHÉP ═══
  const getDepartmentApprover = (deptName) => {
    switch (deptName) {
      case 'Ban giám đốc':
        return { full: 'Ban giám đốc', short: 'Ban giám đốc' };
      case 'Kho Cần Thơ':
        return { full: 'Quản lý Kho Cần Thơ và Ban giám đốc', short: 'Quản lý Kho Cần Thơ và Ban giám đốc' };
      case 'Kho Mỹ Tho':
        return { full: 'Quản lý Kho Mỹ Tho và Ban giám đốc', short: 'Quản lý Kho Mỹ Tho và Ban giám đốc' };
      case 'Khối văn phòng':
        return { full: 'Trưởng phòng Hành chính Nhân sự và Ban giám đốc', short: 'Trưởng phòng HCNS và Ban giám đốc' };
      case 'Xưởng sản xuất nệm':
        return { full: 'Quản đốc Xưởng sản xuất nệm và Ban giám đốc', short: 'Quản đốc và Ban giám đốc' };
      case 'Phòng kinh doanh':
        return { full: 'Trưởng phòng Kinh doanh và Ban giám đốc', short: 'Trưởng phòng KD và Ban giám đốc' };
      case 'Phòng Marketing':
        return { full: 'Trưởng phòng Marketing và Ban giám đốc', short: 'Trưởng phòng MKT và Ban giám đốc' };
      case 'Xưởng sản xuất gối':
        return { full: 'Trưởng nhóm Xưởng sản xuất gối và Ban giám đốc', short: 'Trưởng nhóm và Ban giám đốc' };
      default:
        return { full: 'Trưởng bộ phận và Ban giám đốc', short: 'Trưởng bộ phận và Ban giám đốc' };
    }
  };

  const handlePrintLeaveRequest = (r) => {
    const approverInfo = getDepartmentApprover(r.department_name);
    const sDate = new Date(r.start_date);
    const eDate = new Date(r.end_date);
    const diffTime = Math.abs(eDate - sDate);
    const daysCount = r.days_count || Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const today = new Date();
    const nowDay = String(today.getDate()).padStart(2, '0');
    const nowMonth = String(today.getMonth() + 1).padStart(2, '0');
    const nowYear = today.getFullYear();

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Đơn xin nghỉ phép - ${r.fullname}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.6;
            color: black;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid black;
            margin-bottom: 25px;
          }
          .header-table td {
            padding: 10px;
            vertical-align: middle;
            border: 1.5px solid black;
          }
          .logo-container { width: 25%; text-align: center; }
          .logo-img { max-height: 55px; max-width: 100%; object-fit: contain; }
          .national-title { width: 75%; text-align: center; }
          .national-title h3 { margin: 0; font-size: 12pt; font-weight: bold; text-transform: uppercase; }
          .national-title p { margin: 4px 0 0 0; font-size: 11pt; }
          .national-motto { font-weight: bold; margin-top: 2px; }
          .doc-title {
            text-align: center; font-size: 16pt; font-weight: bold;
            color: #0000FF; text-transform: uppercase;
            margin-top: 15px; margin-bottom: 20px;
          }
          .content-line { margin-bottom: 10px; text-align: justify; }
          .signatures-container { margin-top: 30px; width: 100%; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-title { font-weight: bold; }
          .signature-subtitle { font-style: italic; font-size: 10.5pt; margin-top: 2px; }
          .signature-space { height: 90px; }
          .no-print { text-align: center; margin-bottom: 20px; }
          .btn-print {
            padding: 8px 16px; background-color: #1e3a8a; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">In Đơn Xin Nghỉ Phép</button>
        </div>

        <table class="header-table">
          <tr>
            <td class="logo-container">
              <img class="logo-img" src="/logo.jpg" alt="VIET A Logo" />
            </td>
            <td class="national-title">
              <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
              <p class="national-motto">Độc lập - Tự do - Hạnh phúc</p>
              <p>-------***-------</p>
            </td>
          </tr>
        </table>

        <div class="doc-title">ĐƠN XIN NGHỈ PHÉP</div>

        <div>
          <div class="content-line" style="text-align: center; margin-bottom: 15px;">
            Kính gửi : ${approverInfo.full}
          </div>
          <div class="content-line">Tên tôi là: ${r.fullname}</div>
          <div class="content-line">Chức vụ: ${r.position_name || 'Nhân viên'}</div>
          <div class="content-line">Bộ phận: ${r.department_name || '....................'}</div>
          <div class="content-line">
            Nay tôi làm đơn này kính xin ${approverInfo.short} chấp thuận cho tôi được nghỉ phép trong thời gian <strong>${daysCount}</strong> ngày
          </div>
          <div class="content-line">
            Kể từ ngày <strong>${r.start_date}</strong> đến hết ngày <strong>${r.end_date}</strong>
          </div>
          <div class="content-line">
            Lý do xin nghỉ phép: ${r.reason || '.......................................................................................................'}
          </div>
          <div class="content-line">
            Tôi đã bàn giao công việc trong thời gian nghỉ phép lại cho đồng nghiệp của tôi
          </div>
          <div class="content-line">
            Rất mong được sự xem xét và chấp thuận. Tôi xin chân thành cảm ơn!
          </div>
        </div>

        <div style="text-align: right; font-style: italic; margin-top: 20px;">
          ........., ngày ${nowDay} tháng ${nowMonth} năm ${nowYear}
        </div>

        <div class="signatures-container">
          <div class="signature-box">
            <div class="signature-title">Người phê duyệt</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-space"></div>
            <div style="border-bottom: 1px dotted black; width: 80%; margin: 0 auto;"></div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Người làm đơn</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-space"></div>
            <strong style="display: block; margin-top: 10px;">${r.fullname}</strong>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ═══ RENDER ═══
  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Chấm Công & Nghỉ Phép</h2>
          <p className="text-xs text-slate-500">Theo dõi giờ làm, chuyên cần và quản lý đơn nghỉ phép</p>
        </div>

        {/* Action buttons — change per tab */}
        <div className="flex space-x-2">
          {activeTab === 'attendance' ? (
            <>
              {user?.roleName !== 'EMPLOYEE' && (
                <button className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                  <Download size={16} />
                  <span>Import Excel</span>
                </button>
              )}
              <button
                onClick={() => {
                  setAttFormData({ date: new Date().toISOString().slice(0, 10), check_in: '', check_out: '', status: 'Có mặt', note: '' });
                  setAttModalOpen(true);
                }}
                className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow"
              >
                <Clock size={16} />
                <span>Chấm công tay</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setLeaveFormData({ leave_type: 'Phép năm', start_date: '', end_date: '', reason: '' });
                setLeaveModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow"
            >
              <Plus size={16} />
              <span>Tạo đơn nghỉ phép</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">{error}</div>}

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl w-fit max-w-full overflow-x-auto custom-scroll-x">
        <button
          onClick={() => switchTab('attendance')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ClipboardList size={16} className={activeTab === 'attendance' ? 'text-brand-700' : 'text-slate-400'} />
          <span>Bảng Chấm Công</span>
        </button>
        <button
          onClick={() => switchTab('leaves')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileText size={16} className={activeTab === 'leaves' ? 'text-brand-700' : 'text-slate-400'} />
          <span>Đơn Xin Nghỉ Phép</span>
          {leaveRequests.filter(r => r.status === 'Chờ duyệt').length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {leaveRequests.filter(r => r.status === 'Chờ duyệt').length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          TAB 1: BẢNG CHẤM CÔNG (ĐÃ TỐI ƯU TỔNG QUAN & LỌC)
         ═══════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <>
          <div className="space-y-4">
          {/* ═══ THẺ THỐNG KÊ TỔNG QUAN ═══ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-white to-brand-50/60 p-4 shadow-sm">
              <div className="flex items-center justify-between text-brand-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tổng công</span>
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xl font-black text-brand-900">{summaryStats.totalDays.toFixed(1).replace(/\.0$/, '')} công</p>
              <p className="text-[10px] text-brand-600 font-medium mt-0.5">Theo bộ lọc hiện tại</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Nhân sự</span>
                <Users size={16} />
              </div>
              <p className="text-xl font-black text-slate-800">{summaryStats.totalEmployees} người</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{filteredRecords.length} lượt chấm</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Đi làm (X)</span>
                <ClipboardList size={16} />
              </div>
              <p className="text-xl font-black text-emerald-800">{summaryStats.totalFull} ngày</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Làm việc đủ ngày</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/50 p-4 shadow-sm">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Nửa ngày (NN)</span>
                <Clock3 size={16} />
              </div>
              <p className="text-xl font-black text-amber-800">{summaryStats.totalHalf} buổi</p>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">Tính 0.5 công/buổi</p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Nghỉ phép (P)</span>
                <FileText size={16} />
              </div>
              <p className="text-xl font-black text-blue-800">{summaryStats.totalLeaves} lượt</p>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">Phép & không lương</p>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/40 p-4 shadow-sm">
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tăng ca (OT)</span>
                <TrendingUp size={16} />
              </div>
              <p className="text-xl font-black text-indigo-800">{summaryStats.totalOt} giờ</p>
              <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Giờ làm thêm</p>
            </div>
          </div>

          {/* ═══ BỘ LỌC ĐA NĂNG & ĐIỀU HƯỚNG CHẾ ĐỘ XEM ═══ */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Left: Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tháng & Năm */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                <CalendarIcon size={14} className="text-slate-500" />
                <span className="text-slate-600">T:</span>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>T{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-slate-300">/</span>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {Array.from({ length: 5 }, (_, i) => 2024 + i).map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Lọc Phòng ban */}
              {user?.roleName !== 'EMPLOYEE' && (
                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
                  <Building2 size={14} className="text-slate-500 shrink-0" />
                  <select
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-700 outline-none max-w-[160px] cursor-pointer"
                  >
                    <option value="all">Tất cả phòng ban</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Lọc Trạng thái */}
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
                <Filter size={14} className="text-slate-500 shrink-0" />
                <select
                  value={statusAttFilter}
                  onChange={e => setStatusAttFilter(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Có mặt">Có mặt (X)</option>
                  <option value="nửa ngày">Nghỉ nửa ngày (NN)</option>
                  <option value="phép">Nghỉ phép (P)</option>
                  <option value="không lương">Nghỉ không lương (KL)</option>
                  <option value="Công tác">Công tác (CT)</option>
                </select>
              </div>

              {/* Ô tìm kiếm nhân sự */}
              {user?.roleName !== 'EMPLOYEE' && (
                <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên hoặc mã NV..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Nút reset nếu đang có filter */}
              {(departmentFilter !== 'all' || statusAttFilter !== 'all' || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  title="Đặt lại bộ lọc"
                  className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            {/* Right: View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start lg:self-auto overflow-x-auto">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'matrix'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>Bảng Tính Google Sheets (7 Kho/Xưởng)</span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'summary'
                    ? 'bg-white text-brand-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Tổng hợp nhân sự ({employeeSummary.length})</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'list'
                    ? 'bg-white text-brand-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter size={14} />
                <span>Chi tiết từng ngày ({filteredRecords.length})</span>
              </button>
            </div>
          </div>

          {/* ═══ CHẾ ĐỘ 0: MẪU BẢNG TÍNH GOOGLE SHEETS (7 BỘ PHẬN) ═══ */}
          {viewMode === 'matrix' && (
            <TimesheetMatrixView
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
              onRefresh={fetchAttendance}
            />
          )}

          {/* ═══ CHẾ ĐỘ 1: BẢNG TỔNG HỢP NHÂN SỰ (MONTHLY MATRIX) ═══ */}
          {viewMode === 'summary' && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
              {attLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse min-w-[950px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">STT</th>
                      <th className="px-4 py-3">Mã NV</th>
                      <th className="px-4 py-3">Họ và Tên</th>
                      <th className="px-4 py-3">Phòng ban</th>
                      <th className="px-4 py-3">Chức vụ</th>
                      <th className="px-4 py-3 text-right text-brand-700 bg-brand-50/50">Công thực tế</th>
                      <th className="px-4 py-3 text-center text-emerald-700">Có mặt (X)</th>
                      <th className="px-4 py-3 text-center text-amber-700">Nửa ngày (NN)</th>
                      <th className="px-4 py-3 text-center text-blue-700">Phép (P)</th>
                      <th className="px-4 py-3 text-center text-rose-700">Không lương (KL)</th>
                      <th className="px-4 py-3 text-right">Tăng ca (OT)</th>
                      <th className="px-4 py-3 text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeSummary.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="text-center py-10 text-slate-500 font-medium">
                          Chưa có dữ liệu chấm công phù hợp với bộ lọc Tháng {month}/{year}
                        </td>
                      </tr>
                    ) : (
                      employeeSummary.map((emp, idx) => (
                        <tr key={emp.employee_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-center font-semibold text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold text-xs text-brand-700">{emp.employee_code}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{emp.fullname}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs">{emp.department_name || 'Khác'}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{emp.position_name || '--'}</td>
                          <td className="px-4 py-3 text-right font-black text-brand-700 bg-brand-50/30 text-sm">
                            {emp.totalWorkDays.toFixed(1).replace(/\.0$/, '')} công
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-700">
                            {emp.fullDays > 0 ? `${emp.fullDays} ngày` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-amber-700">
                            {emp.halfDays > 0 ? `${emp.halfDays} buổi` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-700">
                            {emp.paidLeaves > 0 ? `${emp.paidLeaves} ngày` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-rose-600">
                            {emp.unpaidLeaves > 0 ? `${emp.unpaidLeaves} ngày` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-indigo-700">
                            {emp.totalOtHours > 0 ? `${emp.totalOtHours}h` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setSearchTerm(emp.fullname);
                                setViewMode('list');
                              }}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                            >
                              Xem {emp.recordsCount} ngày
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {employeeSummary.length > 0 && (
                    <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200 text-xs">
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-right uppercase tracking-wider text-slate-600">
                          TỔNG CỘNG ({employeeSummary.length} NHÂN SỰ):
                        </td>
                        <td className="px-4 py-3 text-right font-black text-brand-700 bg-brand-100/50 text-sm">
                          {summaryStats.totalDays.toFixed(1).replace(/\.0$/, '')} công
                        </td>
                        <td className="px-4 py-3 text-center text-emerald-700 font-black">
                          {summaryStats.totalFull} ngày
                        </td>
                        <td className="px-4 py-3 text-center text-amber-700 font-black">
                          {summaryStats.totalHalf} buổi
                        </td>
                        <td className="px-4 py-3 text-center text-blue-700 font-black">
                          {summaryStats.totalLeaves} lượt
                        </td>
                        <td className="px-4 py-3 text-center text-slate-400">-</td>
                        <td className="px-4 py-3 text-right text-indigo-700 font-black">
                          {summaryStats.totalOt}h
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          )}

          {/* ═══ CHẾ ĐỘ 2: DANH SÁCH CHI TIẾT TỪNG NGÀY (DAILY LOGS) ═══ */}
          {viewMode === 'list' && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
              {attLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      {user?.roleName !== 'EMPLOYEE' && <th className="px-4 py-3">Nhân viên</th>}
                      <th className="px-4 py-3">Phòng ban</th>
                      <th className="px-4 py-3">Giờ vào (Check-in)</th>
                      <th className="px-4 py-3">Giờ ra (Check-out)</th>
                      <th className="px-4 py-3 text-right">Tăng ca (OT)</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-10 text-slate-500 font-medium">
                          Chưa có dữ liệu chấm công phù hợp với bộ lọc hiện tại
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map(r => {
                        const dateObj = new Date(r.date);
                        const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                        const dayName = !isNaN(dateObj) ? daysOfWeek[dateObj.getDay()] : '';
                        
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800">{r.date}</span>
                              {dayName && <span className="block text-[11px] text-slate-400 font-medium">{dayName}</span>}
                            </td>
                            {user?.roleName !== 'EMPLOYEE' && (
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800">{r.fullname}</div>
                                <div className="text-xs font-mono text-brand-700">{r.employee_code}</div>
                              </td>
                            )}
                            <td className="px-4 py-3 text-slate-600 text-xs">{r.department_name}</td>
                            <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{r.check_in || '--:--'}</td>
                            <td className="px-4 py-3 font-mono text-brand-600 font-bold">{r.check_out || '--:--'}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700 text-xs">
                              {r.ot_hours > 0 ? `${r.ot_hours} giờ` : '--'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 ${
                                r.status === 'Có mặt' || r.status?.startsWith('Có mặt') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                r.status?.includes('nửa ngày') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                r.status?.includes('phép') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                r.status?.includes('không lương') ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                r.status?.includes('Công tác') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                <span>{r.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">{r.note || '--'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Attendance Modal */}
          {attModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4">Chấm công thủ công</h3>
                <form onSubmit={handleAttSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Ngày</label>
                    <input required type="date" value={attFormData.date} onChange={e => setAttFormData({ ...attFormData, date: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Giờ vào</label>
                      <input type="time" value={attFormData.check_in} onChange={e => setAttFormData({ ...attFormData, check_in: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Giờ ra</label>
                      <input type="time" value={attFormData.check_out} onChange={e => setAttFormData({ ...attFormData, check_out: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                    <select value={attFormData.status} onChange={e => setAttFormData({ ...attFormData, status: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none">
                      <option value="Có mặt">Có mặt</option>
                      <option value="Đi trễ">Đi trễ</option>
                      <option value="Về sớm">Về sớm</option>
                      <option value="Vắng mặt">Vắng mặt</option>
                      <option value="Nghỉ phép">Nghỉ phép</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                    <input type="text" value={attFormData.note} onChange={e => setAttFormData({ ...attFormData, note: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setAttModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: ĐƠN XIN NGHỈ PHÉP
         ═══════════════════════════════════════════════ */}
      {activeTab === 'leaves' && (
        <>
          {/* Filter bar */}
          <div className="flex items-center space-x-2 max-w-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-transparent outline-none text-sm font-medium text-slate-700"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>

          {/* Leave requests table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            {leaveLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Loại nghỉ</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Số ngày</th>
                    <th className="px-4 py-3">Lý do</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-8 text-slate-500">Không có đơn nghỉ phép nào</td></tr>
                  ) : leaveRequests.map(r => {
                    const sDate = new Date(r.start_date);
                    const eDate = new Date(r.end_date);
                    const daysCount = r.days_count || Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.fullname}</div>
                          <div className="text-xs text-slate-500">{r.employee_code}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.department_name}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{r.leave_type}</td>
                        <td className="px-4 py-3">
                          <div className="text-brand-700 font-medium">{r.start_date}</div>
                          <div className="text-xs text-slate-500">đến {r.end_date}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 text-center">{daysCount}</td>
                        <td className="px-4 py-3 text-xs max-w-xs truncate">{r.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            r.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-700' :
                            r.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {r.status}
                          </span>
                          {r.status !== 'Chờ duyệt' && r.approver_name && (
                            <div className="text-[10px] text-slate-400 mt-1">bởi {r.approver_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button onClick={() => handlePrintLeaveRequest(r)} className="text-brand-600 hover:text-brand-800 p-1 bg-brand-50 rounded" title="In đơn xin nghỉ phép">
                            <Printer size={18} />
                          </button>
                          {r.status === 'Chờ duyệt' && user?.roleName !== 'EMPLOYEE' && (
                            <>
                              <button onClick={() => handleUpdateLeaveStatus(r.id, 'Đã duyệt')} className="text-emerald-600 hover:text-emerald-800 p-1 bg-emerald-50 rounded inline-flex items-center" title="Duyệt">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => handleUpdateLeaveStatus(r.id, 'Từ chối')} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded inline-flex items-center" title="Từ chối">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {r.status === 'Chờ duyệt' && (user?.roleName === 'EMPLOYEE' || user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                            <button onClick={() => handleDeleteLeave(r.id)} className="text-slate-400 hover:text-red-600 p-1 text-xs border rounded">Xóa</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Leave request Modal */}
          {leaveModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4">Tạo đơn nghỉ phép</h3>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Loại nghỉ phép</label>
                    <select value={leaveFormData.leave_type} onChange={e => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none">
                      <option value="Phép năm">Phép năm</option>
                      <option value="Nghỉ ốm">Nghỉ ốm</option>
                      <option value="Nghỉ không lương">Nghỉ không lương</option>
                      <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Từ ngày (*)</label>
                      <input required type="date" value={leaveFormData.start_date} onChange={e => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Đến ngày (*)</label>
                      <input required type="date" value={leaveFormData.end_date} onChange={e => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Lý do</label>
                    <textarea rows="3" value={leaveFormData.reason} onChange={e => setLeaveFormData({ ...leaveFormData, reason: e.target.value })} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Nhập chi tiết lý do xin nghỉ..." />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setLeaveModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800">Gửi đơn</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default AttendancePage;
