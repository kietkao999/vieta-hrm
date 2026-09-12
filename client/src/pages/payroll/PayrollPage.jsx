import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Printer, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, Calculator, Clock, Award, ShieldAlert, Gift, Coffee, Building2, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TIER_PRESETS = [
  { label: 'Tầng 1 (4.500.000 đ) - Nhân viên mới (< 1 năm)', salary: 4500000, quota: 1000000 },
  { label: 'Tầng 2 (5.000.000 đ) - Chuyên viên (1 - 3 năm)', salary: 5000000, quota: 1000000 },
  { label: 'Tầng 3 (5.500.000 đ) - Chuyên viên cao cấp (≥ 3 năm)', salary: 5500000, quota: 1000000 },
  { label: 'Tầng 4 (6.000.000 đ) - Phó phòng / Phó Quản lý', salary: 6000000, quota: 1500000 },
  { label: 'Tầng 5 (6.500.000 đ) - Trưởng phòng / Quản lý', salary: 6500000, quota: 2000000 },
  { label: 'Tầng 6 (8.000.000 đ) - Phó Giám đốc', salary: 8000000, quota: 2500000 },
  { label: 'Tầng 7 (9.500.000 đ) - Giám đốc', salary: 9500000, quota: 0 }
];

const GRADE_PRESETS = Array.from({ length: 11 }, (_, i) => ({
  label: i === 0 ? 'Bậc 0 (0 đ)' : `Bậc ${i} (+${(i * 400000).toLocaleString('vi-VN')} đ)`,
  salary: i * 400000,
  level: i
}));

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const maxDisplayMonth = parseInt(year, 10) >= currentYear ? currentMonth : 12;
  
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load danh sách phòng ban cho bộ lọc
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Lỗi tải danh sách phòng ban:', err);
      }
    };
    fetchDepts();
  }, []);

  // Edit Form State matching the full formula
  const [editForm, setEditForm] = useState({
    tier_salary: 0,
    grade_salary: 0,
    sync_to_employee: false,
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
      const deptParam = departmentFilter && departmentFilter !== 'all' ? `&department_id=${departmentFilter}` : '';
      const payrollRes = await api.get(`/payroll?month=${month}&year=${year}${deptParam}`);
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
    } catch (err) {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year, departmentFilter]);

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
      sync_to_employee: false,
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
        sync_to_employee: editForm.sync_to_employee,
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

  // Giao diện Phiếu lương cá nhân dành cho Nhân viên & Quản lý (Cấp 2 & Cấp 3)
  const renderPersonalPayrollView = () => {
    const currentSlip = payrolls && payrolls.length > 0 ? payrolls[0] : null;

    const totalBase = currentSlip ? (currentSlip.tier_salary || 0) + (currentSlip.grade_salary || 0) : 0;
    const wDays = currentSlip?.work_days ?? 26;
    const baseWork = currentSlip?.base_work_salary || (currentSlip ? Math.round((totalBase / 26) * wDays) : 0);
    const otHrs = currentSlip?.ot_hours || 0;
    const otSal = currentSlip?.ot_salary || (currentSlip ? Math.round((totalBase / 208) * otHrs * 1.5) : 0);
    const respKpi = currentSlip?.responsibility_kpi || currentSlip?.responsibility_net || currentSlip?.responsibility_quota || 0;
    const perfKpi = currentSlip?.performance_kpi || currentSlip?.performance_bonus || 0;
    const oBonus = currentSlip?.other_bonus || 0;
    const totalBonus = respKpi + perfKpi + oBonus;

    const mealPhone = currentSlip?.meal_phone_allowance || 0;
    const otherAllow = currentSlip?.other_allowance || 0;
    const totalAllowances = mealPhone + otherAllow;

    const socialIns = currentSlip?.social_insurance || 0;
    const unionFee = currentSlip?.union_fee || 0;
    const incTax = currentSlip?.income_tax || 0;
    const advPay = currentSlip?.advance_payment || 0;
    const hrDeduct = currentSlip?.hour_deduction || 0;
    const otherDeduct = (currentSlip?.other_deductions || 0) + (currentSlip?.discipline_deduction || 0);
    const totalDeductions = socialIns + unionFee + incTax + advPay + hrDeduct + otherDeduct;

    const netSalary = currentSlip?.net_salary || (baseWork + otSal + totalBonus + totalAllowances - totalDeductions);

    return (
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center space-x-2.5 mb-2">
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                  PHIẾU LƯƠNG CÁ NHÂN
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Mã NV: {user?.employeeCode || user?.username}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {user?.fullname || user?.username}
              </h2>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                Chức vụ: <strong className="text-white">{user?.positionName || user?.position_name || 'Nhân sự'}</strong> • Phòng ban: <strong className="text-white">{user?.departmentName || user?.department_name || 'Nệm Việt Á'}</strong>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-right md:min-w-[240px]">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Thực Lĩnh Tháng {month < 10 ? `0${parseInt(month, 10)}` : month}/{year}
              </p>
              <p className="text-2xl md:text-3xl font-black text-emerald-300 mt-1">
                {currentSlip ? formatVND(netSalary) : 'Chưa có dữ liệu'}
              </p>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>In phiếu lương</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Month Selector Pills */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn kỳ lương cần tra cứu:
            </span>
            <span className="text-xs font-bold text-brand-700 font-mono">Năm {year}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: maxDisplayMonth }, (_, i) => i + 1).map((m) => {
              const isSelected = parseInt(month, 10) === m;
              return (
                <button
                  key={m}
                  onClick={() => setMonth(m.toString())}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-brand-700 text-white shadow-md ring-2 ring-brand-300'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Tháng {m < 10 ? `0${m}` : m}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Salary Breakdown Cards */}
        {currentSlip ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Thu nhập cơ sở & Ngày công */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-brand-900 font-bold text-sm uppercase">
                <Clock size={16} className="text-brand-600" />
                <span>I. Lương Cơ Bản & Ngày Công</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Lương tầng chức vụ:</span>
                  <span className="font-bold text-slate-800">{formatVND(currentSlip.tier_salary)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Lương bậc chuyên môn:</span>
                  <span className="font-bold text-slate-800">{formatVND(currentSlip.grade_salary)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50 bg-blue-50/50 px-2 rounded">
                  <span className="font-semibold text-blue-900">Tổng lương cơ sở (chuẩn 26 ngày):</span>
                  <span className="font-bold text-blue-900">{formatVND(totalBase)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Ngày công làm việc thực tế:</span>
                  <span className="font-bold text-emerald-700">{wDays} ngày công</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Tiền lương theo ngày công:</span>
                  <span className="font-bold text-slate-800">{formatVND(baseWork)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Giờ tăng ca (OT):</span>
                  <span className="font-bold text-slate-800">{otHrs > 0 ? `${otHrs} giờ (150%)` : '0 giờ'}</span>
                </div>
                <div className="flex justify-between items-center py-1 bg-slate-50 px-2 rounded">
                  <span className="font-semibold text-slate-700">Tiền làm thêm giờ (OT):</span>
                  <span className="font-bold text-indigo-600">{formatVND(otSal)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: KPI & Phụ Cấp */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-amber-900 font-bold text-sm uppercase">
                <Award size={16} className="text-amber-600" />
                <span>II. Thưởng KPI & Phụ Cấp</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Thưởng KPI Trách nhiệm:</span>
                  <span className="font-bold text-emerald-700">+{formatVND(respKpi)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Thưởng KPI Hiệu quả cá nhân:</span>
                  <span className="font-bold text-amber-700">+{formatVND(perfKpi)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Thưởng khác / Sáng kiến:</span>
                  <span className="font-bold text-slate-800">+{formatVND(oBonus)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50 bg-amber-50/50 px-2 rounded">
                  <span className="font-semibold text-amber-900">Tổng thưởng KPI & Khen thưởng:</span>
                  <span className="font-bold text-amber-900">+{formatVND(totalBonus)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Phụ cấp Cơm & Điện thoại:</span>
                  <span className="font-bold text-slate-800">+{formatVND(mealPhone)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Phụ cấp khác:</span>
                  <span className="font-bold text-slate-800">+{formatVND(otherAllow)}</span>
                </div>
                <div className="flex justify-between items-center py-1 bg-slate-50 px-2 rounded">
                  <span className="font-semibold text-slate-700">Tổng phụ cấp:</span>
                  <span className="font-bold text-slate-800">+{formatVND(totalAllowances)}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Khấu Trừ & Tổng Thực Lĩnh */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-red-900 font-bold text-sm uppercase">
                <ShieldAlert size={16} className="text-red-600" />
                <span>III. Các Khoản Giảm Trừ</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Bảo hiểm Xã hội (BHXH, BHYT, BHTN):</span>
                  <span className="font-bold text-red-600">-{formatVND(socialIns)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Đoàn phí công đoàn:</span>
                  <span className="font-bold text-red-600">-{formatVND(unionFee)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Thuế thu nhập cá nhân (TNCN):</span>
                  <span className="font-bold text-red-600">-{formatVND(incTax)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Tạm ứng trong tháng:</span>
                  <span className="font-bold text-red-600">-{formatVND(advPay)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500">Giảm trừ cắt giờ / Vi phạm:</span>
                  <span className="font-bold text-red-600">-{formatVND(otherDeduct + hrDeduct)}</span>
                </div>
                <div className="flex justify-between items-center py-1 bg-red-50 px-2 rounded">
                  <span className="font-semibold text-red-900">Tổng các khoản khấu trừ:</span>
                  <span className="font-bold text-red-700">-{formatVND(totalDeductions)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200 mt-2">
                  <span className="font-extrabold text-emerald-900 text-sm">THỰC LĨNH NHẬN:</span>
                  <span className="font-black text-emerald-800 text-base">{formatVND(netSalary)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <DollarSign size={48} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700 text-base">
              Chưa có dữ liệu bảng lương cho Tháng {month}/{year}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bạn vui lòng chọn các tháng khác (VD: Tháng 09, Tháng 07, Tháng 06,...) để tra cứu phiếu lương đã được chốt.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isAdmin ? 'Quản Lý Bảng Lương Toàn Công Ty' : 'Tra Cứu Phiếu Lương Cá Nhân'}
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

      {/* Phân nhánh giao diện: Nếu là Employee/Manager thì hiện view Phiếu lương cá nhân chuyên nghiệp */}
      {!isAdmin ? (
        renderPersonalPayrollView()
      ) : (
        <>
          {/* Month Navigation Pills */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Chọn kỳ tính lương nhanh:</span>
              <span className="text-xs font-semibold text-brand-700">Năm {year}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: maxDisplayMonth }, (_, i) => i + 1).map((m) => {
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
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700">Tháng</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm outline-none font-bold text-brand-700 bg-white"
                >
                  {Array.from({ length: maxDisplayMonth }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>Tháng {m < 10 ? `0${m}` : m}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-700">Năm</span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm outline-none font-bold text-slate-700 bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Bộ lọc theo Phòng Ban */}
              <div className="flex items-center space-x-2">
                <Building2 size={16} className="text-brand-600" />
                <span className="text-sm font-semibold text-slate-700">Phòng ban:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none font-bold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white focus:border-brand-500 transition cursor-pointer"
                >
                  <option value="all">-- Tất cả phòng ban ({payrolls.length} nhân sự) --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 max-w-xs min-w-[200px]">
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

          {/* Quick Metrics Strip for Selected Department & Month */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Nhân sự lọc</p>
                <p className="text-base font-black text-slate-800">{filteredPayrolls.length} người</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng Quỹ Lương Thực Lĩnh</p>
                <p className="text-base font-black text-emerald-700">
                  {formatVND(filteredPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0))}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng Thưởng & KPI</p>
                <p className="text-base font-black text-indigo-700">
                  {formatVND(filteredPayrolls.reduce((sum, p) => sum + (p.responsibility_kpi || p.responsibility_net || 0) + (p.performance_kpi || p.performance_bonus || 0) + (p.other_bonus || 0), 0))}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng Các Khấu Trừ</p>
                <p className="text-base font-black text-red-600">
                  -{formatVND(filteredPayrolls.reduce((sum, p) => sum + (p.social_insurance || 0) + (p.union_fee || 0) + (p.income_tax || 0) + (p.advance_payment || 0) + (p.hour_deduction || 0) + (p.other_deductions || 0) + (p.discipline_deduction || 0), 0))}
                </p>
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
                    <th className="px-3 py-3">Phòng ban & Chức vụ</th>
                    <th className="px-3 py-3 text-right">Tầng & Bậc (Thâm Niên)</th>
                    <th className="px-3 py-3 text-right">Lương Công & Tăng Ca</th>
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
                          <td className="px-3 py-3">
                            <div className="text-slate-700 font-semibold">{p.department_name}</div>
                            <div className="text-[10px] text-slate-400">{p.position_name || 'Nhân viên'}</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <span className="bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]" title="Lương Tầng">
                                {formatVND(p.tier_salary || 0)}
                              </span>
                              <span className="bg-indigo-50 text-indigo-800 font-bold px-1.5 py-0.5 rounded text-[10px]" title="Lương Bậc">
                                +{formatVND(p.grade_salary || 0)}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {p.seniority_text ? `Thâm niên: ${p.seniority_text}` : `Gốc: ${formatVND(totalBase)}`}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="font-bold text-slate-800">{formatVND(baseWork)}</div>
                            <div className="text-[10px] text-slate-400">
                              {wDays} công {otSal > 0 ? `| OT: +${formatVND(otSal)}` : ''}
                            </div>
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
                                className="text-brand-600 hover:text-brand-900 p-1.5 bg-brand-50 rounded-lg ml-1"
                                title="Chỉnh sửa Chi Tiết Lương & Tầng Bậc"
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
                                className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg ml-1"
                                title="Xóa Phiếu Lương"
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
        </>
      )}

      {/* Edit Salary Modal */}
      {editModalOpen && selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto print:hidden">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-800 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg">Cập nhật Chi Tiết Lương & Tầng - Bậc</h3>
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
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-brand-600" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      I. Lương Cơ Sở (Tầng - Bậc - Thâm Niên) & Ngày Công
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Thâm niên: {selectedPayroll.seniority_text || 'Chưa xác định'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Cột 1: Lương Tầng */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-blue-950">1. Lương Tầng (Theo chức vụ / thâm niên)</label>
                      <span className="text-[10px] text-blue-600 font-medium">Chọn nhanh hoặc nhập</span>
                    </div>
                    <select
                      value={editForm.tier_salary}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const matched = TIER_PRESETS.find(t => t.salary === val);
                        setEditForm(prev => ({
                          ...prev,
                          tier_salary: val,
                          responsibility_quota: matched ? matched.quota : prev.responsibility_quota
                        }));
                      }}
                      className="w-full border border-blue-200 bg-blue-50/50 rounded-lg p-2 text-xs font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {TIER_PRESETS.map((t, idx) => (
                        <option key={idx} value={t.salary}>
                          {t.label}
                        </option>
                      ))}
                      {!TIER_PRESETS.some(t => t.salary === editForm.tier_salary) && (
                        <option value={editForm.tier_salary}>
                          Tùy chỉnh: {formatVND(editForm.tier_salary)}
                        </option>
                      )}
                    </select>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">Số tiền VND:</span>
                      <input
                        type="text"
                        value={formatInputNumber(editForm.tier_salary)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setEditForm({ ...editForm, tier_salary: raw === '' ? 0 : parseInt(raw, 10) });
                        }}
                        className="w-full border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {/* Cột 2: Lương Bậc */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-indigo-950">2. Lương Bậc (+400k / bậc)</label>
                      <span className="text-[10px] text-indigo-600 font-medium">Chọn nhanh hoặc nhập</span>
                    </div>
                    <select
                      value={editForm.grade_salary}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditForm(prev => ({ ...prev, grade_salary: val }));
                      }}
                      className="w-full border border-indigo-200 bg-indigo-50/50 rounded-lg p-2 text-xs font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {GRADE_PRESETS.map((g, idx) => (
                        <option key={idx} value={g.salary}>
                          {g.label}
                        </option>
                      ))}
                      {!GRADE_PRESETS.some(g => g.salary === editForm.grade_salary) && (
                        <option value={editForm.grade_salary}>
                          Tùy chỉnh: {formatVND(editForm.grade_salary)}
                        </option>
                      )}
                    </select>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap">Số tiền VND:</span>
                      <input
                        type="text"
                        value={formatInputNumber(editForm.grade_salary)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setEditForm({ ...editForm, grade_salary: raw === '' ? 0 : parseInt(raw, 10) });
                        }}
                        className="w-full border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Ngày công & OT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Ngày công thực tế (chuẩn 26 ngày)</label>
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
                    <label className="text-xs font-semibold text-slate-700">Giờ tăng ca (OT × 1.5)</label>
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

                {/* Checkbox lưu vĩnh viễn vào hồ sơ nhân viên */}
                <label className="flex items-center space-x-2.5 text-xs font-bold text-brand-900 bg-brand-50 p-2.5 rounded-lg border border-brand-200 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={editForm.sync_to_employee}
                    onChange={(e) => setEditForm({ ...editForm, sync_to_employee: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                  />
                  <span>Lưu vĩnh viễn cấu hình Tầng & Bậc này vào Hồ sơ nhân sự (employees) để tự động áp dụng các tháng tiếp theo</span>
                </label>
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
