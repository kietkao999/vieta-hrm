import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  BarChart3, Users, DollarSign, Calendar, TrendingUp,
  PieChart, AlertTriangle, ArrowUp, ArrowDown, Download,
  FileSpreadsheet, CalendarRange, Check, X, ChevronDown, ChevronUp,
  Layers, FileText, Sparkles, Filter, CheckSquare, Square,
  Award, Target, Zap, Search, Eye, SlidersHorizontal, Info,
  ChevronRight, UserCheck, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ReportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [summaryData, setSummaryData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [kpiData, setKpiData] = useState(null);

  // KPI Specific Sub-states
  const [kpiSubTab, setKpiSubTab] = useState('all'); // 'all' | 'responsibility' | 'performance'
  const [kpiSearchTerm, setKpiSearchTerm] = useState('');
  const [kpiFilterType, setKpiFilterType] = useState('all'); // 'all' | 'has_performance' | 'rate_100' | 'rate_below_100'
  const [expandedEmpId, setExpandedEmpId] = useState(null);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState('2026');

  // Month Selection State
  // Mode: 'single' | 'multi'
  const [selectionMode, setSelectionMode] = useState('multi'); 
  const [singleMonth, setSingleMonth] = useState('7');
  const [selectedMonths, setSelectedMonths] = useState(['1', '2', '3', '4', '5', '6', '7']); // Default 7 months with HQ data

  const [error, setError] = useState('');

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState('multi'); // 'current' | 'multi' | 'range' | 'single'
  const [exportSingleMonth, setExportSingleMonth] = useState('7');
  const [exportFromMonth, setExportFromMonth] = useState('1');
  const [exportToMonth, setExportToMonth] = useState('7');
  const [exportSelectedMonths, setExportSelectedMonths] = useState(['1', '2', '3', '4', '5', '6', '7']);
  const [exportDept, setExportDept] = useState('');
  const [exportYear, setExportYear] = useState('2026');
  const [exportType, setExportType] = useState('all'); // 'all' | 'payroll' | 'kpi' | 'attendance' | 'summary'
  const [isExporting, setIsExporting] = useState(false);

  // Load Departments and Employees on mount
  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          api.get('/departments'),
          api.get('/employees?limit=200')
        ]);
        setDepartments(deptRes.data || []);
        const empList = empRes.data?.data || empRes.data?.employees || (Array.isArray(empRes.data) ? empRes.data : []);
        setEmployees(empList);
      } catch (err) {
        console.error('Lỗi tải danh mục ban đầu:', err);
      }
    };
    loadInitData();
  }, []);

  // Helper: Get active months query string
  const getActiveMonthsParam = () => {
    if (selectionMode === 'single') {
      return `month=${singleMonth}`;
    }
    const sorted = [...selectedMonths].map(Number).sort((a, b) => a - b).join(',');
    return `months=${sorted || '1'}`;
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError('');
    const monthsParam = getActiveMonthsParam();
    const deptParam = selectedDepartment ? `&department_id=${encodeURIComponent(selectedDepartment)}` : '';
    try {
      switch (tab) {
        case 'summary': {
          const res = await api.get(`/reports/summary${selectedDepartment ? `?department_id=${encodeURIComponent(selectedDepartment)}` : ''}`);
          setSummaryData(res.data);
          break;
        }
        case 'payroll': {
          const res = await api.get(`/reports/payroll?${monthsParam}&year=${year}${deptParam}`);
          setPayrollData(res.data);
          break;
        }
        case 'attendance': {
          const res = await api.get(`/reports/attendance?${monthsParam}&year=${year}${deptParam}`);
          setAttendanceData(res.data);
          break;
        }
        case 'kpi':
        case 'performance': {
          const res = await api.get(`/reports/kpi?${monthsParam}&year=${year}${deptParam}`);
          setKpiData(res.data);
          break;
        }
      }
    } catch (err) {
      setError('Lỗi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, year, selectionMode, singleMonth, selectedMonths, selectedDepartment]);

  const formatCurrency = (val) => val ? Number(val).toLocaleString('vi-VN') : '0';

  // Toggle month in multi-select mode
  const toggleMonth = (mStr) => {
    if (selectedMonths.includes(mStr)) {
      if (selectedMonths.length === 1) return; // Giữ lại ít nhất 1 tháng
      setSelectedMonths(selectedMonths.filter(m => m !== mStr));
    } else {
      setSelectedMonths([...selectedMonths, mStr]);
    }
  };

  // Quick Presets
  const applyPreset = (presetMonths) => {
    setSelectionMode('multi');
    setSelectedMonths(presetMonths);
  };

  const handleExportExcel = async (overrideParams = null) => {
    setIsExporting(true);
    try {
      const activeExportDept = overrideParams?.department_id !== undefined ? overrideParams.department_id : exportDept || selectedDepartment;
      const deptQuery = activeExportDept ? `&department_id=${encodeURIComponent(activeExportDept)}` : '';
      let url = `/reports/export?year=${exportYear}&reportType=${exportType}${deptQuery}`;

      if (overrideParams) {
        const pYear = overrideParams.year || year;
        const pType = overrideParams.reportType || 'all';
        if (overrideParams.months) {
          url = `/reports/export?months=${overrideParams.months}&year=${pYear}&reportType=${pType}${deptQuery}`;
        } else if (overrideParams.fromMonth && overrideParams.toMonth) {
          url = `/reports/export?fromMonth=${overrideParams.fromMonth}&toMonth=${overrideParams.toMonth}&year=${pYear}&reportType=${pType}${deptQuery}`;
        } else if (overrideParams.month) {
          url = `/reports/export?fromMonth=${overrideParams.month}&toMonth=${overrideParams.month}&year=${pYear}&reportType=${pType}${deptQuery}`;
        }
      } else {
        if (exportMode === 'current') {
          const monthsStr = selectionMode === 'single' ? singleMonth : selectedMonths.join(',');
          url = `/reports/export?months=${monthsStr}&year=${exportYear}&reportType=${exportType}${deptQuery}`;
        } else if (exportMode === 'multi') {
          const sorted = [...exportSelectedMonths].map(Number).sort((a, b) => a - b).join(',');
          url = `/reports/export?months=${sorted || '1'}&year=${exportYear}&reportType=${exportType}${deptQuery}`;
        } else if (exportMode === 'range') {
          const startM = Math.min(parseInt(exportFromMonth, 10), parseInt(exportToMonth, 10));
          const endM = Math.max(parseInt(exportFromMonth, 10), parseInt(exportToMonth, 10));
          url = `/reports/export?fromMonth=${startM}&toMonth=${endM}&year=${exportYear}&reportType=${exportType}${deptQuery}`;
        } else {
          url = `/reports/export?fromMonth=${exportSingleMonth}&toMonth=${exportSingleMonth}&year=${exportYear}&reportType=${exportType}${deptQuery}`;
        }
      }

      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;

      const filenameHeader = response.headers['content-disposition'];
      let filename = `Bao_Cao_HRM_Viet_A_${new Date().getTime()}.xlsx`;
      if (filenameHeader && filenameHeader.includes('filename=')) {
        filename = decodeURIComponent(filenameHeader.split('filename=')[1].replace(/['"]/g, ''));
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      setShowExportModal(false);
    } catch (err) {
      console.error('Lỗi khi xuất file:', err);
      alert('Không thể tải file báo cáo Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'summary', label: 'Tổng quan', icon: PieChart },
    { id: 'payroll', label: 'Quỹ Lương', icon: DollarSign },
    { id: 'attendance', label: 'Chấm công', icon: Calendar },
    { id: 'kpi', label: 'Đánh Giá KPI', icon: Target },
    { id: 'performance', label: 'Thưởng Hiệu Quả', icon: Zap }
  ];

  const sortedActiveMonths = [...(selectionMode === 'single' ? [singleMonth] : selectedMonths)]
    .map(Number).sort((a, b) => a - b);
  
  const selectedDeptObj = departments.find(d => String(d.id) === String(selectedDepartment) || d.name === selectedDepartment);
  const targetDeptName = selectedDeptObj ? selectedDeptObj.name : selectedDepartment;
  const targetDeptId = selectedDeptObj ? selectedDeptObj.id : selectedDepartment;
  const deptDisplayName = selectedDeptObj ? selectedDeptObj.name : 'Tất cả phòng ban';

  // Lọc nhân sự theo phòng ban được chọn
  const filteredEmployees = selectedDepartment
    ? employees.filter(e => String(e.department_id) === String(targetDeptId) || String(e.department_id) === String(targetDeptName) || e.department_name === targetDeptName)
    : employees;

  // Tính toán số liệu tổng quan động
  const activeEmps = filteredEmployees.filter(e => e.status === 'Đang làm việc' || !e.status);
  const displayTotalActive = selectedDepartment
    ? activeEmps.length
    : (summaryData?.totalActive ?? activeEmps.length);

  const displaySeniority = (() => {
    const withJoin = activeEmps.filter(e => e.join_date);
    if (withJoin.length === 0) return summaryData?.avgSeniority || 0;
    const now = new Date();
    const totalYears = withJoin.reduce((acc, e) => {
      const jd = new Date(e.join_date);
      const diff = (now - jd) / (1000 * 60 * 60 * 24 * 365.25);
      return acc + (isNaN(diff) ? 0 : diff);
    }, 0);
    return Math.round((totalYears / withJoin.length) * 10) / 10;
  })();

  const displayDeptStats = (() => {
    if (selectedDepartment) {
      return [{ department_name: targetDeptName, count: activeEmps.length }];
    }
    if (summaryData?.deptStats && summaryData.deptStats.length > 0) {
      return summaryData.deptStats;
    }
    const map = {};
    activeEmps.forEach(e => {
      const dName = e.department_name || departments.find(d => d.id === e.department_id)?.name || 'Khác';
      map[dName] = (map[dName] || 0) + 1;
    });
    return Object.entries(map).map(([department_name, count]) => ({ department_name, count })).sort((a, b) => b.count - a.count);
  })();

  const displayGenderStats = (() => {
    if (selectedDepartment && activeEmps.length > 0) {
      const male = activeEmps.filter(e => e.gender === 'Nam').length;
      const female = activeEmps.filter(e => e.gender === 'Nữ').length;
      const other = activeEmps.length - male - female;
      const stats = [];
      if (male > 0) stats.push({ gender: 'Nam', count: male });
      if (female > 0) stats.push({ gender: 'Nữ', count: female });
      if (other > 0) stats.push({ gender: 'Khác', count: other });
      return stats;
    }
    return summaryData?.genderStats || [];
  })();

  const displayStatusStats = (() => {
    if (selectedDepartment && filteredEmployees.length > 0) {
      const map = {};
      filteredEmployees.forEach(e => {
        const st = e.status || 'Đang làm việc';
        map[st] = (map[st] || 0) + 1;
      });
      return Object.entries(map).map(([status, count]) => ({ status, count }));
    }
    return summaryData?.statusStats || [];
  })();

  const displayRangeText = (selectionMode === 'single'
    ? `Tháng ${singleMonth.padStart(2, '0')}/${year}`
    : sortedActiveMonths.length === 12
      ? `Cả năm ${year} (12 Tháng)`
      : sortedActiveMonths.length > 1 && sortedActiveMonths[sortedActiveMonths.length - 1] - sortedActiveMonths[0] === sortedActiveMonths.length - 1
        ? `Từ Tháng ${String(sortedActiveMonths[0]).padStart(2, '0')} đến Tháng ${String(sortedActiveMonths[sortedActiveMonths.length - 1]).padStart(2, '0')}/${year} (${sortedActiveMonths.length} tháng)`
        : `Các Tháng: ${sortedActiveMonths.map(m => `T${m}`).join(', ')} / ${year}`) + ` • Phòng ban: ${deptDisplayName}`;

  // Tab: Tổng quan Nhân sự
  const renderSummary = () => {
    if (!summaryData && employees.length === 0) return null;
    return (
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shrink-0"><Users size={24} /></div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">NHÂN SỰ ĐANG LÀM VIỆC</p>
              <p className="text-2xl font-black text-slate-900">{displayTotalActive}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 shrink-0"><TrendingUp size={24} /></div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">THÂM NIÊN TRUNG BÌNH</p>
              <p className="text-2xl font-black text-slate-900">{displaySeniority} năm</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600 shrink-0"><PieChart size={24} /></div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">SỐ PHÒNG BAN</p>
              <p className="text-2xl font-black text-slate-900">{selectedDepartment ? 1 : (displayDeptStats?.length || 0)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600 shrink-0"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">HĐ SẮP HẾT HẠN</p>
              <p className="text-2xl font-black text-slate-900">{summaryData?.expiringContracts?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phân bổ theo phòng ban */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Phân bổ nhân sự theo Phòng ban</h3>
            <div className="space-y-3">
              {(displayDeptStats || []).map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate mr-4">{d.department_name}</span>
                  <div className="flex items-center space-x-3 min-w-[180px]">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[120px]">
                      <div className="h-2.5 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (d.count / (displayTotalActive || 1)) * 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-800 w-12 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phân bổ theo giới tính */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Phân bổ theo Giới tính & Trạng thái</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">GIỚI TÍNH</h4>
                <div className="space-y-2">
                  {(displayGenderStats || []).map((g, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{g.gender || 'Khác'}</span>
                      <span className="text-sm font-bold text-brand-700">{g.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">TRẠNG THÁI</h4>
                <div className="space-y-2">
                  {(displayStatusStats || []).map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{s.status}</span>
                      <span className="text-sm font-bold text-brand-700">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab: Quỹ Lương
  const renderPayroll = () => {
    if (!payrollData) return null;
    const { yearTotal, monthlyPayroll, topSalaries } = payrollData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG THỰC LĨNH ({sortedActiveMonths.length} THÁNG)</p>
            <p className="text-xl font-bold text-brand-700 mt-1">{formatCurrency(yearTotal?.total_net)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG LƯƠNG TẦNG & BẬC</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(yearTotal?.total_base)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG KPI & HIỆU QUẢ</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              {formatCurrency((yearTotal?.total_responsibility || 0) + (yearTotal?.total_performance || 0))} đ
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">SỐ LƯỢT PHIẾU LƯƠNG</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{yearTotal?.total_records || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quỹ lương theo tháng */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quỹ lương theo từng tháng</h3>
              <span className="text-xs text-slate-500 font-semibold">{monthlyPayroll?.length || 0} tháng có dữ liệu</span>
            </div>
            {monthlyPayroll?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu lương trong các tháng đã chọn</p>
            ) : (
              <div className="space-y-2">
                {(monthlyPayroll || []).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Tháng {m.month.toString().padStart(2, '0')}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-500">{m.employee_count} NV</span>
                      <span className="text-sm font-bold text-brand-700">{formatCurrency(m.total_net_salary)} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top lương */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top 5 Tổng Thu Nhập Cao Nhất Trong Kỳ</h3>
            {topSalaries?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {(topSalaries || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'}`}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.fullname}</p>
                        <p className="text-xs text-slate-500">{s.department_name} • {s.months_counted} tháng</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-700">{formatCurrency(s.net_salary)} đ</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tab: Chấm công
  const renderAttendance = () => {
    if (!attendanceData) return null;
    const { statusSummary, lateStats, otSummary, totalWorkDays } = attendanceData;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG NGÀY CÔNG ({sortedActiveMonths.length} THÁNG)</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{totalWorkDays?.total_days || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG NV CÓ CHẤM CÔNG</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{totalWorkDays?.total_employees || 0}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG GIỜ OT</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{otSummary?.total_ot || 0} giờ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">NV LÀM OT</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{otSummary?.ot_employees || 0} người</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trạng thái chấm công */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Phân bổ trạng thái chấm công</h3>
            <div className="space-y-3">
              {(statusSummary || []).map((s, i) => {
                const statusColor = s.status === 'Đúng giờ' ? 'bg-emerald-500' : s.status === 'Đi trễ' ? 'bg-amber-500' : s.status === 'Nghỉ phép' ? 'bg-blue-500' : 'bg-slate-400';
                const total = statusSummary.reduce((sum, x) => sum + x.count, 0) || 1;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                      <span className="text-sm text-slate-700 font-medium">{s.status}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${statusColor}`} style={{ width: `${(s.count / total) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-800 w-10 text-right">{s.count}</span>
                    </div>
                  </div>
                );
              })}
              {(!statusSummary || statusSummary.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu chấm công trong các tháng đã chọn</p>
              )}
            </div>
          </div>

          {/* Thống kê đi trễ */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Nhân viên đi trễ nhiều nhất</h3>
            {lateStats?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Không có ai đi trễ 🎉</p>
            ) : (
              <div className="space-y-3">
                {(lateStats || []).slice(0, 5).map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{l.fullname}</p>
                      <p className="text-xs text-slate-500">{l.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{l.late_count} lần</p>
                      <p className="text-xs text-slate-500">{l.total_late_minutes} phút</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TAB 4: BÁO CÁO ĐÁNH GIÁ KPI (KPI TRÁCH NHIỆM) THEO TỪNG NGƯỜI & PHÒNG BAN
  // =========================================================================
  const renderKpi = () => {
    if (!kpiData) return null;

    const rawEmpList = kpiData.employeeList || [];
    const rawDeptKpi = kpiData.deptKpi || [];
    const rawTopKpi = kpiData.topPerformersKpi || [];

    // 1. Lọc theo Phòng Ban
    const deptFilteredEmpList = selectedDepartment
      ? rawEmpList.filter(e => String(e.department_id) === String(targetDeptId) || String(e.department_id) === String(targetDeptName) || e.department_name === targetDeptName)
      : rawEmpList;

    const deptFilteredDeptKpi = selectedDepartment
      ? rawDeptKpi.filter(d => d.department_name === targetDeptName || String(d.department_id) === String(targetDeptId))
      : rawDeptKpi;

    // 2. Lọc theo Tìm kiếm & Điều kiện phụ KPI
    const filteredEmpList = deptFilteredEmpList.filter(emp => {
      const matchSearch = !kpiSearchTerm || 
        emp.fullname.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
        (emp.department_name && emp.department_name.toLowerCase().includes(kpiSearchTerm.toLowerCase()));

      let matchFilter = true;
      if (kpiFilterType === 'rate_100') {
        matchFilter = (emp.avg_responsibility_rate || 0) >= 0.999;
      } else if (kpiFilterType === 'rate_75') {
        matchFilter = (emp.avg_responsibility_rate || 0) >= 0.749 && (emp.avg_responsibility_rate || 0) < 0.999;
      } else if (kpiFilterType === 'rate_below_75') {
        matchFilter = (emp.avg_responsibility_rate || 0) < 0.749;
      }

      return matchSearch && matchFilter;
    });

    // 3. Tính toán các chỉ số KPI
    const activeTargetSum = deptFilteredEmpList.reduce((acc, e) => acc + (e.total_responsibility_target || 0), 0);
    const activeRespSum = deptFilteredEmpList.reduce((acc, e) => acc + (e.total_responsibility_amount || 0), 0);
    const activeDiscSum = deptFilteredEmpList.reduce((acc, e) => acc + (e.total_discipline_deduction || 0), 0);
    const activeTotalEvaluations = deptFilteredEmpList.reduce((acc, e) => acc + (e.months_count || 0), 0);
    const activeAvgRate = deptFilteredEmpList.length > 0
      ? (deptFilteredEmpList.reduce((acc, e) => acc + (e.avg_responsibility_rate || 0), 0) / deptFilteredEmpList.length)
      : 1.0;

    const filteredTopKpi = selectedDepartment
      ? [...deptFilteredEmpList].sort((a, b) => b.total_responsibility_amount - a.total_responsibility_amount).slice(0, 5)
      : rawTopKpi.slice(0, 5);

    const formatRateBadge = (rate) => {
      const p = Math.round((rate || 0) * 100);
      if (p >= 100) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">100% (Đạt)</span>;
      if (p >= 75) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">{p}% (3/4)</span>;
      if (p >= 50) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">{p}% (2/4)</span>;
      if (p > 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">{p}% (1/4)</span>;
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">0% (0/4)</span>;
    };

    return (
      <div className="space-y-6">
        {/* 3 Thẻ thống kê KPI Trách Nhiệm */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">TỔNG TIỀN KPI THỰC NHẬN</span>
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700">
                <Target size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-900 mt-2">{formatCurrency(activeRespSum)} đ</p>
            <p className="text-[11px] text-blue-700 font-semibold mt-1">
              Đạt trung bình: <strong>{Math.round(activeAvgRate * 100)}%</strong> định mức
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TỔNG ĐỊNH MỨC KPI</span>
              <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <BarChart3 size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(activeTargetSum)} đ</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Tổng định mức đăng ký qua {sortedActiveMonths.length} tháng
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SỐ LƯỢT ĐÁNH GIÁ</span>
              <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <Users size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">{activeTotalEvaluations} lượt</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Quy mô: <strong>{deptFilteredEmpList.length}</strong> nhân sự trực thuộc
            </p>
          </div>
        </div>

        {/* Khối 1: Ngân sách KPI theo phòng ban & Top KPI cao nhất */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ngân sách KPI theo phòng ban */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Layers size={15} className="text-blue-700" />
                <span>Ngân Sách KPI Theo Phòng Ban</span>
              </h3>
              <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {deptFilteredDeptKpi.length} phòng ban
              </span>
            </div>

            {deptFilteredDeptKpi.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2.5">
                {deptFilteredDeptKpi.map((d, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-blue-50/40 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{d.department_name || 'Chưa phân bổ'}</p>
                      <p className="text-[11px] text-slate-500">
                        {d.kpi_count} lượt • Định mức: {formatCurrency(d.total_dept_responsibility_target || 0)} đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-700">{formatCurrency(d.total_dept_responsibility_amount || 0)} đ</p>
                      <span className="text-[10.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Đạt {Math.round((d.avg_responsibility_rate || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top KPI cao nhất */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Award size={15} className="text-amber-500" />
                <span>Top Nhân Sự Đạt KPI Cao Nhất ({sortedActiveMonths.length} Tháng)</span>
              </h3>
            </div>

            {filteredTopKpi.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2.5">
                {filteredTopKpi.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-800' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.fullname}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.department_name} • {p.code}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-black text-blue-700">{formatCurrency(p.achieved_score || p.total_responsibility_amount)} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khối 2: BẢNG BÁO CÁO CHI TIẾT KPI THEO TỪNG NGƯỜI */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <FileText size={16} className="text-blue-700" />
                  <span>Bảng Báo Cáo Đánh Giá KPI Từng Nhân Sự</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chi tiết định mức, % hoàn thành và tiền KPI thực nhận qua {sortedActiveMonths.length} tháng ({sortedActiveMonths.map(m => `T${m}`).join(', ')})
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Hiển thị: <strong className="text-blue-700">{filteredEmpList.length}</strong> / {deptFilteredEmpList.length} nhân viên
              </div>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên theo tên, mã NV..."
                  value={kpiSearchTerm}
                  onChange={e => setKpiSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                {kpiSearchTerm && (
                  <button onClick={() => setKpiSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Lọc KPI:</span>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'rate_100', label: 'Đạt 100%' },
                  { id: 'rate_75', label: 'Đạt 75%' },
                  { id: 'rate_below_75', label: 'Dưới 75%' }
                ].map(flt => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setKpiFilterType(flt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      kpiFilterType === flt.id
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bảng Dữ Liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[180px]">Nhân viên</th>
                  <th className="py-3 px-3 min-w-[140px]">Phòng ban</th>
                  <th className="py-3 px-2 text-center w-16">Tháng</th>
                  <th className="py-3 px-3 text-right min-w-[120px]">Định mức KPI</th>
                  <th className="py-3 px-3 text-center min-w-[100px]">% Đạt TB</th>
                  <th className="py-3 px-3 text-right min-w-[130px] bg-blue-50/70 text-blue-900">🎯 KPI Thực Nhận</th>
                  <th className="py-3 px-3 text-right min-w-[100px] text-slate-500">Khấu trừ</th>
                  <th className="py-3 px-3 text-right min-w-[130px] bg-emerald-50/70 text-emerald-950 font-black">💰 KPI Thực Lĩnh</th>
                  <th className="py-3 px-2 text-center w-16">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmpList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-500">
                      Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredEmpList.map((emp, index) => {
                    const isExpanded = expandedEmpId === emp.employee_id;
                    const netKpi = Math.max(0, emp.total_responsibility_amount - emp.total_discipline_deduction);
                    return (
                      <React.Fragment key={emp.employee_id}>
                        <tr className={`hover:bg-slate-50/90 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                          <td className="py-3 px-3 text-center text-slate-400 font-semibold">{index + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{emp.fullname}</div>
                            <div className="text-[11px] text-slate-500">{emp.code} {emp.position_name ? `• ${emp.position_name}` : ''}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">{emp.department_name || 'Chưa phân bổ'}</td>
                          <td className="py-3 px-2 text-center font-bold text-slate-600">{emp.months_count}T</td>
                          <td className="py-3 px-3 text-right text-slate-600 font-semibold">{formatCurrency(emp.total_responsibility_target)} đ</td>
                          <td className="py-3 px-3 text-center">{formatRateBadge(emp.avg_responsibility_rate)}</td>
                          <td className="py-3 px-3 text-right font-bold text-blue-700 bg-blue-50/30">{formatCurrency(emp.total_responsibility_amount)} đ</td>
                          <td className="py-3 px-3 text-right text-red-600 font-semibold">
                            {emp.total_discipline_deduction > 0 ? `-${formatCurrency(emp.total_discipline_deduction)} đ` : '0 đ'}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-brand-800 bg-emerald-50/40 text-[12.5px]">
                            {formatCurrency(netKpi)} đ
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedEmpId(isExpanded ? null : emp.employee_id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-200 transition cursor-pointer"
                              title="Xem chi tiết các tháng"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-y border-slate-200">
                            <td colSpan="10" className="p-4">
                              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <span className="text-xs font-bold text-slate-800">
                                    Chi tiết KPI qua từng tháng của {emp.fullname} ({emp.code})
                                  </span>
                                  <span className="text-[11px] text-slate-500">{emp.monthly_records.length} tháng ghi nhận</span>
                                </div>
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 text-[11px] border-b border-slate-100">
                                      <th className="py-1.5 px-2">Kỳ Tháng</th>
                                      <th className="py-1.5 px-2 text-right">Định mức KPI</th>
                                      <th className="py-1.5 px-2 text-center">Tỷ lệ đạt (%)</th>
                                      <th className="py-1.5 px-2 text-right text-blue-700 font-bold">KPI Thực Nhận</th>
                                      <th className="py-1.5 px-2 text-right text-red-600">Khấu trừ</th>
                                      <th className="py-1.5 px-2 text-right font-bold text-emerald-800">Tổng KPI</th>
                                      <th className="py-1.5 px-2 text-slate-400">Ghi chú</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {emp.monthly_records.map((mRec, mIdx) => (
                                      <tr key={mIdx} className="hover:bg-slate-50">
                                        <td className="py-1.5 px-2 font-bold text-slate-800">Tháng {mRec.month}/{year}</td>
                                        <td className="py-1.5 px-2 text-right text-slate-600">{formatCurrency(mRec.responsibility_bonus)} đ</td>
                                        <td className="py-1.5 px-2 text-center">{formatRateBadge(mRec.responsibility_rate)}</td>
                                        <td className="py-1.5 px-2 text-right font-bold text-blue-700">{formatCurrency(mRec.responsibility_amount)} đ</td>
                                        <td className="py-1.5 px-2 text-right text-red-600">
                                          {mRec.discipline_deduction > 0 ? `-${formatCurrency(mRec.discipline_deduction)} đ` : '0 đ'}
                                        </td>
                                        <td className="py-1.5 px-2 text-right font-bold text-emerald-800">
                                          {formatCurrency(Math.max(0, mRec.responsibility_amount - mRec.discipline_deduction))} đ
                                        </td>
                                        <td className="py-1.5 px-2 text-[11px] text-slate-500 italic">{mRec.note || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
              {filteredEmpList.length > 0 && (
                <tfoot className="bg-slate-100/90 font-bold text-slate-800 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan="4" className="py-3 px-3 text-center uppercase tracking-wider text-[11px] text-slate-600 font-extrabold">
                      TỔNG CỘNG ({filteredEmpList.length} NHÂN SỰ)
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCurrency(filteredEmpList.reduce((acc, e) => acc + (e.total_responsibility_target || 0), 0))} đ
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      TB {Math.round((filteredEmpList.reduce((acc, e) => acc + (e.avg_responsibility_rate || 0), 0) / filteredEmpList.length) * 100)}%
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-blue-800 bg-blue-100/50">
                      {formatCurrency(filteredEmpList.reduce((acc, e) => acc + (e.total_responsibility_amount || 0), 0))} đ
                    </td>
                    <td className="py-3 px-3 text-right text-red-600">
                      {formatCurrency(filteredEmpList.reduce((acc, e) => acc + (e.total_discipline_deduction || 0), 0))} đ
                    </td>
                    <td className="py-3 px-3 text-right font-black text-brand-900 bg-emerald-100/60 text-sm">
                      {formatCurrency(filteredEmpList.reduce((acc, e) => acc + Math.max(0, e.total_responsibility_amount - e.total_discipline_deduction), 0))} đ
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // TAB 5: BÁO CÁO THƯỞNG HIỆU QUẢ THEO TỪNG NGƯỜI & PHÒNG BAN
  // =========================================================================
  const renderPerformance = () => {
    if (!kpiData) return null;

    const rawEmpList = kpiData.employeeList || [];
    const rawDeptKpi = kpiData.deptKpi || [];
    const rawTopPerf = kpiData.topPerformersPerformance || [];

    // 1. Lọc theo Phòng Ban
    const deptFilteredEmpList = selectedDepartment
      ? rawEmpList.filter(e => String(e.department_id) === String(targetDeptId) || String(e.department_id) === String(targetDeptName) || e.department_name === targetDeptName)
      : rawEmpList;

    const deptFilteredDeptKpi = selectedDepartment
      ? rawDeptKpi.filter(d => d.department_name === targetDeptName || String(d.department_id) === String(targetDeptId))
      : rawDeptKpi;

    // 2. Lọc theo Tìm kiếm & Điều kiện phụ Thưởng Hiệu Quả
    const filteredEmpList = deptFilteredEmpList.filter(emp => {
      const matchSearch = !kpiSearchTerm || 
        emp.fullname.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
        (emp.department_name && emp.department_name.toLowerCase().includes(kpiSearchTerm.toLowerCase()));

      let matchFilter = true;
      if (kpiFilterType === 'has_performance') {
        matchFilter = (emp.total_performance_bonus || 0) > 0;
      } else if (kpiFilterType === 'perf_high') {
        matchFilter = (emp.total_performance_bonus || 0) >= 10000000;
      }

      return matchSearch && matchFilter;
    });

    // 3. Tính toán các chỉ số Thưởng Hiệu Quả
    const activePerfSum = deptFilteredEmpList.reduce((acc, e) => acc + (e.total_performance_bonus || 0), 0);
    const activePerfEmployees = deptFilteredEmpList.filter(e => (e.total_performance_bonus || 0) > 0);
    const activePerfCount = activePerfEmployees.length;
    const avgPerfPerEmployee = activePerfCount > 0 ? Math.round(activePerfSum / activePerfCount) : 0;

    const filteredTopPerf = selectedDepartment
      ? [...deptFilteredEmpList].filter(e => e.total_performance_bonus > 0).sort((a, b) => b.total_performance_bonus - a.total_performance_bonus).slice(0, 5)
      : rawTopPerf.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* 3 Thẻ Thống Kê Thưởng Hiệu Quả */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 to-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">TỔNG NGÂN SÁCH THƯỞNG HIỆU QUẢ</span>
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
                <Zap size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-900 mt-2">{formatCurrency(activePerfSum)} đ</p>
            <p className="text-[11px] text-purple-700 font-semibold mt-1">
              Tổng cộng qua {sortedActiveMonths.length} tháng ({sortedActiveMonths.map(m => `T${m}`).join(', ')})
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SỐ NHÂN SỰ ĐƯỢC KHEN THƯỞNG</span>
              <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <Users size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{activePerfCount} nhân sự</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Chiếm {deptFilteredEmpList.length > 0 ? Math.round((activePerfCount / deptFilteredEmpList.length) * 100) : 0}% tổng nhân sự phòng ban
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MỨC THƯỞNG BÌNH QUÂN</span>
              <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                <Award size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">{formatCurrency(avgPerfPerEmployee)} đ</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Bình quân trên mỗi nhân sự có thưởng hiệu quả
            </p>
          </div>
        </div>

        {/* Khối 1: Tổng Thưởng Hiệu Quả theo phòng ban & Top cao nhất */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thưởng hiệu quả theo phòng ban */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Layers size={15} className="text-purple-700" />
                <span>Thưởng Hiệu Quả Theo Phòng Ban</span>
              </h3>
              <span className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                {deptFilteredDeptKpi.length} phòng ban
              </span>
            </div>

            {deptFilteredDeptKpi.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2.5">
                {deptFilteredDeptKpi.map((d, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-purple-50/40 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{d.department_name || 'Chưa phân bổ'}</p>
                      <p className="text-[11px] text-slate-500">{d.kpi_count} lượt ghi nhận</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-purple-700">{formatCurrency(d.total_dept_performance_bonus || 0)} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Thưởng Hiệu Quả Cao Nhất */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Award size={15} className="text-purple-600" />
                <span>Top Thưởng Hiệu Quả Cao Nhất ({sortedActiveMonths.length} Tháng)</span>
              </h3>
            </div>

            {filteredTopPerf.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Chưa có ai nhận thưởng hiệu quả</p>
            ) : (
              <div className="space-y-2.5">
                {filteredTopPerf.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-purple-200 text-purple-900' : i === 1 ? 'bg-purple-100 text-purple-800' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.fullname}</p>
                        <p className="text-[11px] text-slate-500 truncate">{p.department_name} • {p.code}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-black text-purple-700">{formatCurrency(p.achieved_score || p.total_performance_bonus)} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khối 2: BẢNG BÁO CÁO CHI TIẾT THƯỞNG HIỆU QUẢ THEO TỪNG NGƯỜI */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Zap size={16} className="text-purple-700" />
                  <span>Bảng Báo Cáo Chi Tiết Thưởng Hiệu Quả Từng Nhân Sự</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp tiền thưởng hiệu quả / năng suất / doanh số phát sinh qua {sortedActiveMonths.length} tháng ({sortedActiveMonths.map(m => `T${m}`).join(', ')})
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Hiển thị: <strong className="text-purple-700">{filteredEmpList.length}</strong> / {deptFilteredEmpList.length} nhân viên
              </div>
            </div>

            {/* Thanh công cụ tìm kiếm */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên theo tên, mã NV..."
                  value={kpiSearchTerm}
                  onChange={e => setKpiSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
                {kpiSearchTerm && (
                  <button onClick={() => setKpiSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Lọc nhanh:</span>
                {[
                  { id: 'all', label: 'Tất cả nhân sự' },
                  { id: 'has_performance', label: 'Có thưởng HQ (>0đ)' },
                  { id: 'perf_high', label: 'Thưởng cao (≥10 triệu)' }
                ].map(flt => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setKpiFilterType(flt.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      kpiFilterType === flt.id
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bảng Dữ Liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[180px]">Nhân viên</th>
                  <th className="py-3 px-3 min-w-[140px]">Phòng ban</th>
                  <th className="py-3 px-2 text-center w-16">Tháng</th>
                  <th className="py-3 px-3 text-center min-w-[110px]">Số Tháng Thưởng</th>
                  <th className="py-3 px-3 text-right min-w-[130px]">Thưởng Max / Tháng</th>
                  <th className="py-3 px-3 text-right min-w-[150px] bg-purple-50/80 text-purple-950 font-black">
                    🚀 Tổng Thưởng Hiệu Quả
                  </th>
                  <th className="py-3 px-2 text-center w-16">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmpList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredEmpList.map((emp, index) => {
                    const isExpanded = expandedEmpId === emp.employee_id;
                    const monthsWithPerf = emp.monthly_records.filter(m => (m.performance_bonus || 0) > 0).length;
                    const maxPerfMonth = Math.max(0, ...emp.monthly_records.map(m => m.performance_bonus || 0));

                    return (
                      <React.Fragment key={emp.employee_id}>
                        <tr className={`hover:bg-slate-50/90 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                          <td className="py-3 px-3 text-center text-slate-400 font-semibold">{index + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{emp.fullname}</div>
                            <div className="text-[11px] text-slate-500">{emp.code} {emp.position_name ? `• ${emp.position_name}` : ''}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">{emp.department_name || 'Chưa phân bổ'}</td>
                          <td className="py-3 px-2 text-center font-bold text-slate-600">{emp.months_count}T</td>
                          <td className="py-3 px-3 text-center">
                            {monthsWithPerf > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                {monthsWithPerf}/{emp.months_count} tháng
                              </span>
                            ) : (
                              <span className="text-slate-400">0 tháng</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 font-semibold">
                            {maxPerfMonth > 0 ? `${formatCurrency(maxPerfMonth)} đ` : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-purple-800 bg-purple-50/40 text-[13px]">
                            {emp.total_performance_bonus > 0 ? (
                              <span>+{formatCurrency(emp.total_performance_bonus)} đ</span>
                            ) : (
                              <span className="text-slate-300 font-normal">0 đ</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedEmpId(isExpanded ? null : emp.employee_id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-slate-200 transition cursor-pointer"
                              title="Xem chi tiết các tháng"
                            >
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-y border-slate-200">
                            <td colSpan="8" className="p-4">
                              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <span className="text-xs font-bold text-slate-800">
                                    Chi tiết Thưởng Hiệu Quả qua từng tháng của {emp.fullname} ({emp.code})
                                  </span>
                                  <span className="text-[11px] text-slate-500">{emp.monthly_records.length} tháng ghi nhận</span>
                                </div>
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="text-slate-500 text-[11px] border-b border-slate-100">
                                      <th className="py-1.5 px-2">Kỳ Tháng</th>
                                      <th className="py-1.5 px-2 text-right text-purple-700 font-bold">Thưởng Hiệu Quả</th>
                                      <th className="py-1.5 px-2 text-slate-400">Ghi chú</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {emp.monthly_records.map((mRec, mIdx) => (
                                      <tr key={mIdx} className="hover:bg-slate-50">
                                        <td className="py-1.5 px-2 font-bold text-slate-800">Tháng {mRec.month}/{year}</td>
                                        <td className="py-1.5 px-2 text-right font-bold text-purple-700">
                                          {mRec.performance_bonus > 0 ? `+${formatCurrency(mRec.performance_bonus)} đ` : '0 đ'}
                                        </td>
                                        <td className="py-1.5 px-2 text-[11px] text-slate-500 italic">{mRec.note || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
              {filteredEmpList.length > 0 && (
                <tfoot className="bg-slate-100/90 font-bold text-slate-800 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan="4" className="py-3 px-3 text-center uppercase tracking-wider text-[11px] text-slate-600 font-extrabold">
                      TỔNG CỘNG ({filteredEmpList.length} NHÂN SỰ)
                    </td>
                    <td className="py-3 px-3 text-center">
                      {filteredEmpList.filter(e => (e.total_performance_bonus || 0) > 0).length} người có thưởng
                    </td>
                    <td></td>
                    <td className="py-3 px-3 text-right font-black text-purple-900 bg-purple-100/70 text-sm">
                      +{formatCurrency(filteredEmpList.reduce((acc, e) => acc + (e.total_performance_bonus || 0), 0))} đ
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Báo cáo & Thống kê HRM</h2>
          <p className="text-xs font-medium text-slate-600 mt-0.5">Tổng hợp dữ liệu nhân sự, quỹ lương, chấm công và hiệu suất KPI</p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setExportSelectedMonths([...selectedMonths]);
              setExportYear(year);
              setShowExportModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer border border-slate-700 active:scale-[0.98]"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* ========================================================================= */}
      {/* BỘ LỌC TINH GỌN: CHẾ ĐỘ XEM, PHÒNG BAN, MỐC NHANH & DẢI 12 THÁNG */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        {/* Hàng 1: Điều khiển chế độ, Lọc phòng ban, Mốc nhanh & Xuất Excel */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Chế độ xem tháng */}
            {activeTab !== 'summary' && (
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectionMode('multi')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === 'multi'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Nhiều tháng
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('single')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === 'single'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1 tháng
                </button>
              </div>
            )}

            {/* Lọc theo Phòng Ban */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Layers size={13} className="text-brand-700 shrink-0" />
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Phòng ban:</span>
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
              >
                <option value="">🏢 Tất cả phòng ban (Toàn công ty)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {selectedDepartment && (
                <button
                  type="button"
                  onClick={() => setSelectedDepartment('')}
                  className="text-slate-400 hover:text-red-600 p-0.5 rounded transition"
                  title="Xóa bộ lọc phòng ban"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Mốc chọn nhanh dạng Dropdown tinh gọn */}
            {activeTab !== 'summary' && (
              <div className="flex items-center space-x-1.5 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                <Sparkles size={13} className="text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-amber-900 whitespace-nowrap">Mốc nhanh:</span>
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) {
                      const val = e.target.value;
                      if (val === 't1-t7') applyPreset(['1', '2', '3', '4', '5', '6', '7']);
                      else if (val === 'q1') applyPreset(['1', '2', '3']);
                      else if (val === 'q2') applyPreset(['4', '5', '6']);
                      else if (val === 'q3') applyPreset(['7', '8', '9']);
                      else if (val === 'q4') applyPreset(['10', '11', '12']);
                      else if (val === 'h1') applyPreset(['1', '2', '3', '4', '5', '6']);
                      else if (val === 'h2') applyPreset(['7', '8', '9', '10', '11', '12']);
                      else if (val === 'all') applyPreset(Array.from({ length: 12 }, (_, i) => (i + 1).toString()));
                    }
                  }}
                  className="text-xs font-bold text-amber-950 bg-transparent outline-none cursor-pointer"
                >
                  <option value="" disabled>⚡ Chọn mốc nhanh...</option>
                  <option value="t1-t7">✨ T1 – T7 (Dữ liệu HQ thực tế)</option>
                  <option value="q1">Quý 1 (Tháng 01 - 03)</option>
                  <option value="q2">Quý 2 (Tháng 04 - 06)</option>
                  <option value="q3">Quý 3 (Tháng 07 - 09)</option>
                  <option value="q4">Quý 4 (Tháng 10 - 12)</option>
                  <option value="h1">6 Tháng đầu năm (T01 - T06)</option>
                  <option value="h2">6 Tháng cuối năm (T07 - T12)</option>
                  <option value="all">Toàn bộ cả năm (12 Tháng)</option>
                </select>
              </div>
            )}
          </div>

          {/* Nút Tải nhanh Excel */}
          {activeTab !== 'summary' && (
            <div className="flex items-center shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => handleExportExcel({
                  reportType: activeTab === 'kpi' ? 'kpi' : activeTab === 'payroll' ? 'payroll' : activeTab === 'attendance' ? 'attendance' : 'all',
                  months: selectionMode === 'single' ? singleMonth : selectedMonths.join(','),
                  year: year,
                  department_id: selectedDepartment
                })}
                disabled={isExporting}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title="Tải nhanh file Excel theo các tháng và phòng ban đang chọn"
              >
                <Download size={13} />
                <span>Tải Excel ({selectionMode === 'single' ? `T${singleMonth}` : `${sortedActiveMonths.length} tháng`}{selectedDeptObj ? ` - ${selectedDeptObj.name}` : ''})</span>
              </button>
            </div>
          )}
        </div>

        {/* Hàng 2: Dải 12 Tháng chọn trực quan */}
        {activeTab !== 'summary' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">Tháng:</span>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                const mStr = m.toString();
                const isSelected = selectionMode === 'single'
                  ? singleMonth === mStr
                  : selectedMonths.includes(mStr);
                const hasDataHQ = [1, 2, 3, 4, 5, 6, 7].includes(m);

                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (selectionMode === 'single') {
                        setSingleMonth(mStr);
                      } else {
                        toggleMonth(mStr);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all relative flex items-center cursor-pointer ${
                      isSelected
                        ? 'bg-brand-700 text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {selectionMode === 'multi' && (
                      isSelected ? <CheckSquare size={12} className="mr-1 text-white" /> : <Square size={12} className="mr-1 text-slate-400" />
                    )}
                    <span>T{m < 10 ? `0${m}` : m}</span>
                    {hasDataHQ && !isSelected && (
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block ml-1" title="Có dữ liệu thưởng hiệu quả"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Thao tác chọn tất cả / bỏ chọn cho chế độ multi */}
            {selectionMode === 'multi' && (
              <div className="flex items-center space-x-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedMonths(Array.from({ length: 12 }, (_, i) => (i + 1).toString()))}
                  className="text-brand-700 hover:underline font-semibold cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedMonths(['7'])}
                  className="text-slate-500 hover:underline cursor-pointer"
                >
                  Mặc định (T7)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Thanh tóm tắt đang xem thanh mảnh */}
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
          <div className="flex items-center space-x-1.5">
            <Sparkles size={13} className="text-brand-700 shrink-0" />
            <span className="text-[11.5px]">
              <strong>Đang xem:</strong> <span className="text-brand-900 font-bold">{displayRangeText}</span>
            </span>
          </div>
          {selectedDepartment && (
            <span className="bg-brand-100 text-brand-900 font-bold text-[11px] px-2 py-0.5 rounded border border-brand-200">
              Đang lọc: {selectedDeptObj?.name} ({filteredEmployees.length} NV)
            </span>
          )}
        </div>
      </div>

      {/* Tabs Bar + Year Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 overflow-x-auto custom-scroll-x">
          <div className="flex items-center gap-1.5 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-brand-700 text-white shadow-sm ring-1 ring-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon size={15} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Year selector */}
          <div className="flex items-center space-x-1.5 shrink-0 px-2">
            <span className="text-xs font-semibold text-slate-500">Năm</span>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none bg-white shadow-2xs cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && renderSummary()}
              {activeTab === 'payroll' && renderPayroll()}
              {activeTab === 'attendance' && renderAttendance()}
              {activeTab === 'kpi' && renderKpi()}
              {activeTab === 'performance' && renderPerformance()}
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL XUẤT BÁO CÁO EXCEL CHỌN NHIỀU THÁNG / KHOẢNG THÁNG */}
      {/* ========================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileSpreadsheet size={22} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Xuất Báo Cáo & Dữ Liệu Excel</h3>
                  <p className="text-xs text-white/80">Hỗ trợ xuất gộp nhiều tháng, theo khoảng thời gian hoặc từng tháng</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* 1. Chọn loại báo cáo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Chọn Mẫu Báo Cáo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'all', title: 'Toàn diện (Tất cả Sheet)', desc: 'Gồm Bảng lương, KPI, Chấm công, Danh sách NV', icon: Layers, color: 'text-brand-700' },
                    { id: 'payroll', title: 'Bảng Lương & Thu Nhập', desc: 'Lương tầng, lương bậc, KPI, hiệu quả, thực lĩnh', icon: DollarSign, color: 'text-emerald-600' },
                    { id: 'kpi', title: 'Đánh Giá KPI & Hiệu Quả', desc: 'Định mức, % trách nhiệm, thưởng HQ, tổng KPI', icon: TrendingUp, color: 'text-blue-600' },
                    { id: 'attendance', title: 'Thống Kê Chấm Công', desc: 'Ngày công chuẩn, đi trễ, giờ OT, nghỉ phép', icon: Calendar, color: 'text-amber-600' },
                    { id: 'summary', title: 'Danh Sách Nhân Sự', desc: 'Hồ sơ 57 nhân sự, phòng ban, chức vụ, mức lương', icon: Users, color: 'text-purple-600' }
                  ].map(t => {
                    const Icon = t.icon;
                    const isSelected = exportType === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setExportType(t.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-700 bg-brand-50/50 shadow-sm ring-2 ring-brand-700/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        } ${t.id === 'all' ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-100' : 'bg-slate-100'} ${t.color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-800">{t.title}</p>
                              {isSelected && <Check size={16} className="text-brand-700" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chọn hình thức thời gian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Chọn Thời Gian Xuất
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setExportMode('multi')}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      exportMode === 'multi'
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-700/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare size={15} />
                    <span>Chọn nhiều tháng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportMode('range')}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      exportMode === 'range'
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-700/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarRange size={15} />
                    <span>Khoảng (Từ - Đến)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportMode('single')}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      exportMode === 'single'
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-700/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar size={15} />
                    <span>1 Tháng</span>
                  </button>
                </div>

                {/* Nội dung chọn thời gian chi tiết */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  {exportMode === 'multi' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">CHỌN CÁC THÁNG MUỐN XUẤT:</span>
                        <div className="space-x-1">
                          <button
                            type="button"
                            onClick={() => setExportSelectedMonths(['1', '2', '3', '4', '5', '6', '7'])}
                            className="text-[11px] font-semibold text-brand-700 hover:underline"
                          >
                            T1–T7
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setExportSelectedMonths(Array.from({ length: 12 }, (_, i) => (i + 1).toString()))}
                            className="text-[11px] font-semibold text-brand-700 hover:underline"
                          >
                            Cả năm
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                          const mStr = m.toString();
                          const isSel = exportSelectedMonths.includes(mStr);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  if (exportSelectedMonths.length > 1) {
                                    setExportSelectedMonths(exportSelectedMonths.filter(x => x !== mStr));
                                  }
                                } else {
                                  setExportSelectedMonths([...exportSelectedMonths, mStr]);
                                }
                              }}
                              className={`p-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                                isSel
                                  ? 'bg-brand-700 border-brand-700 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Tháng {m < 10 ? `0${m}` : m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {exportMode === 'range' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">TỪ THÁNG</label>
                        <select
                          value={exportFromMonth}
                          onChange={e => setExportFromMonth(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m.toString()}>Tháng {m < 10 ? `0${m}` : m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">ĐẾN THÁNG</label>
                        <select
                          value={exportToMonth}
                          onChange={e => setExportToMonth(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m.toString()}>Tháng {m < 10 ? `0${m}` : m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {exportMode === 'single' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">CHỌN THÁNG</label>
                      <select
                        value={exportSingleMonth}
                        onChange={e => setExportSingleMonth(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m.toString()}>Tháng {m < 10 ? `0${m}` : m}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Chọn Năm */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">NĂM</label>
                    <select
                      value={exportYear}
                      onChange={e => setExportYear(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => 2024 + i).map(y => (
                        <option key={y} value={y.toString()}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Chọn phòng ban cần xuất */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Chọn Phòng Ban Xuất
                </label>
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Layers size={16} className="text-brand-700 shrink-0" />
                  <select
                    value={exportDept}
                    onChange={e => setExportDept(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                  >
                    <option value="">🏢 Tất cả phòng ban (Toàn bộ nhân sự công ty)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tóm tắt thông tin xuất */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-center space-x-3">
                <Sparkles size={20} className="text-emerald-700 shrink-0" />
                <div className="text-xs text-emerald-900 leading-snug">
                  <p className="font-bold">
                    File xuất: {exportMode === 'single'
                      ? `Tháng ${exportSingleMonth.padStart(2, '0')}/${exportYear}`
                      : exportMode === 'range'
                        ? `Từ Tháng ${exportFromMonth.padStart(2, '0')} đến Tháng ${exportToMonth.padStart(2, '0')}/${exportYear}`
                        : `${exportSelectedMonths.length} tháng (${exportSelectedMonths.map(m => `T${m}`).join(', ')}) / ${exportYear}`}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Định dạng file Microsoft Excel chuẩn (.xlsx) với đầy đủ dữ liệu, công thức và độ rộng cột tối ưu.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleExportExcel()}
                disabled={isExporting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-xs font-bold shadow-md hover:from-emerald-700 hover:to-teal-800 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang tạo file Excel...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Tải File Excel Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
