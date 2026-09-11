import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Printer, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, Calculator, Clock, Award, ShieldAlert, Gift, Coffee } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Form State matching the full formula
  const [editForm, setEditForm] = useState({
    tier_salary: 0,
    grade_salary: 0,
    work_days: 26,
    ot_hours: 0,
    responsibility_quota: 0,
    responsibility_deduction_rate: 0,
    responsibility_kpi: 0,
    performance_kpi: 0,
    other_bonus: 0,
    meal_phone_allowance: 0,
    other_allowance: 0,
    social_insurance: 0,
    union_fee: 0,
    income_tax: 0,
    advance_payment: 0,
    hour_deduction: 0,
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
    if (window.confirm(`Bạn có chắc muốn tự động khởi tạo và tính lương cho toàn bộ nhân viên trong tháng ${month}/${year} theo công thức mới?`)) {
      setIsGenerating(true);
      try {
        const res = await api.post('/payroll/generate', { month, year });
        setSuccess(res.data?.message || 'Đã tính toán và cập nhật bảng lương thành công!');
        fetchData();
        setTimeout(() => setSuccess(''), 4000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khởi tạo bảng lương');
        setTimeout(() => setError(''), 4000);
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
    const quota = p.responsibility_quota || 0;
    const rate = p.responsibility_deduction_rate || 0;
    const respVal = p.responsibility_kpi !== undefined ? p.responsibility_kpi : (p.responsibility_net !== undefined ? p.responsibility_net : Math.round(quota * (1 - rate)));
    const perfVal = p.performance_kpi !== undefined ? p.performance_kpi : (p.performance_bonus || 0);

    setEditForm({
      tier_salary: p.tier_salary || 0,
      grade_salary: p.grade_salary || 0,
      work_days: p.work_days ?? 26,
      ot_hours: p.ot_hours || 0,
      responsibility_quota: quota,
      responsibility_deduction_rate: rate,
      responsibility_kpi: respVal,
      performance_kpi: perfVal,
      other_bonus: p.other_bonus || 0,
      meal_phone_allowance: p.meal_phone_allowance || 0,
      other_allowance: p.other_allowance || 0,
      social_insurance: p.social_insurance || 0,
      union_fee: p.union_fee || 0,
      income_tax: p.income_tax || 0,
      advance_payment: p.advance_payment || 0,
      hour_deduction: p.hour_deduction || 0,
      other_deductions: (p.other_deductions || 0) + (p.discipline_deduction || 0)
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payroll/${selectedPayroll.id}`, {
        tier_salary: editForm.tier_salary,
        grade_salary: editForm.grade_salary,
        work_days: editForm.work_days,
        ot_hours: editForm.ot_hours,
        responsibility_quota: editForm.responsibility_quota,
        responsibility_deduction_rate: editForm.responsibility_deduction_rate,
        responsibility_kpi: editForm.responsibility_kpi,
        performance_kpi: editForm.performance_kpi,
        performance_bonus: editForm.performance_kpi,
        discipline_deduction: 0,
        other_bonus: editForm.other_bonus,
        meal_phone_allowance: editForm.meal_phone_allowance,
        other_allowance: editForm.other_allowance,
        social_insurance: editForm.social_insurance,
        union_fee: editForm.union_fee,
        income_tax: editForm.income_tax,
        advance_payment: editForm.advance_payment,
        hour_deduction: editForm.hour_deduction,
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

  // Live preview calculator for edit modal
  const calculatePreview = () => {
    const tSalary = parseFloat(editForm.tier_salary || 0);
    const gSalary = parseFloat(editForm.grade_salary || 0);
    const totalBase = tSalary + gSalary;
    const wDays = parseFloat(editForm.work_days ?? 26);
    const otHrs = parseFloat(editForm.ot_hours ?? 0);

    const baseWork = Math.round((totalBase / 26) * wDays);
    const otSalary = Math.round((totalBase / 208) * otHrs * 1.5);

    const respKpi = parseFloat(editForm.responsibility_kpi || 0);
    const perfKpi = parseFloat(editForm.performance_kpi || 0);
    const oBonus = parseFloat(editForm.other_bonus || 0);
    const mealPhone = parseFloat(editForm.meal_phone_allowance || 0);
    const oAllowance = parseFloat(editForm.other_allowance || 0);

    const totalIncome = baseWork + otSalary + respKpi + perfKpi + oBonus + mealPhone + oAllowance;

    const socialIns = parseFloat(editForm.social_insurance || 0);
    const uFee = parseFloat(editForm.union_fee || 0);
    const incTax = parseFloat(editForm.income_tax || 0);
    const advPay = parseFloat(editForm.advance_payment || 0);
    const hrDeduct = parseFloat(editForm.hour_deduction || 0);
    const oDeduct = parseFloat(editForm.other_deductions || 0);

    const totalDeduct = socialIns + uFee + incTax + advPay + hrDeduct + oDeduct;
    const net = totalIncome - totalDeduct;

    return {
      baseWork,
      otSalary,
      respKpi,
      perfKpi,
      oBonus,
      mealPhone,
      oAllowance,
      totalIncome,
      socialIns,
      uFee,
      incTax,
      advPay,
      hrDeduct,
      oDeduct,
      totalDeduct,
      net
    };
  };

  const formatVND = (amount) => {
    if (amount === undefined || amount === null) return '0 đ';
    return Number(amount).toLocaleString('vi-VN') + ' đ';
  };

  const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return Number(val).toLocaleString('vi-VN');
  };

  const handlePrint = () => {
    window.print();
  };

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';

  const filteredPayrolls = payrolls.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.fullname && p.fullname.toLowerCase().includes(term)) ||
      (p.employee_code && p.employee_code.toLowerCase().includes(term)) ||
      (p.department_name && p.department_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isAdmin ? 'Quản Lý Bảng Lương' : 'Phiếu Lương Cá Nhân'}
          </h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Quản lý bảng lương toàn công ty, tính toán tự động và duyệt chi trả'
              : 'Tra cứu chi tiết thu nhập, lương cơ sở, KPI và phụ cấp cá nhân theo từng tháng'}
          </p>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Calculator size={16} />
              <span>{isGenerating ? 'Đang tính toán...' : `Tính Lương Tháng ${month}/${year}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 print:hidden">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 print:hidden">
          {success}
        </div>
      )}

      {/* Month Navigation Pills */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Chọn kỳ tính lương nhanh:</span>
          <span className="text-xs font-semibold text-brand-700">Năm {year}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isSelected = parseInt(month, 10) === m;
            return (
              <button
                key={m}
                onClick={() => setMonth(m.toString())}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Tháng {m < 10 ? `0${m}` : m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-700">Tháng</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm outline-none font-bold text-brand-700"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-700">Năm</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm outline-none font-bold text-slate-700"
            >
              {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã NV..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Formula Summary Ribbon */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-xl text-xs text-slate-700 print:hidden">
        <span className="font-bold text-brand-800">💡 Công thức chuẩn: </span>
        <span className="text-slate-600 font-medium">
          Tổng thực lĩnh = [((Lương tầng + Bậc)/26) × Ngày công] + [((Lương tầng + Bậc)/208) × Giờ OT × 1.5] + Thưởng KPI TN + Thưởng KPI HQ + Thưởng khác + PC Cơm & ĐT + PC khác - BHXH - Đoàn phí - Thuế TNCN - Tạm ứng - Trừ cắt giờ - Trừ khác
        </span>
      </div>

      {/* Main Table Container with Clear Horizontal Scrollbar */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scroll-x">
            <table className="w-full text-left text-sm border-collapse min-w-[1350px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-3 py-3">Mã NV & Họ Tên</th>
                <th className="px-3 py-3">Phòng ban</th>
                <th className="px-3 py-3 text-right">Lương Cơ Sở & Ngày Công</th>
                <th className="px-3 py-3 text-right">Tăng Ca (OT)</th>
                <th className="px-3 py-3 text-right">KPI & Thưởng</th>
                <th className="px-3 py-3 text-right">Phụ Cấp</th>
                <th className="px-3 py-3 text-right text-red-600">Khấu Trừ</th>
                <th className="px-3 py-3 text-right text-brand-700 font-black">TỔNG THỰC LĨNH</th>
                <th className="px-3 py-3 text-center">Trạng thái</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPayrolls.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-slate-500">
                    Chưa có bảng lương tháng {month}/{year}. Bấm "Tính Lương Tháng {month}/{year}" để khởi tạo.
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((p) => {
                  const totalBase = (p.tier_salary || 0) + (p.grade_salary || 0);
                  const wDays = p.work_days ?? 26;
                  const baseWork = p.base_work_salary || Math.round((totalBase / 26) * wDays);
                  const otHrs = p.ot_hours || 0;
                  const otSal = p.ot_salary || Math.round((totalBase / 208) * otHrs * 1.5);
                  const respKpi = p.responsibility_kpi || p.responsibility_net || 0;
                  const perfKpi = p.performance_kpi || p.performance_bonus || 0;
                  const oBonus = p.other_bonus || 0;
                  const totalBonus = respKpi + perfKpi + oBonus;

                  const totalAllowances = (p.meal_phone_allowance || 0) + (p.other_allowance || 0);
                  const totalDeductions =
                    (p.social_insurance || 0) +
                    (p.union_fee || 0) +
                    (p.income_tax || 0) +
                    (p.advance_payment || 0) +
                    (p.hour_deduction || 0) +
                    (p.other_deductions || 0) +
                    (p.discipline_deduction || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-3">
                        <div
                          className="font-bold text-brand-700 hover:underline cursor-pointer"
                          onClick={() => openPayslip(p)}
                          title="Xem chi tiết Phiếu lương"
                        >
                          {p.fullname}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.employee_code}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-medium">{p.department_name}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-slate-800">{formatVND(baseWork)}</div>
                        <div className="text-[10px] text-slate-400">
                          {wDays} công | Gốc: {formatVND(totalBase)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className={`font-semibold ${otSal > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {formatVND(otSal)}
                        </div>
                        <div className="text-[10px] text-slate-400">{otHrs > 0 ? `${otHrs} giờ OT (150%)` : '-'}</div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="font-bold text-emerald-600">{formatVND(totalBonus)}</div>
                        <div className="text-[10px] text-slate-400">
                          TN: {formatVND(respKpi)} | HQ: {formatVND(perfKpi)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="font-semibold text-slate-700">{formatVND(totalAllowances)}</div>
                        <div className="text-[10px] text-slate-400">
                          Cơm&ĐT: {formatVND(p.meal_phone_allowance || 0)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className={`font-semibold ${totalDeductions > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {totalDeductions > 0 ? `-${formatVND(totalDeductions)}` : '0 đ'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="font-black text-brand-700 text-sm">{formatVND(p.net_salary)}</div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Đã chi trả'
                              ? 'bg-emerald-100 text-emerald-700'
                              : p.status === 'Đã duyệt'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openPayslip(p)}
                          className="text-slate-600 hover:text-slate-900 p-1.5 bg-slate-100 rounded-lg"
                          title="Xem Phiếu Lương"
                        >
                          <DollarSign size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-brand-600 hover:text-brand-800 p-1.5 bg-brand-50 rounded-lg ml-1"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {isAdmin && p.status === 'Dự thảo' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Đã duyệt')}
                            className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg ml-1"
                            title="Duyệt"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {isAdmin && p.status === 'Đã duyệt' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Đã chi trả')}
                            className="text-emerald-600 hover:text-emerald-800 p-1.5 bg-emerald-50 rounded-lg ml-1"
                            title="Đánh dấu đã chi trả"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p)}
                            className="text-slate-400 hover:text-red-600 p-1.5 border rounded-lg ml-1"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Edit Salary Modal */}
      {editModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-800 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg">Cập nhật Chi Tiết Lương & Khấu Trừ</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Nhân sự: <span className="text-amber-300 font-bold">{selectedPayroll.fullname}</span> ({selectedPayroll.employee_code}) - {selectedPayroll.department_name}
                </p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Group I: Lương cơ sở & Công việc */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock size={14} className="text-brand-600" />
                    <span>I. Lương Cơ Sở, Ngày Công & Giờ Tăng Ca</span>
                  </h4>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                    Lương cơ sở lấy từ Hồ sơ NV | Ngày công & OT nhập tay
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Lương Tầng</label>
                      <span className="text-[10px] text-slate-400 font-medium">🔒 Hệ thống</span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formatVND(editForm.tier_salary)}
                      className="w-full border border-slate-200 bg-slate-100/80 rounded-lg p-2 text-xs mt-1 font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Lương Bậc</label>
                      <span className="text-[10px] text-slate-400 font-medium">🔒 Hệ thống</span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formatVND(editForm.grade_salary)}
                      className="w-full border border-slate-200 bg-slate-100/80 rounded-lg p-2 text-xs mt-1 font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-blue-900">Ngày công thực tế (chuẩn 26)</label>
                      <span className="text-[10px] text-blue-600 font-bold">✍️ Nhập tay</span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="31"
                      value={editForm.work_days}
                      onChange={(e) => setEditForm({ ...editForm, work_days: parseFloat(e.target.value) || 0 })}
                      className="w-full border-2 border-blue-400 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-indigo-900">Giờ tăng ca (OT × 1.5)</label>
                      <span className="text-[10px] text-indigo-600 font-bold">✍️ Nhập tay</span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editForm.ot_hours}
                      onChange={(e) => setEditForm({ ...editForm, ot_hours: parseFloat(e.target.value) || 0 })}
                      className="w-full border-2 border-indigo-400 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>
              </div>

              {/* Group II: KPI & Thưởng */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award size={14} className="text-emerald-600" />
                    <span>II. Thưởng KPI & Thưởng Khác</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                    KPI lấy từ Quản lý KPI | Thưởng khác nhập tay
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Thưởng KPI Trách nhiệm</label>
                      <span className="text-[10px] text-slate-400 font-medium">🔒 Hệ thống</span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formatVND(editForm.responsibility_kpi)}
                      className="w-full border border-slate-200 bg-slate-100/80 rounded-lg p-2 text-xs mt-1 font-bold text-emerald-800 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Thưởng KPI Hiệu quả</label>
                      <span className="text-[10px] text-slate-400 font-medium">🔒 Hệ thống</span>
                    </div>
                    <input
                      type="text"
                      disabled
                      value={formatVND(editForm.performance_kpi)}
                      className="w-full border border-slate-200 bg-slate-100/80 rounded-lg p-2 text-xs mt-1 font-bold text-emerald-800 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-emerald-900">Thưởng khác (đột xuất, sáng kiến) (đ)</label>
                      <span className="text-[10px] text-emerald-600 font-bold">✍️ Nhập tay</span>
                    </div>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.other_bonus)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, other_bonus: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-emerald-400 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>
                </div>
              </div>

              {/* Group III: Phụ cấp */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Coffee size={14} className="text-amber-600" />
                    <span>III. Các Khoản Phụ Cấp (Nhập tay)</span>
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                    ✍️ Nhập tay
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-amber-900">Phụ cấp cơm & điện thoại (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.meal_phone_allowance)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, meal_phone_allowance: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-amber-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-amber-900">Phụ cấp khác (xăng xe, công tác...) (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.other_allowance)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, other_allowance: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-amber-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>

              {/* Group IV: Các khoản khấu trừ */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert size={14} className="text-red-600" />
                    <span>IV. Các Khoản Khấu Trừ (Nhập tay)</span>
                  </h4>
                  <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded">
                    ✍️ Nhập tay
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-red-900">BHXH (Bảo hiểm xã hội) (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.social_insurance)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, social_insurance: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-900">Đoàn phí (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.union_fee)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, union_fee: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-900">Thuế TNCN (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.income_tax)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, income_tax: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-900">Tạm ứng trong kỳ (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.advance_payment)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, advance_payment: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-900">Trừ cắt giờ (đi trễ, về sớm) (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.hour_deduction)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, hour_deduction: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-red-900">Trừ khác (phạt vi phạm...) (đ)</label>
                    <input
                      type="text"
                      value={formatInputNumber(editForm.other_deductions)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, other_deductions: raw === '' ? 0 : parseInt(raw, 10) });
                      }}
                      className="w-full border-2 border-red-300 bg-white rounded-lg p-2 text-xs mt-1 font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Summary Box */}
              {(() => {
                const prev = calculatePreview();
                return (
                  <div className="bg-gradient-to-br from-brand-50 to-indigo-50 p-4 rounded-xl border border-brand-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mb-3 pb-3 border-b border-brand-100">
                      <div><span className="text-slate-500">Lương công:</span> <b className="text-slate-800">{formatVND(prev.baseWork)}</b></div>
                      <div><span className="text-slate-500">Lương OT:</span> <b className="text-indigo-700">{formatVND(prev.otSalary)}</b></div>
                      <div><span className="text-slate-500">Thưởng KPI TN:</span> <b className="text-emerald-700">{formatVND(prev.respKpi)}</b></div>
                      <div><span className="text-slate-500">Thưởng KPI HQ:</span> <b className="text-emerald-700">{formatVND(prev.perfKpi)}</b></div>
                      <div><span className="text-slate-500">Tổng phụ cấp:</span> <b className="text-amber-800">{formatVND(prev.mealPhone + prev.oAllowance)}</b></div>
                      <div><span className="text-slate-500">Tổng khấu trừ:</span> <b className="text-red-600">-{formatVND(prev.totalDeduct)}</b></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-900 uppercase">TỔNG THỰC LĨNH TẠM TÍNH:</span>
                      <span className="text-2xl font-black text-brand-700">{formatVND(prev.net)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold hover:bg-brand-800 shadow"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {payslipModalOpen && selectedPayroll && (() => {
        const totalBase = (selectedPayroll.tier_salary || 0) + (selectedPayroll.grade_salary || 0);
        const wDays = selectedPayroll.work_days ?? 26;
        const baseWork = selectedPayroll.base_work_salary || Math.round((totalBase / 26) * wDays);
        const otHrs = selectedPayroll.ot_hours || 0;
        const otSal = selectedPayroll.ot_salary || Math.round((totalBase / 208) * otHrs * 1.5);
        const respKpi = selectedPayroll.responsibility_kpi || selectedPayroll.responsibility_net || 0;
        const perfKpi = selectedPayroll.performance_kpi || selectedPayroll.performance_bonus || 0;
        const oBonus = selectedPayroll.other_bonus || 0;
        const mealPhone = selectedPayroll.meal_phone_allowance || 0;
        const oAllowance = selectedPayroll.other_allowance || 0;

        const socialIns = selectedPayroll.social_insurance || 0;
        const uFee = selectedPayroll.union_fee || 0;
        const incTax = selectedPayroll.income_tax || 0;
        const advPay = selectedPayroll.advance_payment || 0;
        const hrDeduct = selectedPayroll.hour_deduction || 0;
        const oDeduct = (selectedPayroll.other_deductions || 0) + (selectedPayroll.discipline_deduction || 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static print:z-auto overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none my-8 max-h-[95vh] flex flex-col">
              
              {/* Toolbar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center print:hidden shrink-0">
                <span className="text-xs font-bold text-slate-700">Xem Phiếu Lương Nhân Viên</span>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-1.5 bg-brand-700 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 hover:bg-brand-800 shadow-sm"
                  >
                    <Printer size={14} /> <span>In Phiếu Lương</span>
                  </button>
                  <button
                    onClick={() => setPayslipModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              {/* Printable Payslip Content */}
              <div className="p-8 print:p-0 overflow-y-auto flex-1">
                <div className="border border-slate-200 p-8 rounded-xl print:border-none print:p-0">
                  {/* Header */}
                  <div className="text-center mb-6 border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-black text-slate-900 uppercase">CÔNG TY TNHH TM SX NỆM VIỆT Á</h1>
                    <h2 className="text-lg font-bold text-brand-700 mt-1 uppercase">
                      PHIẾU LƯƠNG THÁNG {selectedPayroll.month.toString().padStart(2, '0')}/{selectedPayroll.year}
                    </h2>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="space-y-1">
                      <p><span className="text-slate-500 w-24 inline-block">Họ và tên:</span> <b className="text-slate-800">{selectedPayroll.fullname}</b></p>
                      <p><span className="text-slate-500 w-24 inline-block">Mã nhân sự:</span> <span className="font-mono font-bold text-slate-700">{selectedPayroll.employee_code}</span></p>
                    </div>
                    <div className="space-y-1">
                      <p><span className="text-slate-500 w-24 inline-block">Phòng ban:</span> <b className="text-slate-800">{selectedPayroll.department_name}</b></p>
                      <p><span className="text-slate-500 w-24 inline-block">Ngạch bậc:</span> <span className="text-blue-700 font-semibold">{selectedPayroll.employee_tier || 'Tầng chuẩn'} - {selectedPayroll.employee_grade || 'Bậc chuẩn'}</span></p>
                    </div>
                  </div>

                  {/* I. LƯƠNG CƠ SỞ & NGÀY CÔNG */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                      I. LƯƠNG CƠ SỞ & NGÀY CÔNG
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lương theo tầng chức vụ</span>
                        <span className="font-medium text-slate-800">{formatVND(selectedPayroll.tier_salary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lương theo bậc thâm niên</span>
                        <span className="font-medium text-slate-800">{formatVND(selectedPayroll.grade_salary)}</span>
                      </div>
                      <div className="flex justify-between bg-blue-50/50 p-1 rounded font-semibold text-blue-900">
                        <span>Lương theo ngày công thực tế ({wDays}/26 ngày)</span>
                        <span>{formatVND(baseWork)}</span>
                      </div>
                      {otSal > 0 && (
                        <div className="flex justify-between bg-indigo-50/50 p-1 rounded font-semibold text-indigo-900">
                          <span>Lương tăng ca OT ({otHrs} giờ × 150%)</span>
                          <span>{formatVND(otSal)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* II. THƯỞNG KPI & THƯỞNG KHÁC */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                      II. THƯỞNG KPI & HIỆU QUẢ
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Thưởng KPI Trách nhiệm</span>
                        <span className="font-bold text-emerald-700">+{formatVND(respKpi)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Thưởng KPI Hiệu quả công việc</span>
                        <span className="font-bold text-emerald-700">+{formatVND(perfKpi)}</span>
                      </div>
                      {oBonus > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Thưởng khác (sáng kiến, đột xuất)</span>
                          <span className="font-bold text-emerald-700">+{formatVND(oBonus)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* III. PHỤ CẤP */}
                  {(mealPhone > 0 || oAllowance > 0) && (
                    <div className="mb-5">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                        III. CÁC KHOẢN PHỤ CẤP
                      </h3>
                      <div className="space-y-1.5 text-xs">
                        {mealPhone > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phụ cấp cơm & điện thoại</span>
                            <span className="font-bold text-amber-800">+{formatVND(mealPhone)}</span>
                          </div>
                        )}
                        {oAllowance > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Phụ cấp khác</span>
                            <span className="font-bold text-amber-800">+{formatVND(oAllowance)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* IV. KHẤU TRỪ */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                      IV. CÁC KHOẢN KHẤU TRỪ
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      {socialIns > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Bảo hiểm xã hội (BHXH)</span>
                          <span className="font-semibold text-red-600">-{formatVND(socialIns)}</span>
                        </div>
                      )}
                      {uFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Đoàn phí</span>
                          <span className="font-semibold text-red-600">-{formatVND(uFee)}</span>
                        </div>
                      )}
                      {incTax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Thuế thu nhập cá nhân (Thuế TNCN)</span>
                          <span className="font-semibold text-red-600">-{formatVND(incTax)}</span>
                        </div>
                      )}
                      {advPay > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tạm ứng trong kỳ</span>
                          <span className="font-semibold text-red-600">-{formatVND(advPay)}</span>
                        </div>
                      )}
                      {hrDeduct > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Trừ cắt giờ (đi trễ, về sớm)</span>
                          <span className="font-semibold text-red-600">-{formatVND(hrDeduct)}</span>
                        </div>
                      )}
                      {oDeduct > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Trừ vi phạm nội quy & khấu trừ khác</span>
                          <span className="font-semibold text-red-600">-{formatVND(oDeduct)}</span>
                        </div>
                      )}
                      {socialIns === 0 && uFee === 0 && incTax === 0 && advPay === 0 && hrDeduct === 0 && oDeduct === 0 && (
                        <div className="text-slate-400 italic">Không có khoản khấu trừ trong kỳ</div>
                      )}
                    </div>
                  </div>

                  {/* V. TỔNG THỰC LĨNH */}
                  <div className="border-2 border-brand-800 p-4 rounded-xl bg-gradient-to-r from-brand-50 via-white to-brand-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-xs font-bold text-slate-800 uppercase">TỔNG THỰC LĨNH:</span>
                        <span className="text-[10px] text-slate-500">Đã bao gồm lương công, OT, KPI, phụ cấp và các khoản trừ</span>
                      </div>
                      <span className="text-2xl font-black text-brand-800">{formatVND(selectedPayroll.net_salary)}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 mt-10 text-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Người lập biểu</p>
                      <p className="text-slate-400 italic mt-1">(Ký, họ tên)</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Giám đốc duyệt</p>
                      <p className="text-slate-400 italic mt-1">(Ký, đóng dấu)</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        );
      })()}

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
