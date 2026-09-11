import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3, Users, DollarSign, Calendar, TrendingUp,
  PieChart, AlertTriangle, ArrowUp, ArrowDown, Download,
  FileSpreadsheet, CalendarRange, Check, X, ChevronDown,
  Layers, FileText, Sparkles, Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ReportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [kpiData, setKpiData] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('7');

  const [error, setError] = useState('');

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState('range'); // 'single' | 'range'
  const [exportSingleMonth, setExportSingleMonth] = useState(month);
  const [exportFromMonth, setExportFromMonth] = useState('1');
  const [exportToMonth, setExportToMonth] = useState('7');
  const [exportYear, setExportYear] = useState('2026');
  const [exportType, setExportType] = useState('all'); // 'all' | 'payroll' | 'kpi' | 'attendance' | 'summary'
  const [isExporting, setIsExporting] = useState(false);

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError('');
    try {
      switch (tab) {
        case 'summary': {
          const res = await api.get('/reports/summary');
          setSummaryData(res.data);
          break;
        }
        case 'payroll': {
          const res = await api.get(`/reports/payroll?year=${year}`);
          setPayrollData(res.data);
          break;
        }
        case 'attendance': {
          const res = await api.get(`/reports/attendance?month=${month}&year=${year}`);
          setAttendanceData(res.data);
          break;
        }
        case 'kpi': {
          const res = await api.get(`/reports/kpi?month=${month}&year=${year}`);
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

  useEffect(() => { fetchTabData(activeTab); }, [activeTab, year, month]);

  const formatCurrency = (val) => val ? Number(val).toLocaleString('vi-VN') : '0';

  const handleExportExcel = async (overrideParams = null) => {
    setIsExporting(true);
    try {
      let fromM = exportMode === 'single' ? exportSingleMonth : exportFromMonth;
      let toM = exportMode === 'single' ? exportSingleMonth : exportToMonth;
      let y = exportYear;
      let t = exportType;

      if (overrideParams) {
        if (overrideParams.fromMonth) fromM = overrideParams.fromMonth;
        if (overrideParams.toMonth) toM = overrideParams.toMonth;
        if (overrideParams.year) y = overrideParams.year;
        if (overrideParams.reportType) t = overrideParams.reportType;
      }

      // Đảm bảo fromM <= toM
      const startNum = parseInt(fromM, 10);
      const endNum = parseInt(toM, 10);
      const actualFrom = Math.min(startNum, endNum);
      const actualTo = Math.max(startNum, endNum);

      const response = await api.get(`/reports/export?fromMonth=${actualFrom}&toMonth=${actualTo}&year=${y}&reportType=${t}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      let typePrefix = 'Bao_Cao_Tong_Hop_Viet_A';
      if (t === 'payroll') typePrefix = 'Bang_Luong_Viet_A';
      else if (t === 'kpi') typePrefix = 'Bao_Cao_KPI_Viet_A';
      else if (t === 'attendance') typePrefix = 'Bao_Cao_Cham_Cong_Viet_A';
      else if (t === 'summary') typePrefix = 'Danh_Sach_Nhan_Su_Viet_A';

      const timeRange = actualFrom === actualTo
        ? `Thang${String(actualFrom).padStart(2, '0')}_${y}`
        : `Thang${String(actualFrom).padStart(2, '0')}_den_Thang${String(actualTo).padStart(2, '0')}_${y}`;

      link.setAttribute('download', `${typePrefix}_${timeRange}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
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
    { id: 'kpi', label: 'KPI', icon: TrendingUp }
  ];

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

        {/* Hợp đồng sắp hết hạn */}
        {summaryData.expiringContracts?.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>Hợp đồng sắp hết hạn (30 ngày tới)</span>
            </h3>
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-amber-600 font-bold uppercase">
                <tr>
                  <th className="py-2">Mã NV</th>
                  <th className="py-2">Họ tên</th>
                  <th className="py-2">Loại HĐ</th>
                  <th className="py-2">Ngày hết hạn</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.expiringContracts.map(c => (
                  <tr key={c.id} className="border-t border-amber-100">
                    <td className="py-2 font-bold text-amber-800">{c.employee_code}</td>
                    <td className="py-2 text-amber-900 font-medium">{c.fullname}</td>
                    <td className="py-2 text-amber-700">{c.type}</td>
                    <td className="py-2 text-amber-700 font-semibold">{new Date(c.end_date).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            <p className="text-xs font-semibold text-slate-400">TỔNG QUỸ LƯƠNG NĂM {year}</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(yearTotal?.total_net)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG LƯƠNG CƠ BẢN</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(yearTotal?.total_base)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG PHỤ CẤP</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(yearTotal?.total_allowances)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">SỐ PHIẾU LƯƠNG</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{yearTotal?.total_records || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quỹ lương theo tháng */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Quỹ lương theo tháng</h3>
              <button
                onClick={() => handleExportExcel({ reportType: 'payroll', fromMonth: '1', toMonth: '12', year })}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
              >
                <Download size={13} />
                <span>Xuất bảng lương cả năm</span>
              </button>
            </div>
            {monthlyPayroll?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu lương năm {year}</p>
            ) : (
              <div className="space-y-2">
                {(monthlyPayroll || []).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{m.month}</span>
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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top 5 lương cao nhất</h3>
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
                        <p className="text-xs text-slate-500">{s.department_name}</p>
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
            <p className="text-xs font-semibold text-slate-400">TỔNG NGÀY CÔNG</p>
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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Phân bổ trạng thái chấm công Tháng {month}/{year}</h3>
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
                <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu tháng {month}/{year}</p>
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
    const totalKpi = recordedCount || (kpiSummary?.reduce((s, k) => s + k.count, 0) || 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG NHÂN SỰ KPI THÁNG {month}/{year}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalKpi} nhân viên</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG NGÂN SÁCH KPI THỰC NHẬN</p>
            <p className="text-2xl font-bold text-brand-700 mt-1">{formatCurrency(totalPayout)} đ</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">ĐÃ THIẾT LẬP DỮ LIỆU</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{recordedCount || 0} / 57</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI theo phòng ban */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">KPI theo Phòng ban Tháng {month}/{year}</h3>
            {deptKpi?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {(deptKpi || []).map((d, i) => {
                  const pct = Math.round(d.avg_percent || 0);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{d.department_name || 'Chưa phân bổ'}</p>
                        <p className="text-xs text-slate-500">{d.kpi_count} KPI • TB {formatCurrency(d.avg_score)} đ</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 w-12 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Performers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top Thưởng KPI & Hiệu Quả Cao Nhất</h3>
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

        {/* Export action button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setExportSingleMonth(month);
              setExportYear(year);
              setShowExportModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-brand-700 to-brand-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:from-brand-800 hover:to-brand-950 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Quick Month Bar for Tabs requiring Month */}
      {(activeTab === 'attendance' || activeTab === 'kpi') && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Chọn Tháng:</span>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const mStr = m.toString();
              const isSelected = month === mStr;
              const hasData = [5, 6, 7, 9].includes(m);
              return (
                <button
                  key={m}
                  onClick={() => setMonth(mStr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isSelected
                      ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-700/20'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  Tháng {m < 10 ? `0${m}` : m}
                  {hasData && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportExcel({
                reportType: activeTab === 'kpi' ? 'kpi' : activeTab === 'attendance' ? 'attendance' : 'all',
                fromMonth: month,
                toMonth: month,
                year: year
              })}
              disabled={isExporting}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              title={`Tải file Excel Tháng ${month}/${year}`}
            >
              <Download size={14} />
              <span>Tải nhanh T{month}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs + Year Filter */}
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
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none bg-slate-50"
              >
                {[2024, 2025, 2026, 2027].map(y => (
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
      {/* MODAL XUẤT BÁO CÁO EXCEL CHỌN THÁNG / KHOẢNG THÁNG */}
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
                  <p className="text-xs text-white/80">Tùy chọn xuất theo từng tháng hoặc khoảng thời gian linh hoạt</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
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
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setExportMode('range')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      exportMode === 'range'
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-700/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarRange size={16} />
                    <span>Khoảng Tháng (Từ - Đến)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportMode('single')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      exportMode === 'single'
                        ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-700/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar size={16} />
                    <span>Một Tháng Cụ Thể</span>
                  </button>
                </div>

                {/* Preset nhanh */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Mốc nhanh:</span>
                  {[
                    { label: 'Từ T1 đến T7 (Có số liệu HQ)', from: '1', to: '7', mode: 'range' },
                    { label: 'Tháng 07', single: '7', mode: 'single' },
                    { label: 'Tháng 09', single: '9', mode: 'single' },
                    { label: 'Quý 1 (T1-T3)', from: '1', to: '3', mode: 'range' },
                    { label: 'Quý 2 (T4-T6)', from: '4', to: '6', mode: 'range' },
                    { label: 'Quý 3 (T7-T9)', from: '7', to: '9', mode: 'range' },
                    { label: 'Cả năm (T1-T12)', from: '1', to: '12', mode: 'range' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setExportMode(preset.mode);
                        if (preset.mode === 'range') {
                          setExportFromMonth(preset.from);
                          setExportToMonth(preset.to);
                        } else {
                          setExportSingleMonth(preset.single);
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Bộ chọn tháng chi tiết */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {exportMode === 'range' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">TỪ THÁNG</label>
                        <select
                          value={exportFromMonth}
                          onChange={e => setExportFromMonth(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-brand-700/20"
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
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-brand-700/20"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m.toString()}>Tháng {m < 10 ? `0${m}` : m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">NĂM</label>
                        <select
                          value={exportYear}
                          onChange={e => setExportYear(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-brand-700/20"
                        >
                          {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y.toString()}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">CHỌN THÁNG</label>
                        <select
                          value={exportSingleMonth}
                          onChange={e => setExportSingleMonth(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-brand-700/20"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m.toString()}>Tháng {m < 10 ? `0${m}` : m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">NĂM</label>
                        <select
                          value={exportYear}
                          onChange={e => setExportYear(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-brand-700/20"
                        >
                          {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y.toString()}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tóm tắt thông tin xuất */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-center space-x-3">
                <Sparkles size={20} className="text-emerald-700 shrink-0" />
                <div className="text-xs text-emerald-900 leading-snug">
                  <p className="font-bold">
                    File xuất: {exportMode === 'single'
                      ? `Tháng ${exportSingleMonth.padStart(2, '0')}/${exportYear}`
                      : `Từ Tháng ${exportFromMonth.padStart(2, '0')} đến Tháng ${exportToMonth.padStart(2, '0')}/${exportYear}`}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Định dạng file Microsoft Excel chuẩn (.xlsx) với dữ liệu được căn chỉnh cột, phân nhóm phòng ban và định dạng tiền tệ đẹp mắt.
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
