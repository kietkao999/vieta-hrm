import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Printer, Search, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    tier_salary: 0,
    grade_salary: 0,
    responsibility_quota: 0,
    responsibility_deduction_rate: 0, // Rate as decimal (e.g. 0.25)
    performance_bonus: 0,
    discipline_deduction: 0,
    other_deductions: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const payrollRes = await api.get(`/payroll?month=${month}&year=${year}`);
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
    } catch (err) {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleGeneratePayroll = async () => {
    if (window.confirm(`Bạn có chắc muốn tự động khởi tạo và tính lương cho toàn bộ nhân viên trong tháng ${month}/${year}?`)) {
      setIsGenerating(true);
      try {
        const res = await api.post('/payroll/generate', { month, year });
        setSuccess('Đã tính toán và cập nhật bảng lương thành công!');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khởi tạo bảng lương');
        setTimeout(() => setError(''), 3000);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/payroll/${id}`, { status: newStatus });
      setSuccess(`Cập nhật trạng thái thành: ${newStatus}`);
      fetchData();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Lỗi cập nhật trạng thái');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleDelete = async (payroll) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi lương tháng này của nhân sự ${payroll.fullname} không?`)) {
      try {
        await api.delete(`/payroll/${payroll.id}`);
        setSuccess('Đã xóa phiếu lương');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const openPayslip = (p) => {
    setSelectedPayroll(p);
    setPayslipModalOpen(true);
  };

  const openEditModal = (p) => {
    setSelectedPayroll(p);
    setEditForm({
      tier_salary: p.tier_salary || 0,
      grade_salary: p.grade_salary || 0,
      responsibility_quota: p.responsibility_quota || 0,
      responsibility_deduction_rate: p.responsibility_deduction_rate || 0,
      performance_bonus: p.performance_bonus || 0,
      discipline_deduction: p.discipline_deduction || 0,
      other_deductions: p.other_deductions || 0
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payroll/${selectedPayroll.id}`, {
        tier_salary: editForm.tier_salary,
        grade_salary: editForm.grade_salary,
        responsibility_deduction_rate: editForm.responsibility_deduction_rate,
        performance_bonus: editForm.performance_bonus,
        discipline_deduction: editForm.discipline_deduction,
        other_deductions: editForm.other_deductions
      });
      setSuccess('Cập nhật lương thành công');
      setEditModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật lương');
      setTimeout(() => setError(''), 3000);
    }
  };

  const calculatePreviewNet = () => {
    const tSalary = parseFloat(editForm.tier_salary || 0);
    const gSalary = parseFloat(editForm.grade_salary || 0);
    const respQuota = parseFloat(editForm.responsibility_quota || 0);
    const deductRate = parseFloat(editForm.responsibility_deduction_rate || 0);
    const perfBonus = parseFloat(editForm.performance_bonus || 0);
    const discDeduct = parseFloat(editForm.discipline_deduction || 0);
    const otherDeduct = parseFloat(editForm.other_deductions || 0);

    const respNet = respQuota * (1 - deductRate);
    const perfNet = Math.max(0, perfBonus - discDeduct);

    return tSalary + gSalary + respNet + perfNet - otherDeduct;
  };

  const formatVND = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const handlePrint = () => {
    window.print();
  };

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bảng Lương</h2>
          <p className="text-xs text-slate-500">Quản lý lương, thưởng, khấu trừ và payslip</p>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <button 
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow ${isGenerating ? 'bg-slate-400' : 'bg-brand-700 hover:bg-brand-800'}`}
            >
              {isGenerating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Plus size={16} />
              )}
              <span>Tính Lương Tháng Này</span>
            </button>
          )}
        </div>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 print:hidden">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 print:hidden">{error}</div>}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Tháng</span>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Năm</span>
          <select value={year} onChange={e=>setYear(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto print:hidden">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[1300px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Mã NV & Họ Tên</th>
                <th className="px-4 py-3">Chức vụ / Tầng</th>
                <th className="px-4 py-3 text-right">Lương theo Tầng</th>
                <th className="px-4 py-3 text-right">Lương theo Bậc</th>
                <th className="px-4 py-3 text-right">KPI Trách nhiệm</th>
                <th className="px-4 py-3 text-right">KPI Hiệu quả</th>
                <th className="px-4 py-3 text-right">Khấu trừ khác</th>
                <th className="px-4 py-3 text-right text-brand-700">TỔNG THỰC NHẬN</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-8 text-slate-500">Chưa có bảng lương tháng {month}/{year}. Bấm "Tính Lương Tháng Này" để khởi tạo.</td></tr>
              ) : payrolls.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div 
                      className="font-semibold text-brand-700 hover:underline cursor-pointer"
                      onClick={() => openPayslip(p)}
                      title="Xem chi tiết Phiếu lương"
                    >
                      {p.fullname}
                    </div>
                    <div className="text-xs text-slate-500">{p.employee_code}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.department_name}</td>
                  <td className="px-4 py-3 text-right text-slate-600 font-medium">{formatVND(p.tier_salary)}</td>
                  <td className="px-4 py-3 text-right text-slate-600 font-medium">{formatVND(p.grade_salary)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-emerald-600">{formatVND(p.responsibility_net)}</div>
                    <div className="text-[10px] text-slate-400">ĐM: {formatVND(p.responsibility_quota)} - {p.responsibility_deduction_rate * 100}%</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold text-emerald-600">{formatVND(p.performance_net)}</div>
                    <div className="text-[10px] text-slate-400">HQ: {formatVND(p.performance_bonus)} - VP: {formatVND(p.discipline_deduction)}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">{p.other_deductions > 0 ? `-${formatVND(p.other_deductions)}` : '0 đ'}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-700 text-sm">
                    {formatVND(p.net_salary)}
                  </td>
                  <td className="px-4 py-3 text-center">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.status === 'Đã chi trả' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'Đã duyệt' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button onClick={() => openPayslip(p)} className="text-slate-600 hover:text-slate-900 p-1 bg-slate-100 rounded" title="Xem Payslip">
                      <DollarSign size={16}/>
                    </button>
                    {isAdmin && (
                      <button onClick={() => openEditModal(p)} className="text-brand-600 hover:text-brand-800 p-1 bg-brand-50 rounded ml-1" title="Chỉnh sửa">
                        <Edit2 size={16}/>
                      </button>
                    )}
                    {isAdmin && p.status === 'Dự thảo' && (
                      <button onClick={() => handleUpdateStatus(p.id, 'Đã duyệt')} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded ml-1" title="Duyệt">
                        <CheckCircle size={16}/>
                      </button>
                    )}
                    {isAdmin && p.status === 'Đã duyệt' && (
                      <button onClick={() => handleUpdateStatus(p.id, 'Đã chi trả')} className="text-emerald-600 hover:text-emerald-800 p-1 bg-emerald-50 rounded ml-1" title="Đánh dấu đã chi trả">
                        <CheckCircle size={16}/>
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => handleDelete(p)} className="text-slate-400 hover:text-red-600 p-1 border rounded ml-1" title="Xóa">
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Salary Modal */}
      {editModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Cập nhật / Điều chỉnh Lương Nhân Viên</h3>
                <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm font-medium text-slate-700">Nhân viên: <span className="font-bold text-brand-700">{selectedPayroll.fullname}</span> ({selectedPayroll.employee_code})</p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Cột 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Lương theo tầng (VNĐ)</label>
                      <input type="number" required value={editForm.tier_salary} onChange={e => setEditForm({...editForm, tier_salary: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Lương theo bậc (VNĐ)</label>
                      <input type="number" required value={editForm.grade_salary} onChange={e => setEditForm({...editForm, grade_salary: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Định mức KPI Trách nhiệm (Cố định)</label>
                      <input type="number" disabled value={editForm.responsibility_quota} className="w-full border rounded-lg p-2 text-sm mt-1 bg-slate-100 text-slate-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">% Đạt KPI Trách nhiệm</label>
                      <select 
                        value={1 - editForm.responsibility_deduction_rate} 
                        onChange={e => setEditForm({...editForm, responsibility_deduction_rate: 1 - parseFloat(e.target.value)})} 
                        className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500 bg-white"
                      >
                        <option value={1}>100% (Đạt 4/4)</option>
                        <option value={0.75}>75% (Đạt 3/4)</option>
                        <option value={0.5}>50% (Đạt 2/4)</option>
                        <option value={0.25}>25% (Đạt 1/4)</option>
                        <option value={0}>0% (Đạt 0/4)</option>
                      </select>
                      <p className="text-[10px] text-amber-600 mt-1">* Suy ra % bị trừ = {(editForm.responsibility_deduction_rate * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Cột 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Thưởng hiệu quả (VNĐ)</label>
                      <input type="number" required value={editForm.performance_bonus} onChange={e => setEditForm({...editForm, performance_bonus: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Khấu trừ vi phạm nội quy (VNĐ)</label>
                      <input type="number" required value={editForm.discipline_deduction} onChange={e => setEditForm({...editForm, discipline_deduction: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Khấu trừ khác (BHXH, tạm ứng...) (VNĐ)</label>
                      <input type="number" required value={editForm.other_deductions} onChange={e => setEditForm({...editForm, other_deductions: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-brand-500" />
                    </div>
                  </div>
                </div>
                
                {/* Auto Calculate Display */}
                <div className="mt-6 bg-brand-50 p-4 rounded-xl border border-brand-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-brand-800 uppercase mb-1">Tổng thực nhận tạm tính</p>
                    <p className="text-[10px] text-brand-600 max-w-sm">
                      = Lương tầng + Lương bậc + (Định mức TN x % Đạt) + Max(0, Thưởng HQ - Phạt VP) - Khấu trừ khác
                    </p>
                  </div>
                  <div className="text-2xl font-black text-brand-700">
                    {formatVND(calculatePreviewNet())}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-slate-50">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800 shadow">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:z-auto">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
            
            <div className="p-8 print:p-0">
              {/* Toolbar */}
              <div className="flex justify-end space-x-2 mb-6 print:hidden">
                <button onClick={handlePrint} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-semibold inline-flex items-center space-x-2 hover:bg-brand-100">
                  <Printer size={16} /> <span>In Phiếu Lương</span>
                </button>
                <button onClick={() => setPayslipModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">Đóng</button>
              </div>

              {/* Payslip Content (Printable area) */}
              <div className="border border-slate-200 p-8 rounded-lg print:border-none print:p-0">
                
                {/* Header */}
                <div className="text-center mb-8 border-b border-slate-200 pb-6">
                  <h1 className="text-2xl font-bold text-slate-900 uppercase">Công ty TNHH HR Nệm Việt Á</h1>
                  <h2 className="text-xl font-bold text-brand-700 mt-2 uppercase">Phiếu Lương Tháng {selectedPayroll.month}/{selectedPayroll.year}</h2>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="space-y-2">
                    <p><span className="text-slate-500 font-semibold w-24 inline-block">Họ và tên:</span> <span className="font-bold text-slate-800">{selectedPayroll.fullname}</span></p>
                    <p><span className="text-slate-500 font-semibold w-24 inline-block">Mã NV:</span> <span className="text-slate-800">{selectedPayroll.employee_code}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="text-slate-500 font-semibold w-24 inline-block">Phòng ban:</span> <span className="text-slate-800">{selectedPayroll.department_name}</span></p>
                  </div>
                </div>

                {/* Salary Details */}
                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">I. LƯƠNG CỐ ĐỊNH</h3>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Lương theo tầng</span>
                    <span className="font-semibold text-slate-800">{formatVND(selectedPayroll.tier_salary)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Lương theo bậc</span>
                    <span className="font-semibold text-slate-800">{formatVND(selectedPayroll.grade_salary)}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">II. ĐÁNH GIÁ KPI TRÁCH NHIỆM</h3>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Định mức trách nhiệm</span>
                    <span className="text-slate-800">{formatVND(selectedPayroll.responsibility_quota)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Trừ vi phạm trách nhiệm ({(selectedPayroll.responsibility_deduction_rate * 100).toFixed(0)}% bị trừ)</span>
                    <span className="font-semibold text-red-600">- {formatVND(selectedPayroll.responsibility_quota * selectedPayroll.responsibility_deduction_rate)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-800">Thực lĩnh trách nhiệm</span>
                    <span className="font-bold text-emerald-600">{formatVND(selectedPayroll.responsibility_net)}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">III. KPI HIỆU QUẢ & VI PHẠM KỶ LUẬT</h3>
                <div className="space-y-2 mb-8 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Thưởng hiệu quả công việc</span>
                    <span className="font-semibold text-emerald-600">+ {formatVND(selectedPayroll.performance_bonus)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Khấu trừ vi phạm nội quy</span>
                    <span className="font-semibold text-red-600">- {formatVND(selectedPayroll.discipline_deduction)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-800">Thực lĩnh hiệu quả</span>
                    <span className="font-bold text-emerald-600">{formatVND(selectedPayroll.performance_net)}</span>
                  </div>
                </div>

                {selectedPayroll.other_deductions > 0 && (
                  <>
                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">IV. KHẤU TRỪ KHÁC</h3>
                    <div className="space-y-2 mb-8 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Khấu trừ khác (BHXH, tạm ứng...)</span>
                        <span className="font-semibold text-red-600">- {formatVND(selectedPayroll.other_deductions)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Total */}
                <div className="border-2 border-slate-800 p-4 rounded-lg bg-slate-50">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-sm font-bold text-slate-800 uppercase mb-1">TỔNG THỰC LĨNH:</span>
                      {/* <span className="block text-xs font-medium text-slate-500 italic">Bằng chữ: {toWords(selectedPayroll.net_salary)}</span> */}
                    </div>
                    <span className="text-2xl font-black text-brand-700">{formatVND(selectedPayroll.net_salary)}</span>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 mt-12 text-center text-sm">
                  <div>
                    <p className="font-bold text-slate-800">Người lập biểu</p>
                    <p className="text-slate-500 italic mt-1">(Ký, họ tên)</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Giám đốc</p>
                    <p className="text-slate-500 italic mt-1">(Ký, họ tên)</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inject Print Styles globally when needed, though Tailwind print: classes handle most of it */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:static, .print\\:static * {
            visibility: visible;
          }
          .print\\:hidden, .print\\:hidden * {
            display: none !important;
          }
          .print\\:static {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PayrollPage;
