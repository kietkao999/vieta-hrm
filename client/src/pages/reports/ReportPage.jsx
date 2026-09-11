import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3, Users, DollarSign, Calendar, TrendingUp,
  PieChart, AlertTriangle, ArrowUp, ArrowDown, Download,
  FileSpreadsheet, CalendarRange, Check, X, ChevronDown,
  Layers, FileText, Sparkles, Filter, CheckSquare, Square
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ReportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [summaryData, setSummaryData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [kpiData, setKpiData] = useState(null);

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

  // Load Departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục phòng ban:', err);
      }
    };
    loadDepartments();
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
          const res = await api.get(`/reports/summary?${deptParam.replace('&', '')}`);
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
        case 'kpi': {
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
    { id: 'kpi', label: 'KPI & Hiệu Quả', icon: TrendingUp }
  ];

  const sortedActiveMonths = [...(selectionMode === 'single' ? [singleMonth] : selectedMonths)]
    .map(Number).sort((a, b) => a - b);
  
  const selectedDeptObj = departments.find(d => String(d.id) === String(selectedDepartment) || d.name === selectedDepartment);
  const deptDisplayName = selectedDeptObj ? selectedDeptObj.name : 'Tất cả phòng ban';

  const displayRangeText = (selectionMode === 'single'
    ? `Tháng ${singleMonth.padStart(2, '0')}/${year}`
    : sortedActiveMonths.length === 12
      ? `Cả năm ${year} (12 Tháng)`
      : sortedActiveMonths.length > 1 && sortedActiveMonths[sortedActiveMonths.length - 1] - sortedActiveMonths[0] === sortedActiveMonths.length - 1
        ? `Từ Tháng ${String(sortedActiveMonths[0]).padStart(2, '0')} đến Tháng ${String(sortedActiveMonths[sortedActiveMonths.length - 1]).padStart(2, '0')}/${year} (${sortedActiveMonths.length} tháng)`
        : `Các Tháng: ${sortedActiveMonths.map(m => `T${m}`).join(', ')} / ${year}`) + ` • Phòng ban: ${deptDisplayName}`;

  // Tab: Tổng quan Nhân sự
  const renderSummary = () => {
    if (!summaryData) return null;
    return (
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Users size={24} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400">NHÂN SỰ ĐANG LÀM VIỆC</p>
              <p className="text-2xl font-bold text-slate-800">{summaryData.totalActive}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><TrendingUp size={24} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400">THÂM NIÊN TRUNG BÌNH</p>
              <p className="text-2xl font-bold text-slate-800">{summaryData.avgSeniority} năm</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600"><PieChart size={24} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400">SỐ PHÒNG BAN</p>
              <p className="text-2xl font-bold text-slate-800">{summaryData.deptStats?.length || 0}</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-400">HĐ SẮP HẾT HẠN</p>
              <p className="text-2xl font-bold text-slate-800">{summaryData.expiringContracts?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phân bổ theo phòng ban */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Phân bổ nhân sự theo Phòng ban</h3>
            <div className="space-y-3">
              {(summaryData.deptStats || []).map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate mr-4">{d.department_name}</span>
                  <div className="flex items-center space-x-3 min-w-[180px]">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[120px]">
                      <div className="h-2.5 rounded-full bg-brand-500" style={{ width: `${Math.min(100, (d.count / (summaryData.totalActive || 1)) * 100)}%` }}></div>
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
                  {(summaryData.genderStats || []).map((g, i) => (
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
                  {(summaryData.statusStats || []).map((s, i) => (
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

  // Tab: KPI
  const renderKpi = () => {
    if (!kpiData) return null;
    const { kpiSummary, deptKpi, topPerformers, recordedCount, totalPayout } = kpiData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">SỐ THÁNG TỔNG HỢP</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{sortedActiveMonths.length} tháng</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{sortedActiveMonths.map(m => `T${m}`).join(', ')}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG NGÂN SÁCH KPI & HIỆU QUẢ</p>
            <p className="text-2xl font-bold text-brand-700 mt-1">{formatCurrency(totalPayout)} đ</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Tổng cộng qua {sortedActiveMonths.length} tháng đã chọn</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG SỐ LƯỢT ĐÁNH GIÁ</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{recordedCount || 0} lượt</p>
            <p className="text-[11px] text-slate-500 mt-0.5">57 nhân sự / tháng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI theo phòng ban */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Tổng Ngân Sách KPI & Hiệu Quả Theo Phòng Ban</h3>
            {deptKpi?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {(deptKpi || []).map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{d.department_name || 'Chưa phân bổ'}</p>
                      <p className="text-xs text-slate-500">{d.kpi_count} lượt • TB {formatCurrency(d.avg_score)} đ/lượt</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-brand-700">{formatCurrency(d.total_dept_payout)} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Performers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top Thưởng KPI & Hiệu Quả Cao Nhất ({sortedActiveMonths.length} Tháng)</h3>
            {topPerformers?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {(topPerformers || []).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'}`}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.fullname}</p>
                        <p className="text-xs text-slate-500">{p.department_name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-700">{formatCurrency(p.achieved_score)} đ</span>
                  </div>
                ))}
              </div>
            )}
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
          <h2 className="text-xl font-bold text-slate-800">Báo cáo & Thống kê HRM</h2>
          <p className="text-xs text-slate-500">Tổng hợp dữ liệu nhân sự, quỹ lương, chấm công và hiệu suất KPI</p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setExportSelectedMonths([...selectedMonths]);
              setExportYear(year);
              setShowExportModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:from-brand-800 hover:to-brand-950 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-emerald-300" />
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* ========================================================================= */}
      {/* BỘ LỌC CHỌN NHIỀU THÁNG / KHOẢNG THÁNG / PHÒNG BAN TRỰC TIẾP TRÊN TRANG */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Hàng 1: Chuyển đổi chế độ, Lọc phòng ban & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Chế độ xem tháng */}
            {activeTab !== 'summary' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chế độ xem:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setSelectionMode('multi')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectionMode === 'multi'
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chọn nhiều tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode('single')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectionMode === 'single'
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Xem 1 tháng
                  </button>
                </div>
              </div>
            )}

            {/* Lọc theo Phòng Ban */}
            <div className="flex items-center space-x-2 bg-brand-50/50 border border-brand-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <div className="p-1 rounded-md bg-brand-700 text-white">
                <Layers size={13} />
              </div>
              <span className="text-xs font-bold text-brand-900 whitespace-nowrap">Lọc phòng ban:</span>
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="text-xs font-bold text-brand-950 bg-white border border-brand-200 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:border-brand-400 transition"
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
                  className="text-brand-600 hover:text-red-600 p-1 rounded-md hover:bg-brand-100 transition"
                  title="Xóa bộ lọc phòng ban"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Mốc chọn nhanh */}
          {activeTab !== 'summary' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold mr-1">Mốc nhanh:</span>
              <button
                onClick={() => applyPreset(['1', '2', '3', '4', '5', '6', '7'])}
                className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                ✨ T1 – T7 (Dữ liệu HQ)
              </button>
              <button
                onClick={() => applyPreset(['1', '2', '3'])}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Quý 1 (T1-T3)
              </button>
              <button
                onClick={() => applyPreset(['4', '5', '6'])}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Quý 2 (T4-T6)
              </button>
              <button
                onClick={() => applyPreset(['7', '8', '9'])}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Quý 3 (T7-T9)
              </button>
              <button
                onClick={() => applyPreset(['1', '2', '3', '4', '5', '6'])}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                6T đầu năm
              </button>
              <button
                onClick={() => applyPreset(Array.from({ length: 12 }, (_, i) => (i + 1).toString()))}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Cả năm
              </button>
            </div>
          )}
        </div>

        {/* Hàng 2: Danh sách 12 Tháng chọn trực quan */}
        {activeTab !== 'summary' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 mr-1">Các tháng:</span>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center space-x-1 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-700/25 scale-102'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {selectionMode === 'multi' && (
                      isSelected ? <CheckSquare size={13} className="mr-0.5" /> : <Square size={13} className="mr-0.5 text-slate-400" />
                    )}
                    <span>Tháng {m < 10 ? `0${m}` : m}</span>
                    {hasDataHQ && !isSelected && (
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block ml-0.5" title="Có dữ liệu thưởng hiệu quả"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Export cho các tháng đang chọn */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => handleExportExcel({
                  reportType: activeTab === 'kpi' ? 'kpi' : activeTab === 'payroll' ? 'payroll' : activeTab === 'attendance' ? 'attendance' : 'all',
                  months: selectionMode === 'single' ? singleMonth : selectedMonths.join(','),
                  year: year,
                  department_id: selectedDepartment
                })}
                disabled={isExporting}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                title="Tải nhanh file Excel theo các tháng và phòng ban đang lọc"
              >
                <Download size={14} />
                <span>Tải Excel ({selectionMode === 'single' ? `T${singleMonth}` : `${sortedActiveMonths.length} tháng`}{selectedDeptObj ? ` - ${selectedDeptObj.name}` : ''})</span>
              </button>
            </div>
          </div>
        )}

        {/* Dòng trạng thái đang lọc */}
        <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-150">
          <div className="flex items-center space-x-2">
            <Sparkles size={15} className="text-brand-700 shrink-0" />
            <span>
              <strong>Đang xem:</strong> <span className="text-brand-800 font-bold">{displayRangeText}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-500">
            {selectionMode === 'multi' && activeTab !== 'summary' && (
              <span>(Click vào từng tháng để bật/tắt chọn)</span>
            )}
            {selectedDepartment && (
              <span className="bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-md border border-brand-200">
                Đang lọc: {selectedDeptObj?.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar + Year Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 flex-wrap">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-semibold transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-brand-700 border-b-2 border-brand-700 bg-brand-50/50'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Year selector */}
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-500">Năm</span>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none bg-slate-50"
              >
                {Array.from({ length: 12 }, (_, i) => 2024 + i).map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
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
