import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Users, DollarSign, Calendar, TrendingUp, PieChart, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());

  const [error, setError] = useState('');

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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Quỹ lương theo tháng</h3>
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
    const { kpiSummary, deptKpi, topPerformers } = kpiData;
    const totalKpi = kpiSummary?.reduce((s, k) => s + k.count, 0) || 0;
    const avgScore = kpiSummary?.reduce((s, k) => s + (k.avg_percent || 0) * k.count, 0) / (totalKpi || 1);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">TỔNG KPI THÁNG {month}/{year}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalKpi}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">ĐIỂM TRUNG BÌNH</p>
            <p className="text-2xl font-bold text-brand-700 mt-1">{Math.round(avgScore)}%</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">ĐÃ ĐÁNH GIÁ</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{kpiSummary?.find(k => k.status === 'Đã đánh giá')?.count || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI theo phòng ban */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">KPI theo Phòng ban</h3>
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
                        <p className="text-xs text-slate-500">{d.kpi_count} KPI</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Top Performers</h3>
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
                    <span className={`text-sm font-bold ${p.percent >= 100 ? 'text-emerald-600' : 'text-brand-700'}`}>{p.percent}%</span>
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
      <div>
        <h2 className="text-xl font-bold text-slate-800">Báo cáo & Thống kê HRM</h2>
        <p className="text-xs text-slate-500">Tổng hợp dữ liệu nhân sự, quỹ lương, chấm công và hiệu suất KPI</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Tabs + Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 flex-wrap">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-semibold transition-colors flex items-center space-x-2 ${activeTab === tab.id ? 'text-brand-700 border-b-2 border-brand-700 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          {/* Year/Month filter */}
          {activeTab !== 'summary' && (
            <div className="flex items-center space-x-3 px-4 py-2">
              {(activeTab === 'attendance' || activeTab === 'kpi') && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-semibold text-slate-500">Tháng</span>
                  <select value={month} onChange={e => setMonth(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-xs outline-none">
                    {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold text-slate-500">Năm</span>
                <select value={year} onChange={e => setYear(e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-xs outline-none">
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
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
    </div>
  );
};

export default ReportPage;
