import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Plus, Download, Edit2, Trash2, Search, Filter, Eye, 
  UserCheck, UserMinus, UserX, Clock, RotateCcw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeDetailModal from './EmployeeDetailModal';

const EmployeePage = () => {
  const { user } = useAuth();
  const canManage = user?.roleName === 'ADMIN' || user?.roleName === 'HR';

  const [employees, setEmployees] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    active: 0,
    working: 0,
    probation: 0,
    resigned: 0,
    maternity: 0
  });
  const [loading, setLoading] = useState(true);
  
  const isManager = user?.roleName === 'MANAGER';
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentId, setDepartmentId] = useState(isManager ? (user?.departmentId || '') : '');
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEmp, setDetailEmp] = useState(null);

  // Resignation modal state
  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [empToResign, setEmpToResign] = useState(null);
  const [resignDate, setResignDate] = useState(new Date().toISOString().split('T')[0]);
  const [resignReason, setResignReason] = useState('Nghỉ việc theo nguyện vọng cá nhân');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [submittingResign, setSubmittingResign] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (isManager && user?.departmentId) {
        params.append('department_id', user.departmentId);
      } else if (departmentId) {
        params.append('department_id', departmentId);
      }
      if (status) params.append('status', status);

      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees?${params.toString()}`),
        api.get('/departments')
      ]);
      setEmployees(empRes.data.data || []);
      if (empRes.data.summaryStats) {
        setSummaryStats(empRes.data.summaryStats);
      }
      setDepartments(deptRes.data);
    } catch (err) {
      setError('Lỗi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenCreate = () => {
    setSelectedEmp(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setModalOpen(true);
  };

  const handleOpenDetail = (emp) => {
    setDetailEmp(emp);
    setDetailOpen(true);
  };

  // Mở modal báo thôi việc
  const handleOpenResign = (emp) => {
    setEmpToResign(emp);
    setResignDate(new Date().toISOString().split('T')[0]);
    setResignReason('Nghỉ việc theo nguyện vọng cá nhân');
    setHandoverNotes('');
    setResignModalOpen(true);
  };

  // Xác nhận ghi nhận nghỉ việc
  const handleConfirmResign = async () => {
    if (!empToResign) return;
    setSubmittingResign(true);
    try {
      const res = await api.post(`/employees/${empToResign.id}/resign`, {
        resignation_date: resignDate,
        resignation_reason: resignReason,
        handover_notes: handoverNotes
      });
      setSuccess(res.data?.message || `Đã cập nhật nhân sự ${empToResign.fullname} sang trạng thái Đã nghỉ việc.`);
      setResignModalOpen(false);
      setEmpToResign(null);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái nghỉ việc.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmittingResign(false);
    }
  };

  // Kích hoạt đi làm lại
  const handleReactivate = async (emp) => {
    if (window.confirm(`Xác nhận kích hoạt nhân sự "${emp.fullname}" (${emp.code}) quay trở lại làm việc?`)) {
      try {
        await api.put(`/employees/${emp.id}`, {
          ...emp,
          status: 'Đang làm việc',
          resignation_date: null,
          resignation_reason: null
        });
        setSuccess(`Đã kích hoạt lại nhân sự "${emp.fullname}".`);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 4000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể kích hoạt lại nhân sự.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${name}?\n\nLưu ý: Nếu nhân viên đã có lịch sử lương hoặc chấm công, hệ thống sẽ tự động bảo vệ dữ liệu và không thể xóa vĩnh viễn (thay vào đó hãy chuyển sang trạng thái "Đã nghỉ việc").`)) {
      try {
        await api.delete(`/employees/${id}`);
        setSuccess('Xóa thành công');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 4000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 6000);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/employees/export-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NhanVien_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Lỗi khi xuất file Excel');
    }
  };

  const handleSaveSuccess = (msg) => {
    setSuccess(msg);
    setModalOpen(false);
    fetchEmployees();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút thao tác */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Hồ sơ Nhân sự & Quản trị Nhân viên</h2>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi số lượng thực tế đang làm việc, nhân sự thử việc và nhân sự đã nghỉ việc</p>
        </div>
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button onClick={handleExport} className="inline-flex items-center space-x-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors">
                <Download size={16} />
                <span>Xuất Excel</span>
              </button>
              <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-xl bg-brand-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-brand-800 shadow-sm cursor-pointer transition-colors">
                <Plus size={16} />
                <span>Thêm Nhân viên</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thông báo Thành công & Cảnh báo */}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center space-x-2.5 shadow-xs">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800 flex items-center space-x-2.5 shadow-xs">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Thẻ Thống Kê Nhanh 4 Chỉ Số Trực Quan (Clickable để lọc) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Đang làm việc (Số lượng thật) */}
        <button
          type="button"
          onClick={() => setStatus(status === 'Đang làm việc' ? '' : 'Đang làm việc')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            status === 'Đang làm việc'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500'
              : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang làm việc (Số thật)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900">{summaryStats.active}</span>
            <span className="text-xs font-semibold text-emerald-700">nhân sự</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">Chính thức: {summaryStats.working} • Thử việc: {summaryStats.probation}</p>
        </button>

        {/* Card 2: Thử việc */}
        <button
          type="button"
          onClick={() => setStatus(status === 'Thử việc' ? '' : 'Thử việc')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            status === 'Thử việc'
              ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-500'
              : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thử việc</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900">{summaryStats.probation}</span>
            <span className="text-xs font-semibold text-amber-700">nhân sự</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">Hưởng 85% lương tầng bậc</p>
        </button>

        {/* Card 3: Đã nghỉ việc (Bảo toàn lịch sử lương) */}
        <button
          type="button"
          onClick={() => setStatus(status === 'Đã nghỉ việc' ? '' : 'Đã nghỉ việc')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            status === 'Đã nghỉ việc'
              ? 'bg-rose-50 border-rose-500 shadow-sm ring-2 ring-rose-500'
              : 'bg-white border-slate-200/90 hover:border-rose-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Đã nghỉ việc</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-rose-900">{summaryStats.resigned}</span>
            <span className="text-xs font-semibold text-rose-600">nhân sự</span>
          </div>
          <p className="text-[10px] text-rose-600 mt-1 font-medium truncate">Bảo toàn 100% hồ sơ lương cũ</p>
        </button>

        {/* Card 4: Tổng hồ sơ hệ thống */}
        <button
          type="button"
          onClick={() => setStatus('')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            status === ''
              ? 'bg-blue-50 border-blue-500 shadow-sm ring-2 ring-blue-500'
              : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng hồ sơ lưu</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900">{summaryStats.total}</span>
            <span className="text-xs font-semibold text-blue-700">hồ sơ</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">Bao gồm toàn bộ nhân sự</p>
        </button>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:space-x-4">
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-brand-500 bg-slate-50/50">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, mã NV, CCCD, SĐT..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="outline-none text-xs sm:text-sm w-full bg-transparent" 
          />
          <button type="submit" className="hidden">Search</button>
        </form>
        
        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex">
          {isManager ? (
            <div className="border border-blue-200 bg-blue-50/70 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-blue-900 flex items-center whitespace-nowrap min-w-[160px]" title="Phòng ban trực thuộc quản lý của bạn">
              🏢 {user?.departmentName || 'Phòng ban của tôi'}
            </div>
          ) : (
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-brand-500 bg-white w-full md:min-w-[170px] font-medium text-slate-700">
              <option value="">Tất cả phòng ban</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-brand-500 bg-white w-full md:min-w-[160px] font-medium text-slate-700">
            <option value="">Tất cả trạng thái ({summaryStats.total})</option>
            <option value="Đang làm việc">Đang làm việc ({summaryStats.working})</option>
            <option value="Thử việc">Thử việc ({summaryStats.probation})</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc ({summaryStats.resigned})</option>
            <option value="Nghỉ thai sản">Nghỉ thai sản ({summaryStats.maternity})</option>
          </select>
        </div>
      </div>

      {isManager && (
        <div className="rounded-xl bg-blue-50/90 border border-blue-200 p-3 text-xs text-blue-800 font-semibold flex items-center space-x-2">
          <span>🛡️ <strong>Phân quyền Quản lý:</strong> Chỉ xem và quản lý hồ sơ nhân viên trực thuộc <strong>{user?.departmentName || 'phòng ban/kho/xưởng được phân công'}</strong>. Không có quyền truy cập hồ sơ nhân sự các phòng ban khác.</span>
        </div>
      )}

      {/* Bảng Danh sách Nhân viên */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden overflow-x-auto custom-scroll-x">
        {loading ? (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
           </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[850px]">
            <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã NV</th>
                <th className="px-4 py-3.5">Họ và Tên</th>
                <th className="px-4 py-3.5">Phòng ban</th>
                <th className="px-4 py-3.5">Chức vụ</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap text-xs sm:text-sm">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : employees.map(e => {
                const isResigned = e.status === 'Đã nghỉ việc';
                return (
                  <tr key={e.id} className={`hover:bg-slate-50/80 transition-colors ${isResigned ? 'bg-slate-50/40 text-slate-500' : ''}`}>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-600">{e.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 flex items-center space-x-3 cursor-pointer" onClick={() => handleOpenDetail(e)}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isResigned ? 'bg-slate-200 text-slate-600' : 'bg-brand-100 text-brand-700'
                      }`}>
                        {e.fullname.charAt(0)}
                      </div>
                      <div>
                        <div className={`hover:text-brand-700 transition-colors font-bold ${isResigned ? 'line-through text-slate-500' : ''}`}>
                          {e.fullname}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">{e.email || e.phone || 'Chưa có liên hệ'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">{e.department_name || 'Chưa xếp'}</td>
                    <td className="px-4 py-3.5 font-medium">{e.position_name || 'Chưa xếp'}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center space-x-1 border ${
                          e.status === 'Đang làm việc' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          e.status === 'Thử việc' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                          e.status === 'Đã nghỉ việc' ? 'bg-rose-50 text-rose-800 border-rose-300' : 
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          <span>{e.status}</span>
                        </span>
                        {isResigned && e.resignation_date && (
                          <p className="text-[10px] text-rose-600 mt-0.5 font-mono">Từ: {e.resignation_date}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Xem chi tiết */}
                      <button 
                        onClick={() => handleOpenDetail(e)} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 cursor-pointer transition-colors" 
                        title="Xem hồ sơ chi tiết"
                      >
                        <Eye size={16}/>
                      </button>

                      {canManage && (
                        <>
                          {/* Sửa thông tin */}
                          <button 
                            onClick={() => handleOpenEdit(e)} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors" 
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit2 size={16}/>
                          </button>

                          {/* Báo thôi việc / Đi làm lại */}
                          {!isResigned ? (
                            <button
                              onClick={() => handleOpenResign(e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Báo nghỉ việc (Bảo toàn 100% hồ sơ lương tháng cũ)"
                            >
                              <UserMinus size={16}/>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(e)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                              title="Kích hoạt nhân viên đi làm lại"
                            >
                              <RotateCcw size={16}/>
                            </button>
                          )}

                          {/* Xóa nhân viên */}
                          <button 
                            onClick={() => handleDelete(e.id, e.fullname)} 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors" 
                            title="Xóa hồ sơ"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Báo Nghỉ Việc & Bảo Toàn Hồ Sơ Lương */}
      {resignModalOpen && empToResign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 p-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <UserMinus size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Xác nhận Báo Nghỉ Việc cho Nhân Sự</h3>
                  <p className="text-xs text-rose-200 mt-0.5">Bảo toàn 100% hồ sơ lương tháng cũ & khóa tài khoản bảo mật</p>
                </div>
              </div>
            </div>

            {/* Nội dung Form */}
            <div className="p-6 space-y-4">
              {/* Thông tin nhân viên */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-800">{empToResign.fullname}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Mã NV: {empToResign.code} • Phòng ban: {empToResign.department_name || 'N/A'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {empToResign.status}
                </span>
              </div>

              {/* Banner Bảo toàn Lương */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck size={16} className="text-blue-700 shrink-0" />
                  <span>Quy tắc bảo mật & Toàn vẹn dữ liệu:</span>
                </p>
                <p className="text-slate-600 leading-relaxed pl-5">
                  • <strong>Bảo toàn 100% hồ sơ lương tháng cũ:</strong> Phiếu lương các tháng trước của nhân sự này vẫn hiển thị đầy đủ trong lịch sử bảng lương công ty.<br />
                  • <strong>Tự động khóa tài khoản đăng nhập:</strong> Tài khoản truy cập hệ thống của nhân viên sẽ bị vô hiệu hóa để bảo vệ an ninh thông tin.<br />
                  • <strong>Cập nhật chính xác số lượng thật:</strong> Danh sách nhân sự đang làm việc và thống kê Dashboard sẽ phản ánh đúng quân số thực tế.
                </p>
              </div>

              {/* Ngày thôi việc */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ngày chính thức nghỉ việc <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  value={resignDate} 
                  onChange={(e) => setResignDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-white" 
                  required
                />
              </div>

              {/* Lý do nghỉ việc */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lý do nghỉ việc
                </label>
                <select
                  value={resignReason}
                  onChange={(e) => setResignReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-white mb-2"
                >
                  <option value="Nghỉ việc theo nguyện vọng cá nhân">Nghỉ việc theo nguyện vọng cá nhân</option>
                  <option value="Hết hạn hợp đồng không tái ký">Hết hạn hợp đồng không tái ký</option>
                  <option value="Thỏa thuận chấm dứt hợp đồng lao động">Thỏa thuận chấm dứt hợp đồng lao động</option>
                  <option value="Chuyển đổi nơi cư trú / Việc gia đình">Chuyển đổi nơi cư trú / Việc gia đình</option>
                  <option value="Không đạt yêu cầu thử việc">Không đạt yêu cầu thử việc</option>
                  <option value="Kỷ luật sa thải theo quy chế nội bộ">Kỷ luật sa thải theo quy chế nội bộ</option>
                  <option value="Khác">Lý do khác (Nhập bên dưới)</option>
                </select>
                {resignReason === 'Khác' && (
                  <input 
                    type="text" 
                    placeholder="Ghi rõ lý do nghỉ việc..."
                    onChange={(e) => setResignReason(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 text-xs outline-none focus:border-rose-500 bg-white"
                  />
                )}
              </div>

              {/* Bàn giao công việc & tài sản */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú bàn giao công việc & tài sản
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ghi chú về việc bàn giao tài sản, máy móc, công cụ dụng cụ, công nợ..."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:border-rose-500 bg-white"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setResignModalOpen(false); setEmpToResign(null); }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                disabled={submittingResign}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResign}
                disabled={submittingResign}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-colors flex items-center space-x-2"
              >
                {submittingResign ? (
                  <span>Đang cập nhật...</span>
                ) : (
                  <>
                    <UserMinus size={16} />
                    <span>Xác nhận Nghỉ việc</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {modalOpen && (
        <EmployeeFormModal 
          employee={selectedEmp}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSaveSuccess}
        />
      )}

      {/* Modal Chi Tiết */}
      {detailOpen && (
        <EmployeeDetailModal 
          employee={detailEmp}
          onClose={() => setDetailOpen(false)}
          onEdit={(emp) => {
            setDetailOpen(false);
            handleOpenEdit(emp);
          }}
        />
      )}
    </div>
  );
};

export default EmployeePage;
