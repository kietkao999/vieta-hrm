import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Building2,
  Award,
  Clock,
  FileText,
  Edit3,
  X,
  Layers,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Gift,
  Plus,
  TrendingDown,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
};

const calculateSeniority = (joinDateStr) => {
  if (!joinDateStr) return 'Chưa cập nhật';
  const join = new Date(joinDateStr);
  if (isNaN(join.getTime())) return 'Chưa cập nhật';

  const now = new Date();
  let years = now.getFullYear() - join.getFullYear();
  let months = now.getMonth() - join.getMonth();

  if (now.getDate() < join.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return 'Mới gia nhập';
  if (years === 0 && months === 0) return 'Dưới 1 tháng';
  if (years === 0) return `${months} tháng`;
  if (months === 0) return `${years} năm`;
  return `${years} năm ${months} tháng`;
};

const EmployeeDetailModal = ({ employee, onClose, onEdit }) => {
  const { user } = useAuth();
  const canManage = user?.roleName === 'ADMIN' || user?.roleName === 'HR' || user?.roleName === 'MANAGER';

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'salary' | 'kpi' | 'recognition'

  // Data states
  const [kpiHistory, setKpiHistory] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Recognition Tab states
  const [recognitionSubTab, setRecognitionSubTab] = useState('reward'); // 'reward' | 'discipline'
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormType, setAddFormType] = useState('reward');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [quickFormData, setQuickFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    reward_type: 'Tiền mặt',
    form: 'Nhắc nhở',
    value: 0
  });

  const fetchData = async () => {
    if (!employee?.id) return;
    setLoadingExtra(true);
    try {
      const [kpiRes, rewardRes, discRes] = await Promise.all([
        api.get(`/kpi/history/${employee.id}`).catch(() => ({ data: [] })),
        api.get(`/rewards?employee_id=${employee.id}`).catch(() => ({ data: [] })),
        api.get(`/discipline?employee_id=${employee.id}`).catch(() => ({ data: [] }))
      ]);
      setKpiHistory(kpiRes.data || []);
      setRewards(rewardRes.data || []);
      setDisciplines(discRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu bổ sung:', err);
    } finally {
      setLoadingExtra(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employee?.id]);

  if (!employee) return null;

  const seniority = calculateSeniority(employee.join_date);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đang làm việc':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Thử việc':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Đã nghỉ việc':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Nghỉ thai sản':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRateBadge = (rate) => {
    const numRate = parseFloat(rate) || 1.0;
    if (numRate >= 1.0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">100% (4/4 KPI)</span>;
    } else if (numRate >= 0.75) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">75% (3/4 KPI)</span>;
    } else if (numRate >= 0.50) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">50% (2/4 KPI)</span>;
    } else if (numRate >= 0.25) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">25% (1/4 KPI)</span>;
    } else {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">0% (0/4 KPI)</span>;
    }
  };

  // Find latest/current month KPI for salary tab
  const now = new Date();
  const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear();
  const currentMonthKpi = kpiHistory.find(
    k => (k.month === currentMonthStr || parseInt(k.month, 10) === (now.getMonth() + 1)) && k.year === currentYear
  ) || kpiHistory[0];

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      if (addFormType === 'reward') {
        await api.post('/rewards', {
          employee_id: employee.id,
          title: quickFormData.title,
          content: quickFormData.content,
          date: quickFormData.date,
          reward_type: quickFormData.reward_type,
          value: parseFloat(quickFormData.value) || 0
        });
      } else {
        await api.post('/discipline', {
          employee_id: employee.id,
          content: quickFormData.content || quickFormData.title,
          form: quickFormData.form,
          date: quickFormData.date,
          value: parseFloat(quickFormData.value) || 0
        });
      }
      setShowAddForm(false);
      setQuickFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        reward_type: 'Tiền mặt',
        form: 'Nhắc nhở',
        value: 0
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu ghi nhận.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 overflow-y-auto py-4">
      {/* Expanded Modal Box (max-w-6xl w-[95vw] max-h-[90vh]) */}
      <div className="w-[95vw] max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white px-8 py-5 flex justify-between items-center border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold shadow-inner">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-xl leading-tight tracking-tight">Chi Tiết Hồ Sơ Nhân Sự</h3>
              <p className="text-sm text-slate-300 font-mono mt-0.5">
                {employee.code} • {employee.fullname}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Hero Profile Bar (Spacious Header) */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 px-8 py-5 border-b border-slate-200 flex flex-col md:flex-row items-center md:items-start justify-between gap-5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-700 to-blue-600 text-white flex items-center justify-center font-black text-3xl shadow-lg border-2 border-white flex-shrink-0">
              {employee.fullname ? employee.fullname.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h4 className="text-2xl font-black text-slate-900">{employee.fullname}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(employee.status)}`}>
                  {employee.status || 'Đang làm việc'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-slate-600">
                <span className="font-bold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                  {employee.position_name || 'Chức vụ chưa đặt'}
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-800">
                  {employee.department_name || 'Chưa phân bổ phòng ban'}
                </span>
                <span>•</span>
                <span className="text-slate-600 font-medium">
                  {employee.branch_name || 'Công ty Nệm Việt Á'}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-sm text-slate-500 pt-1">
                <Clock size={15} className="text-blue-600" />
                <span>Thâm niên công tác: <strong className="text-blue-900 font-bold">{seniority}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-3 self-stretch md:self-auto justify-center">
            <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-sm text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thưởng KPI Trách nhiệm</span>
              <span className="text-xl font-black text-brand-700">{formatCurrency(employee.kpi_bonus)}</span>
              {employee.tier && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-0.5 inline-block border border-blue-200">{employee.tier}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center px-8 bg-slate-100/90 border-b border-slate-200 space-x-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center space-x-2.5 py-3.5 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-brand-700 text-brand-900 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={17} />
            <span>1. Thông tin & Công việc</span>
          </button>

          <button
            onClick={() => setActiveTab('salary')}
            className={`flex items-center space-x-2.5 py-3.5 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'salary'
                ? 'border-brand-700 text-brand-900 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign size={17} />
            <span>2. Chế độ Lương</span>
          </button>

          <button
            onClick={() => setActiveTab('kpi')}
            className={`flex items-center space-x-2.5 py-3.5 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'kpi'
                ? 'border-brand-700 text-brand-900 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={17} />
            <span>3. Lịch sử KPI ({kpiHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recognition')}
            className={`flex items-center space-x-2.5 py-3.5 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'recognition'
                ? 'border-brand-700 text-brand-900 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={17} />
            <span>4. Khen thưởng & Kỷ luật ({rewards.length + disciplines.length})</span>
          </button>
        </div>

        {/* Modal Body Scroll Area (Spacious P-8 and text-base) */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: THÔNG TIN & CÔNG VIỆC */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
              
              {/* Thẻ 1: Thông tin cá nhân */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 text-brand-900 font-extrabold text-base">
                  <User size={19} className="text-brand-600" />
                  <span>Thông tin cơ bản & Cá nhân</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Mã nhân sự</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{employee.code}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Giới tính</span>
                      <span className="font-medium text-slate-900 text-base">{employee.gender || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Ngày sinh</span>
                      <span className="font-medium text-slate-900 text-base">{formatDate(employee.dob)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Số CMND / CCCD</span>
                      <div className="flex items-center space-x-1.5 text-slate-900 font-mono font-medium text-base">
                        <CreditCard size={15} className="text-slate-400" />
                        <span>{employee.cccd || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Số điện thoại</span>
                    <div className="flex items-center space-x-2 text-slate-900 font-medium text-base mt-0.5">
                      <Phone size={15} className="text-slate-400" />
                      <span>{employee.phone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Email liên hệ</span>
                    <div className="flex items-center space-x-2 text-slate-900 font-medium text-base mt-0.5 break-all">
                      <Mail size={15} className="text-slate-400" />
                      <span>{employee.email || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Địa chỉ thường trú / Nơi ở hiện tại</span>
                    <div className="flex items-start space-x-2 text-slate-900 font-medium text-base mt-1">
                      <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                      <span className="leading-relaxed">{employee.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thẻ 2: Vị trí & Công tác */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 text-blue-900 font-extrabold text-base">
                  <Briefcase size={19} className="text-blue-600" />
                  <span>Công việc & Vị trí</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Chi nhánh công tác</span>
                    <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mt-0.5">
                      <Building2 size={16} className="text-slate-400" />
                      <span>{employee.branch_name || 'Chi nhánh Chính'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Phòng ban</span>
                      <span className="font-bold text-slate-900 text-base block mt-0.5">{employee.department_name || 'Chưa phân bổ'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Chức vụ</span>
                      <span className="font-bold text-blue-900 text-base block mt-0.5">{employee.position_name || 'Chưa thiết lập'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-100">
                    <div>
                      <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider">Tầng nhân sự</span>
                      <span className="font-bold text-blue-900 text-sm mt-0.5 block">{employee.tier || 'Chưa phân tầng'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider">Bậc chuyên môn</span>
                      <span className="font-bold text-blue-900 text-sm mt-0.5 block">{employee.grade || 'Bậc 1'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Ngày bắt đầu vào làm</span>
                      <span className="font-semibold text-slate-900 text-base block mt-0.5">{formatDate(employee.join_date)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-500 block">Thâm niên</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 inline-block mt-0.5 text-sm">
                        {seniority}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Loại hợp đồng lao động</span>
                    <div className="flex items-center space-x-2 text-slate-900 font-semibold text-base mt-0.5">
                      <FileText size={16} className="text-slate-400" />
                      <span>{employee.contract_type || 'Hợp đồng lao động'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-slate-500 block">Quản lý trực tiếp</span>
                    <span className="font-medium text-slate-900 text-base block mt-0.5">
                      {employee.manager_name || 'Không có / Ban Giám đốc'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHẾ ĐỘ LƯƠNG */}
          {activeTab === 'salary' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Khối 1: Lương định mức cố định */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 text-emerald-900 font-extrabold text-base">
                  <DollarSign size={20} className="text-emerald-600" />
                  <span>1. Chế độ Lương Cố Định & Thưởng Định Mức</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase block">Lương theo tầng</span>
                    <span className="text-sm text-slate-700 font-medium block mt-0.5">{employee.tier || 'Tầng chức vụ'}</span>
                    <div className="text-xl font-black text-slate-900 mt-2">
                      {formatCurrency(employee.tier_salary || employee.base_salary)}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase block">Lương theo bậc</span>
                    <span className="text-sm text-slate-700 font-medium block mt-0.5">{employee.grade || 'Bậc chuyên môn'}</span>
                    <div className="text-xl font-black text-slate-900 mt-2">
                      {formatCurrency(employee.grade_salary || 0)}
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 uppercase block">Tổng Lương Cơ Bản</span>
                    <span className="text-xs text-emerald-700 font-medium block mt-0.5">Lương tầng + Lương bậc</span>
                    <div className="text-2xl font-black text-emerald-800 mt-2">
                      {formatCurrency((employee.tier_salary || 0) + (employee.grade_salary || 0) || employee.base_salary)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="bg-blue-50/70 p-4.5 rounded-xl border border-blue-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-blue-900 uppercase block">Định mức Thưởng KPI Trách nhiệm</span>
                      <span className="text-xs text-blue-700 font-medium mt-0.5 block">Quy định theo Tầng</span>
                    </div>
                    <span className="text-xl font-black text-blue-900">
                      {formatCurrency(employee.kpi_bonus)}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Phụ cấp khác</span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5 block">Ăn trưa, xăng xe, điện thoại...</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(employee.allowance || 0)}
                    </span>
                  </div>
                </div>

                {employee.notes && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-500 block uppercase mb-1">Ghi chú về lương & hợp đồng</span>
                    <p className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {employee.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Khối 2: Theo dõi Thưởng hiệu quả cá nhân & Lịch sử biến động */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5 text-amber-900 font-extrabold text-base">
                    <TrendingUp size={20} className="text-amber-600" />
                    <span>2. Theo dõi Thưởng Hiệu Quả Cá Nhân Từng Tháng</span>
                  </div>
                  {currentMonthKpi && (
                    <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
                      Tháng gần nhất: {currentMonthKpi.month}/{currentMonthKpi.year}
                    </span>
                  )}
                </div>

                {/* Thống kê tháng gần nhất */}
                {currentMonthKpi ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-amber-50/40 p-4.5 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase block">Thưởng hiệu quả cá nhân</span>
                      <span className="text-lg font-black text-amber-900 mt-1 block">
                        +{formatCurrency(currentMonthKpi.performance_bonus)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-red-700 uppercase block">Trừ vi phạm kỷ luật / HQ</span>
                      <span className="text-lg font-black text-red-600 mt-1 block">
                        -{formatCurrency(currentMonthKpi.discipline_deduction)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase block">Thực nhận KPI Hiệu quả</span>
                      <span className="text-xl font-black text-emerald-700 mt-1 block">
                        ={formatCurrency(currentMonthKpi.net_performance)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border">
                    Chưa có bản ghi Thưởng hiệu quả nào trong cơ sở dữ liệu.
                  </p>
                )}

                {/* Bảng Lịch sử Thưởng hiệu quả qua các tháng */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Lịch sử Thưởng hiệu quả qua các tháng
                    </h5>
                    <span className="text-xs font-medium text-slate-500">
                      Tự động trích xuất từ bảng KPI hàng tháng
                    </span>
                  </div>

                  {kpiHistory.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-sm">
                      Chưa có lịch sử tháng nào.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Tháng/Năm</th>
                            <th className="px-4 py-3 text-right">Thưởng hiệu quả (VNĐ)</th>
                            <th className="px-4 py-3 text-right">Trừ vi phạm (VNĐ)</th>
                            <th className="px-4 py-3 text-right bg-amber-50 text-amber-900 font-black">Thực nhận hiệu quả (VNĐ)</th>
                            <th className="px-4 py-3">Ghi chú / Diễn giải</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {kpiHistory.map((kpi, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="px-4 py-3 font-bold text-slate-900">
                                Tháng {kpi.month}/{kpi.year}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-amber-800">
                                +{formatNumber(kpi.performance_bonus)} đ
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-red-600">
                                {kpi.discipline_deduction > 0 ? `-${formatNumber(kpi.discipline_deduction)} đ` : '0 đ'}
                              </td>
                              <td className="px-4 py-3 text-right bg-amber-50/60 font-black text-amber-900">
                                {formatCurrency(kpi.net_performance)}
                              </td>
                              <td className="px-4 py-3 text-slate-600 italic max-w-xs truncate">
                                {kpi.note || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LỊCH SỬ KPI TỔNG HỢP CÁC THÁNG */}
          {activeTab === 'kpi' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Bảng Lịch Sử Đạt KPI Tổng Hợp Các Tháng</h4>
                  <p className="text-sm text-slate-500">Phân tích chi tiết cả 2 cấu phần: KPI Trách nhiệm theo tầng và KPI Thưởng hiệu quả cá nhân</p>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1.5 rounded-full">
                  Tổng {kpiHistory.length} tháng ghi nhận
                </span>
              </div>

              {kpiHistory.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <History size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-base text-slate-700">Chưa có dữ liệu KPI tháng nào</p>
                  <p className="text-sm text-slate-400 mt-1">Dữ liệu sẽ hiển thị khi nhân viên được chấm KPI tại màn hình Quản lý KPI Tháng.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3.5">Tháng/Năm</th>
                        <th className="px-4 py-3.5 text-center bg-blue-50/50 text-blue-950">
                          <div>KPI Trách nhiệm</div>
                          <div className="text-[10px] font-normal text-blue-700">Tỷ lệ % & Số tiền nhận</div>
                        </th>
                        <th className="px-4 py-3.5 text-right bg-amber-50/50 text-amber-950">
                          <div>Thưởng hiệu quả</div>
                          <div className="text-[10px] font-normal text-amber-700">Thưởng - Trừ vi phạm</div>
                        </th>
                        <th className="px-5 py-3.5 text-right bg-emerald-50 text-emerald-950 font-black">
                          <div>Tổng KPI thực nhận</div>
                          <div className="text-[10px] font-normal text-emerald-800">Trách nhiệm + Hiệu quả</div>
                        </th>
                        <th className="px-4 py-3.5">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kpiHistory.map((kpi, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                            Tháng {kpi.month}/{kpi.year}
                          </td>
                          <td className="px-4 py-3.5 text-center bg-blue-50/20">
                            <div className="flex flex-col items-center space-y-1">
                              {getRateBadge(kpi.responsibility_rate)}
                              <span className="font-bold text-blue-900 text-xs">
                                ➜ {formatCurrency(kpi.responsibility_amount)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right bg-amber-50/20">
                            <div className="flex flex-col items-end space-y-0.5">
                              <span className="font-black text-amber-900 text-sm">
                                {formatCurrency(kpi.net_performance)}
                              </span>
                              <span className="text-xs text-slate-500">
                                (+{formatNumber(kpi.performance_bonus)} | -{formatNumber(kpi.discipline_deduction)})
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right bg-emerald-50/60 font-black text-emerald-800 text-base">
                            {formatCurrency(kpi.total_kpi)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 italic text-xs max-w-xs truncate">
                            {kpi.note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KHEN THƯỞNG & KỶ LUẬT */}
          {activeTab === 'recognition' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header with Sub-tabs and Quick Add button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setRecognitionSubTab('reward')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                      recognitionSubTab === 'reward'
                        ? 'bg-emerald-700 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🏆 Khen thưởng ({rewards.length})
                  </button>
                  <button
                    onClick={() => setRecognitionSubTab('discipline')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                      recognitionSubTab === 'discipline'
                        ? 'bg-rose-700 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ⚠️ Kỷ luật / Vi phạm ({disciplines.length})
                  </button>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setAddFormType(recognitionSubTab);
                      setShowAddForm(!showAddForm);
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-bold shadow transition"
                  >
                    <Plus size={16} />
                    <span>Thêm ghi nhận nhanh</span>
                  </button>
                )}
              </div>

              {/* Quick Add Form Drawer / Card */}
              {showAddForm && (
                <div className="p-6 rounded-2xl border border-brand-300 bg-brand-50/40 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-brand-950 uppercase tracking-wide">
                      Thêm ghi nhận {addFormType === 'reward' ? 'Khen thưởng' : 'Kỷ luật'} mới
                    </h5>
                    <div className="flex space-x-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setAddFormType('reward')}
                        className={`px-3 py-1 rounded-lg font-bold ${addFormType === 'reward' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Khen thưởng
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddFormType('discipline')}
                        className={`px-3 py-1 rounded-lg font-bold ${addFormType === 'discipline' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Kỷ luật
                      </button>
                    </div>
                  </div>

                  {formError && <div className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded">{formError}</div>}

                  <form onSubmit={handleQuickSubmit} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-semibold text-slate-600 block mb-1 text-xs uppercase">Ngày ghi nhận</label>
                        <input
                          type="date"
                          required
                          value={quickFormData.date}
                          onChange={e => setQuickFormData({ ...quickFormData, date: e.target.value })}
                          className="w-full border rounded-xl p-2.5 bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600 block mb-1 text-xs uppercase">
                          {addFormType === 'reward' ? 'Hình thức khen thưởng' : 'Hình thức kỷ luật'}
                        </label>
                        {addFormType === 'reward' ? (
                          <select
                            value={quickFormData.reward_type}
                            onChange={e => setQuickFormData({ ...quickFormData, reward_type: e.target.value })}
                            className="w-full border rounded-xl p-2.5 bg-white font-medium"
                          >
                            <option value="Tiền mặt">Tiền mặt</option>
                            <option value="Bằng khen / Giấy khen">Bằng khen / Giấy khen</option>
                            <option value="Hiện vật / Quà tặng">Hiện vật / Quà tặng</option>
                            <option value="Thăng chức / Tăng bậc">Thăng chức / Tăng bậc</option>
                          </select>
                        ) : (
                          <select
                            value={quickFormData.form}
                            onChange={e => setQuickFormData({ ...quickFormData, form: e.target.value })}
                            className="w-full border rounded-xl p-2.5 bg-white font-bold text-red-800"
                          >
                            <option value="Nhắc nhở">Nhắc nhở</option>
                            <option value="Khiển trách">Khiển trách</option>
                            <option value="Phạt tiền">Phạt tiền</option>
                            <option value="Kéo dài thời hạn nâng bậc">Kéo dài thời hạn nâng bậc</option>
                            <option value="Cách chức">Cách chức</option>
                            <option value="Sa thải">Sa thải</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600 block mb-1 text-xs uppercase">
                          {addFormType === 'reward' ? 'Số tiền thưởng (nếu có)' : 'Mức phạt tiền (nếu có)'}
                        </label>
                        <input
                          type="number"
                          step="50000"
                          value={quickFormData.value}
                          onChange={e => setQuickFormData({ ...quickFormData, value: e.target.value })}
                          className="w-full border rounded-xl p-2.5 bg-white font-black"
                          placeholder="0 đ"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1 text-xs uppercase">
                        {addFormType === 'reward' ? 'Tiêu đề / Lý do khen thưởng (*)' : 'Nội dung vi phạm / Lý do kỷ luật (*)'}
                      </label>
                      <input
                        type="text"
                        required
                        value={quickFormData.title || quickFormData.content}
                        onChange={e => setQuickFormData({ ...quickFormData, title: e.target.value, content: e.target.value })}
                        placeholder={addFormType === 'reward' ? 'VD: Hoàn thành xuất sắc chỉ tiêu doanh số tháng' : 'VD: Vi phạm quy chế an toàn lao động'}
                        className="w-full border rounded-xl p-2.5 bg-white font-medium"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow"
                      >
                        {formSubmitting ? 'Đang lưu...' : 'Lưu quyết định'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-tab 1: Khen thưởng */}
              {recognitionSubTab === 'reward' && (
                <div className="space-y-4">
                  {rewards.length === 0 ? (
                    <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-sm">
                      <Gift size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 text-base">Chưa có quyết định khen thưởng nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {rewards.map(r => (
                        <div key={r.id} className="p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-slate-900 text-base">{r.title}</span>
                              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {r.reward_type || 'Khen thưởng'}
                              </span>
                            </div>
                            {r.content && <p className="text-sm text-slate-700">{r.content}</p>}
                            <div className="text-xs text-slate-500 font-medium">Ngày ghi nhận: {formatDate(r.date)}</div>
                          </div>
                          {r.value > 0 && (
                            <div className="text-right pl-4 flex-shrink-0">
                              <span className="text-xs font-bold text-emerald-800 block uppercase">Thưởng tiền</span>
                              <span className="text-lg font-black text-emerald-700">+{formatCurrency(r.value)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Kỷ luật */}
              {recognitionSubTab === 'discipline' && (
                <div className="space-y-4">
                  {disciplines.length === 0 ? (
                    <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-sm">
                      <ShieldCheck size={36} className="mx-auto text-emerald-500 mb-2" />
                      <p className="font-bold text-slate-700 text-base">Không có vi phạm / kỷ luật nào</p>
                      <p className="text-slate-500 text-xs mt-1">Nhân sự chấp hành tốt nội quy và quy chế công ty.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5">
                      {disciplines.map(d => (
                        <div key={d.id} className="p-4.5 rounded-2xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-slate-900 text-base">{d.content}</span>
                              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                {d.form}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              Ngày ghi nhận: {formatDate(d.date)} {d.decision_maker_name && `• Người duyệt: ${d.decision_maker_name}`}
                            </div>
                          </div>
                          {d.value > 0 && (
                            <div className="text-right pl-4 flex-shrink-0">
                              <span className="text-xs font-bold text-rose-800 block uppercase">Phạt tiền</span>
                              <span className="text-lg font-black text-rose-700">-{formatCurrency(d.value)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Hồ sơ cập nhật: {formatDate(employee.updated_at || employee.created_at)}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold shadow-sm transition"
            >
              Đóng
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-bold shadow transition inline-flex items-center space-x-2"
              >
                <Edit3 size={16} />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetailModal;
