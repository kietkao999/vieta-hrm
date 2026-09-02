import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  Search,
  Filter,
  Save,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  Percent
} from 'lucide-react';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatNumber = (val) => {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
};

const RESPONSIBILITY_RATE_OPTIONS = [
  { value: 1.0, label: '100% (Đạt 4/4 KPI)', shortLabel: '100% (4/4 KPI)', color: 'text-emerald-700' },
  { value: 0.75, label: '75% (Đạt 3/4 KPI)', shortLabel: '75% (3/4 KPI)', color: 'text-blue-700' },
  { value: 0.50, label: '50% (Đạt 2/4 KPI)', shortLabel: '50% (2/4 KPI)', color: 'text-amber-700' },
  { value: 0.25, label: '25% (Đạt 1/4 KPI)', shortLabel: '25% (1/4 KPI)', color: 'text-orange-700' },
  { value: 0.0, label: '0% (Đạt 0/4 KPI)', shortLabel: '0% (0/4 KPI)', color: 'text-red-700' }
];

const KpiPage = () => {
  const { user } = useAuth();
  const isAdminOrHR = user?.roleName === 'ADMIN' || user?.roleName === 'HR';
  const canEdit = isAdminOrHR || user?.roleName === 'MANAGER';

  const currentDate = new Date();
  const [month, setMonth] = useState((currentDate.getMonth() + 1).toString());
  const [year, setYear] = useState(currentDate.getFullYear().toString());

  const [kpiList, setKpiList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Unsaved modifications tracker: { [employee_id]: true }
  const [modifiedMap, setModifiedMap] = useState({});

  // Toast notification
  const [toast, setToast] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    responsibility_bonus: 0,
    responsibility_rate: 1.0,
    performance_bonus: 0,
    discipline_deduction: 0,
    note: ''
  });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data || []);
      } catch (err) {
        console.error('Lỗi tải phòng ban:', err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch KPI Data
  const fetchKpiData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/kpi?month=${month}&year=${year}`);
      setKpiList(res.data || []);
      setModifiedMap({});
    } catch (err) {
      console.error('Lỗi tải dữ liệu KPI:', err);
      showToast('error', err.response?.data?.message || 'Lỗi khi tải dữ liệu KPI tháng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, [month, year]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    let m = parseInt(month, 10) - 1;
    let y = parseInt(year, 10);
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m.toString());
    setYear(y.toString());
  };

  const handleNextMonth = () => {
    let m = parseInt(month, 10) + 1;
    let y = parseInt(year, 10);
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m.toString());
    setYear(y.toString());
  };

  // Change Responsibility Rate dropdown handler
  const handleRateChange = (employeeId, rateValue) => {
    const numericRate = parseFloat(rateValue);

    setKpiList(prev =>
      prev.map(item => {
        if (item.employee_id !== employeeId) return item;

        const respBonus = parseFloat(item.responsibility_bonus) || 0;
        const respAmount = Math.round(respBonus * numericRate);
        const netPerformance = Math.max(0, (parseFloat(item.performance_bonus) || 0) - (parseFloat(item.discipline_deduction) || 0));
        const totalKpi = respAmount + netPerformance;

        return {
          ...item,
          responsibility_rate: numericRate,
          responsibility_amount: respAmount,
          net_responsibility: respAmount,
          total_kpi: totalKpi
        };
      })
    );

    setModifiedMap(prev => ({
      ...prev,
      [employeeId]: true
    }));
  };

  // Inline numeric input change handler
  const handleInlineChange = (employeeId, field, rawValue) => {
    const numericValue = Math.max(0, parseFloat(rawValue) || 0);

    setKpiList(prev =>
      prev.map(item => {
        if (item.employee_id !== employeeId) return item;

        const updated = {
          ...item,
          [field]: numericValue
        };

        const respBonus = parseFloat(field === 'responsibility_bonus' ? numericValue : updated.responsibility_bonus) || 0;
        const respRate = updated.responsibility_rate !== undefined ? parseFloat(updated.responsibility_rate) : 1.0;
        const respAmount = Math.round(respBonus * respRate);

        const perfBonus = parseFloat(field === 'performance_bonus' ? numericValue : updated.performance_bonus) || 0;
        const discDeduction = parseFloat(field === 'discipline_deduction' ? numericValue : updated.discipline_deduction) || 0;
        const netPerformance = Math.max(0, perfBonus - discDeduction);

        updated.responsibility_amount = respAmount;
        updated.net_responsibility = respAmount;
        updated.net_performance = netPerformance;
        updated.total_kpi = respAmount + netPerformance;

        return updated;
      })
    );

    setModifiedMap(prev => ({
      ...prev,
      [employeeId]: true
    }));
  };

  // Save Bulk changes
  const handleSaveBulk = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const itemsToSave = kpiList.map(item => ({
        employee_id: item.employee_id,
        responsibility_bonus: item.responsibility_bonus,
        responsibility_rate: item.responsibility_rate !== undefined ? item.responsibility_rate : 1.0,
        performance_bonus: item.performance_bonus,
        discipline_deduction: item.discipline_deduction,
        note: item.note || ''
      }));

      await api.post('/kpi/bulk', {
        month,
        year,
        items: itemsToSave
      });

      showToast('success', `Đã lưu thành công dữ liệu KPI Tháng ${month}/${year}!`);
      setModifiedMap({});
      fetchKpiData();
    } catch (err) {
      console.error('Lỗi lưu KPI:', err);
      showToast('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu KPI.');
    } finally {
      setSaving(false);
    }
  };

  // Initialize Month data
  const handleInitMonth = async () => {
    if (!isAdminOrHR) return;
    if (
      kpiList.length > 0 &&
      !window.confirm(
        `Thao tác này sẽ đảm bảo toàn bộ nhân sự đang làm việc được khởi tạo định mức Thưởng trách nhiệm theo Tầng (mặc định 100% - 4/4 KPI) trong tháng ${month}/${year}. Bạn có muốn tiếp tục?`
      )
    ) {
      return;
    }

    setInitializing(true);
    try {
      const res = await api.post('/kpi/init', { month, year });
      showToast('success', res.data?.message || `Khởi tạo dữ liệu tháng ${month}/${year} thành công!`);
      await fetchKpiData();
    } catch (err) {
      console.error('Lỗi khởi tạo KPI tháng:', err);
      showToast('error', err.response?.data?.message || 'Lỗi khi khởi tạo dữ liệu tháng.');
    } finally {
      setInitializing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setModalForm({
      responsibility_bonus: item.responsibility_bonus || 0,
      responsibility_rate: item.responsibility_rate !== undefined ? item.responsibility_rate : 1.0,
      performance_bonus: item.performance_bonus || 0,
      discipline_deduction: item.discipline_deduction || 0,
      note: item.note || ''
    });
    setModalOpen(true);
  };

  // Submit Modal
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await api.post('/kpi', {
        id: editingItem.kpi_id,
        employee_id: editingItem.employee_id,
        month,
        year,
        responsibility_bonus: modalForm.responsibility_bonus,
        responsibility_rate: modalForm.responsibility_rate,
        performance_bonus: modalForm.performance_bonus,
        discipline_deduction: modalForm.discipline_deduction,
        note: modalForm.note
      });

      showToast('success', `Đã cập nhật KPI cho ${editingItem.fullname}!`);
      setModalOpen(false);
      setEditingItem(null);
      fetchKpiData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Lỗi cập nhật KPI.');
    }
  };

  // Delete KPI row
  const handleDeleteKpi = async (item) => {
    if (!isAdminOrHR) return;
    if (!item.kpi_id) {
      showToast('info', 'Bản ghi này chưa lưu trong cơ sở dữ liệu.');
      return;
    }

    if (window.confirm(`Bạn có chắc muốn xóa bản ghi KPI tháng ${month}/${year} của nhân viên ${item.fullname}?`)) {
      try {
        await api.delete(`/kpi/${item.kpi_id}`);
        showToast('success', 'Đã xóa bản ghi KPI!');
        fetchKpiData();
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Lỗi xóa bản ghi KPI.');
      }
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return kpiList.filter(item => {
      const matchSearch =
        !searchTerm.trim() ||
        item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = !selectedDept || item.department_id?.toString() === selectedDept.toString();

      return matchSearch && matchDept;
    });
  }, [kpiList, searchTerm, selectedDept]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalRespNet = 0;
    let totalPerfNet = 0;
    let totalKpiSum = 0;

    kpiList.forEach(item => {
      totalRespNet += item.responsibility_amount || 0;
      totalPerfNet += item.net_performance || 0;
      totalKpiSum += item.total_kpi || 0;
    });

    return {
      totalEmployees: kpiList.length,
      totalRespNet,
      totalPerfNet,
      totalKpiSum
    };
  }, [kpiList]);

  const modifiedCount = Object.keys(modifiedMap).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-red-600 flex-shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-blue-600 flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Quản lý KPI Tháng</h2>
              <p className="text-xs text-slate-500">
                Quản lý tỷ lệ đạt KPI trách nhiệm và thưởng hiệu quả phục vụ tính lương
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdminOrHR && (
            <button
              onClick={handleInitMonth}
              disabled={initializing || loading}
              className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all disabled:opacity-50"
              title="Tải toàn bộ nhân viên đang làm việc và gán mặc định 100% KPI Trách nhiệm theo Tầng"
            >
              <RefreshCw size={15} className={initializing ? 'animate-spin text-brand-600' : 'text-slate-500'} />
              <span>{initializing ? 'Đang khởi tạo...' : 'Khởi tạo dữ liệu tháng này'}</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={handleSaveBulk}
              disabled={saving || loading}
              className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition-all ${
                modifiedCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50'
                  : 'bg-brand-700 hover:bg-brand-800'
              } disabled:opacity-50`}
            >
              <Save size={16} />
              <span>{saving ? 'Đang lưu...' : modifiedCount > 0 ? `Lưu thay đổi (${modifiedCount})` : 'Lưu dữ liệu tháng'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng nhân sự KPI</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-800">{summaryMetrics.totalEmployees}</span>
            <span className="text-xs text-slate-500">nhân viên</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">KPI Trách nhiệm thực nhận</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-blue-700">{formatNumber(summaryMetrics.totalRespNet)}</span>
            <span className="text-xs font-semibold text-slate-500">đ</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">KPI Hiệu quả thực nhận</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-amber-700">{formatNumber(summaryMetrics.totalPerfNet)}</span>
            <span className="text-xs font-semibold text-slate-500">đ</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tổng ngân sách KPI thực nhận</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-emerald-700">{formatNumber(summaryMetrics.totalKpiSum)}</span>
            <span className="text-xs font-bold text-emerald-800">đ</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month / Year Navigator */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Tháng trước"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-semibold text-slate-500">Tháng</span>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="bg-transparent font-bold text-sm text-slate-800 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <span className="text-xs font-semibold text-slate-500">Năm</span>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="bg-transparent font-bold text-sm text-slate-800 outline-none cursor-pointer"
              >
                {[
                  currentDate.getFullYear() - 2,
                  currentDate.getFullYear() - 1,
                  currentDate.getFullYear(),
                  currentDate.getFullYear() + 1
                ].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Tháng sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search & Department Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-slate-700 bg-white outline-none focus:border-brand-500"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã NV..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-500 placeholder-slate-400"
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Unsaved Changes Alert Bar */}
      {modifiedCount > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-amber-800 text-xs font-semibold">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>
              Bạn có <strong>{modifiedCount}</strong> nhân viên đang được thay đổi đánh giá KPI. Hãy nhấn "Lưu thay đổi" để cập nhật vào cơ sở dữ liệu.
            </span>
          </div>
          <button
            onClick={handleSaveBulk}
            disabled={saving}
            className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition"
          >
            {saving ? 'Đang lưu...' : 'Lưu ngay'}
          </button>
        </div>
      )}

      {/* Main KPI Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-700"></div>
            <p className="text-xs text-slate-500 font-medium">Đang tải bảng KPI tháng {month}/{year}...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[1100px]">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã NV</th>
                <th className="px-4 py-3.5">Họ và Tên</th>
                <th className="px-4 py-3.5">Chức vụ / Tầng</th>
                <th className="px-3 py-3.5 text-right bg-blue-50/40 text-blue-900">
                  <div className="flex flex-col items-end">
                    <span>Thưởng trách nhiệm</span>
                    <span className="text-[9px] font-normal text-blue-600">Định mức theo Tầng</span>
                  </div>
                </th>
                <th className="px-3 py-3.5 text-center bg-blue-50/70 text-blue-950 font-bold">
                  <div className="flex flex-col items-center">
                    <span>TỶ LỆ ĐẠT TRÁCH NHIỆM</span>
                    <span className="text-[9px] font-normal text-blue-700">Đánh giá 4 KPI (100% - 0%)</span>
                  </div>
                </th>
                <th className="px-3 py-3.5 text-right bg-amber-50/40 text-amber-800">
                  <div className="flex flex-col items-end">
                    <span>Thưởng hiệu quả</span>
                    <span className="text-[9px] font-normal text-amber-600">Thưởng cá nhân</span>
                  </div>
                </th>
                <th className="px-3 py-3.5 text-right bg-amber-50/40 text-amber-800">
                  <div className="flex flex-col items-end">
                    <span>Trừ vi phạm</span>
                    <span className="text-[9px] font-normal text-red-500">Kỷ luật / HQ</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right bg-emerald-50 text-emerald-900 font-extrabold">
                  <div className="flex flex-col items-end">
                    <span>Tổng KPI thực nhận</span>
                    <span className="text-[9px] font-normal text-emerald-700">Trách nhiệm + Hiệu quả</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users size={32} className="text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        Chưa có dữ liệu KPI tháng {month}/{year}
                      </p>
                      <p className="text-xs text-slate-400">
                        Nhấn nút "Khởi tạo dữ liệu tháng này" ở trên để tự động nạp danh sách nhân sự.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const isModified = !!modifiedMap[item.employee_id];
                  const currentRate = item.responsibility_rate !== undefined ? item.responsibility_rate : 1.0;

                  return (
                    <tr
                      key={item.employee_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isModified ? 'bg-amber-50/35 font-medium' : ''
                      }`}
                    >
                      {/* Mã NV */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 font-semibold">
                        {item.employee_code}
                      </td>

                      {/* Họ và Tên */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {item.fullname ? item.fullname.charAt(0) : 'N'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm leading-tight">{item.fullname}</div>
                            <div className="text-[11px] text-slate-400">{item.department_name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Chức vụ / Tầng */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.position_name}
                        </span>
                      </td>

                      {/* Thưởng trách nhiệm định mức */}
                      <td className="px-3 py-2 text-right bg-blue-50/20">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={item.responsibility_bonus ?? 0}
                            onChange={e => handleInlineChange(item.employee_id, 'responsibility_bonus', e.target.value)}
                            className="w-28 text-right font-semibold text-blue-900 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 rounded-md px-2 py-1 text-xs outline-none bg-white shadow-sm"
                          />
                        ) : (
                          <span className="font-semibold text-blue-900 text-xs">
                            {formatNumber(item.responsibility_bonus)}
                          </span>
                        )}
                      </td>

                      {/* Tỷ lệ đạt KPI Trách nhiệm (Select Dropdown) */}
                      <td className="px-3 py-2 text-center bg-blue-50/30">
                        {canEdit ? (
                          <div className="flex flex-col items-center space-y-1">
                            <select
                              value={currentRate}
                              onChange={e => handleRateChange(item.employee_id, e.target.value)}
                              className={`text-xs font-bold rounded-lg px-2 py-1 border outline-none bg-white shadow-sm cursor-pointer transition-all ${
                                currentRate === 1.0
                                  ? 'border-emerald-300 text-emerald-800 bg-emerald-50/50'
                                  : currentRate >= 0.75
                                  ? 'border-blue-300 text-blue-800 bg-blue-50/50'
                                  : currentRate >= 0.5
                                  ? 'border-amber-300 text-amber-800 bg-amber-50/50'
                                  : currentRate >= 0.25
                                  ? 'border-orange-300 text-orange-800 bg-orange-50/50'
                                  : 'border-red-300 text-red-800 bg-red-50/50'
                              }`}
                            >
                              {RESPONSIBILITY_RATE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <span className="text-[11px] font-bold text-blue-800 tracking-tight">
                              ➜ {formatNumber(item.responsibility_amount)} đ
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-800">
                              {RESPONSIBILITY_RATE_OPTIONS.find(o => Math.abs(o.value - currentRate) < 0.01)?.shortLabel ||
                                `${Math.round(currentRate * 100)}%`}
                            </span>
                            <span className="text-[11px] font-bold text-blue-800">
                              {formatCurrency(item.responsibility_amount)}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Thưởng hiệu quả */}
                      <td className="px-3 py-2 text-right bg-amber-50/20">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={item.performance_bonus ?? 0}
                            onChange={e => handleInlineChange(item.employee_id, 'performance_bonus', e.target.value)}
                            className="w-28 text-right font-semibold text-amber-900 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 rounded-md px-2 py-1 text-xs outline-none bg-white shadow-sm"
                          />
                        ) : (
                          <span className="font-semibold text-amber-900 text-xs">
                            {formatNumber(item.performance_bonus)}
                          </span>
                        )}
                      </td>

                      {/* Trừ vi phạm */}
                      <td className="px-3 py-2 text-right bg-amber-50/20">
                        {canEdit ? (
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={item.discipline_deduction ?? 0}
                            onChange={e => handleInlineChange(item.employee_id, 'discipline_deduction', e.target.value)}
                            className="w-24 text-right font-semibold text-red-600 border border-slate-200 focus:border-red-400 focus:ring-1 focus:ring-red-300 rounded-md px-2 py-1 text-xs outline-none bg-white shadow-sm"
                          />
                        ) : (
                          <span className="font-semibold text-red-600 text-xs">
                            {formatNumber(item.discipline_deduction)}
                          </span>
                        )}
                      </td>

                      {/* Tổng KPI thực nhận */}
                      <td className="px-4 py-3 text-right bg-emerald-50/60 font-bold text-emerald-800 text-sm">
                        <div className="flex flex-col items-end">
                          <span>{formatCurrency(item.total_kpi)}</span>
                          <span className="text-[10px] font-medium text-emerald-600">
                            (TN: {formatNumber(item.responsibility_amount)} | HQ: {formatNumber(item.net_performance)})
                          </span>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="px-4 py-3 text-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-slate-600 hover:text-brand-700 transition"
                          title="Chỉnh sửa chi tiết & Ghi chú"
                        >
                          <Edit3 size={15} />
                        </button>

                        {isAdminOrHR && (
                          <button
                            onClick={() => handleDeleteKpi(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                            title="Xóa bản ghi KPI"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Cập nhật KPI Nhân viên */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Cập nhật KPI Nhân viên</h3>
                <p className="text-xs text-slate-300">
                  {editingItem.fullname} ({editingItem.employee_code}) - Tháng {month}/{year}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                {editingItem.position_name}
              </span>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              {/* Group 1: KPI Trách nhiệm */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                  <Award size={16} />
                  <span>1. Nhóm KPI Trách nhiệm (Theo Tầng)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Thưởng trách nhiệm định mức (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      required
                      value={modalForm.responsibility_bonus}
                      onChange={e =>
                        setModalForm({ ...modalForm, responsibility_bonus: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full border border-blue-300 rounded-lg p-2.5 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Tỷ lệ đạt KPI Trách nhiệm (4 tiêu chí)
                    </label>
                    <select
                      value={modalForm.responsibility_rate}
                      onChange={e =>
                        setModalForm({ ...modalForm, responsibility_rate: parseFloat(e.target.value) })
                      }
                      className="w-full border border-blue-300 rounded-lg p-2.5 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {RESPONSIBILITY_RATE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-blue-900 pt-1 border-t border-blue-100">
                  <span>Tiền KPI Trách nhiệm thực nhận:</span>
                  <span className="font-bold text-sm text-blue-800">
                    {formatCurrency(Math.round(modalForm.responsibility_bonus * modalForm.responsibility_rate))}
                  </span>
                </div>
              </div>

              {/* Group 2: KPI Hiệu quả */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                  <TrendingUp size={16} />
                  <span>2. Nhóm KPI Thưởng hiệu quả (Cá nhân)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Thưởng hiệu quả cá nhân (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={modalForm.performance_bonus}
                      onChange={e =>
                        setModalForm({ ...modalForm, performance_bonus: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full border border-amber-300 rounded-lg p-2.5 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Trừ vi phạm hiệu quả / Kỷ luật (VND)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={modalForm.discipline_deduction}
                      onChange={e =>
                        setModalForm({ ...modalForm, discipline_deduction: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full border border-red-200 rounded-lg p-2.5 text-sm font-bold text-red-600 outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-amber-800 pt-1 border-t border-amber-100">
                  <span>Thực nhận KPI Hiệu quả:</span>
                  <span className="font-bold text-sm">
                    {formatCurrency(Math.max(0, modalForm.performance_bonus - modalForm.discipline_deduction))}
                  </span>
                </div>
              </div>

              {/* Note / Ghi chú */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Ghi chú / Diễn giải vi phạm</label>
                <textarea
                  rows="2"
                  value={modalForm.note}
                  onChange={e => setModalForm({ ...modalForm, note: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                  placeholder="Nhập lý do trừ hoặc khen thưởng đặc biệt..."
                />
              </div>

              {/* Live Total Calculated Payout Banner */}
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Tổng KPI thực nhận tháng {month}/{year}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    [Thưởng TN × Tỷ lệ %] + Max(0, Thưởng HQ - Trừ VP)
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-700">
                  {formatCurrency(
                    Math.round(modalForm.responsibility_bonus * modalForm.responsibility_rate) +
                      Math.max(0, modalForm.performance_bonus - modalForm.discipline_deduction)
                  )}
                </span>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 text-white rounded-lg text-xs font-bold hover:bg-brand-800 shadow transition"
                >
                  Cập nhật KPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiPage;
