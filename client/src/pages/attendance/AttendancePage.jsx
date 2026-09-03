import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Printer,
  ClipboardList,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

  // ═══ CHẤM CÔNG LOGIC ═══
  const fetchAttendance = async () => {
    setAttLoading(true);
    try {
      const res = await api.get(`/attendance?month=${month}&year=${year}`);
      setAttRecords(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu chấm công');
    } finally {
      setAttLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

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
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => switchTab('attendance')}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-white text-brand-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList size={16} />
          <span>Bảng Chấm Công</span>
        </button>
        <button
          onClick={() => switchTab('leaves')}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'leaves'
              ? 'bg-white text-brand-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>Đơn Xin Nghỉ Phép</span>
          {leaveRequests.filter(r => r.status === 'Chờ duyệt').length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {leaveRequests.filter(r => r.status === 'Chờ duyệt').length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          TAB 1: BẢNG CHẤM CÔNG
         ═══════════════════════════════════════════════ */}
      {activeTab === 'attendance' && (
        <>
          {/* Filter bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon size={18} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Tháng</span>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-700">Năm</span>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            {attLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">Ngày</th>
                    {user?.roleName !== 'EMPLOYEE' && <th className="px-4 py-3">Nhân viên</th>}
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Giờ vào (Check-in)</th>
                    <th className="px-4 py-3">Giờ ra (Check-out)</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attRecords.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-8 text-slate-500">Chưa có dữ liệu chấm công tháng này</td></tr>
                  ) : attRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-700">{r.date}</td>
                      {user?.roleName !== 'EMPLOYEE' && (
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.fullname}</div>
                          <div className="text-xs text-slate-500">{r.employee_code}</div>
                        </td>
                      )}
                      <td className="px-4 py-3">{r.department_name}</td>
                      <td className="px-4 py-3 font-mono text-emerald-600 font-bold">{r.check_in || '--:--'}</td>
                      <td className="px-4 py-3 font-mono text-brand-600 font-bold">{r.check_out || '--:--'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          r.status === 'Có mặt' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Đi trễ' ? 'bg-amber-100 text-amber-700' :
                          r.status === 'Nghỉ phép' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
