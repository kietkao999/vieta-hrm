import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Award,
  DollarSign,
  Users,
  BarChart3,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Sparkles,
  Printer
} from 'lucide-react';
import { KPI_PERFORMANCE_DATA, calculateSummaryStats } from '../../data/kpiPerformanceData';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatShortCurrency = (val) => {
  if (!val) return '0 đ';
  if (val >= 1000000000) return (val / 1000000000).toFixed(2) + ' Tỷ';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr';
  return Number(val).toLocaleString('vi-VN') + ' đ';
};

const formatNumber = (val) => {
  return new Intl.NumberFormat('vi-VN').format(val || 0);
};

const KpiPerformanceReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'kpi', 'hq'
  const [sortField, setSortField] = useState('stt');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Summary stats
  const stats = useMemo(() => calculateSummaryStats(KPI_PERFORMANCE_DATA), []);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(KPI_PERFORMANCE_DATA.map(d => d.department).filter(Boolean));
    return Array.from(set).sort();
  }, []);

  // Filtered and Sorted Data
  const processedData = useMemo(() => {
    let result = [...KPI_PERFORMANCE_DATA];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(item =>
        (item.hoTen && item.hoTen.toLowerCase().includes(q)) ||
        (item.maNV && item.maNV.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q))
      );
    }

    // Department filter
    if (selectedDept !== 'ALL') {
      result = result.filter(item => item.department === selectedDept);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [searchTerm, selectedDept, sortField, sortOrder]);

  // Handle Sort Change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    return processedData.reduce(
      (acc, item) => {
        acc.kpiT5 += item.kpiT5 || 0;
        acc.kpiT6 += item.kpiT6 || 0;
        acc.kpiT7 += item.kpiT7 || 0;
        acc.tongKPI += item.tongKPI || 0;

        acc.hqT1 += item.hqT1 || 0;
        acc.hqT2 += item.hqT2 || 0;
        acc.hqT3 += item.hqT3 || 0;
        acc.hqT4 += item.hqT4 || 0;
        acc.hqT5 += item.hqT5 || 0;
        acc.hqT6 += item.hqT6 || 0;
        acc.hqT7 += item.hqT7 || 0;
        acc.tongHQ += item.tongHQ || 0;

        acc.tongCong += item.tongCong || 0;
        return acc;
      },
      {
        kpiT5: 0, kpiT6: 0, kpiT7: 0, tongKPI: 0,
        hqT1: 0, hqT2: 0, hqT3: 0, hqT4: 0, hqT5: 0, hqT6: 0, hqT7: 0, tongHQ: 0,
        tongCong: 0
      }
    );
  }, [processedData]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã NV',
      'Họ và Tên',
      'Phòng ban',
      'KPI T5',
      'KPI T6',
      'KPI T7',
      'Tổng KPI',
      'HQ T1',
      'HQ T2',
      'HQ T3',
      'HQ T4',
      'HQ T5',
      'HQ T6',
      'HQ T7',
      'Tổng HQ',
      'Tổng Cộng'
    ];

    const rows = processedData.map(item => [
      item.stt,
      `"${item.maNV || ''}"`,
      `"${item.hoTen || ''}"`,
      `"${item.department || ''}"`,
      item.kpiT5 || 0,
      item.kpiT6 || 0,
      item.kpiT7 || 0,
      item.tongKPI || 0,
      item.hqT1 || 0,
      item.hqT2 || 0,
      item.hqT3 || 0,
      item.hqT4 || 0,
      item.hqT5 || 0,
      item.hqT6 || 0,
      item.hqT7 || 0,
      item.tongHQ || 0,
      item.tongCong || 0
    ]);

    // Add total row
    rows.push([
      'TỔNG CỘNG',
      '',
      '',
      '',
      filteredTotals.kpiT5,
      filteredTotals.kpiT6,
      filteredTotals.kpiT7,
      filteredTotals.tongKPI,
      filteredTotals.hqT1,
      filteredTotals.hqT2,
      filteredTotals.hqT3,
      filteredTotals.hqT4,
      filteredTotals.hqT5,
      filteredTotals.hqT6,
      filteredTotals.hqT7,
      filteredTotals.tongHQ,
      filteredTotals.tongCong
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_KPI_Hieu_Qua_T1-T7_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find maximum monthly HQ for relative bar height
  const maxMonthlyHQ = Math.max(...stats.monthlyHQStats.map(m => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <Sparkles size={14} className="text-amber-300" />
              <span>DỮ LIỆU TỔNG HỢP 7 THÁNG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Báo Cáo Tổng Hợp KPI & Thưởng Hiệu Quả
            </h2>
            <p className="text-sm text-blue-200/90 leading-relaxed">
              Theo dõi chi tiết 63 nhân sự, phân bổ KPI trách nhiệm (T5 – T7) và thưởng năng suất hiệu quả (T1 – T7) trên toàn hệ thống Nệm Việt Á.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Download size={16} />
              <span>Xuất Báo Cáo Excel/CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all active:scale-95"
            >
              <Printer size={16} />
              <span>In / Lưu PDF</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng cộng chi trả */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Chi Trả (KPI + HQ)</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(stats.totalPayout)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-indigo-600 mr-1.5">{stats.totalEmployees} nhân sự</span>
            <span>được ghi nhận trong kỳ</span>
          </div>
        </div>

        {/* Card 2: Tổng Thưởng Hiệu Quả */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Thưởng Hiệu Quả</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(stats.totalHQ)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-emerald-700 mr-1">7 tháng (T1 - T7)</span>
            <span>• Chiếm {Math.round((stats.totalHQ / stats.totalPayout) * 100)}% tổng quỹ</span>
          </div>
        </div>

        {/* Card 3: Tổng KPI Trách Nhiệm */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng KPI Trách Nhiệm</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {formatCurrency(stats.totalKPI)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-amber-700 mr-1">3 tháng (T5 - T7)</span>
            <span>• Chiếm {Math.round((stats.totalKPI / stats.totalPayout) * 100)}% tổng quỹ</span>
          </div>
        </div>

        {/* Card 4: Bình quân / Nhân sự */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bình Quân / Nhân Sự</span>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-violet-600 tracking-tight">
            {formatCurrency(stats.avgPayout)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>Thu nhập bổ sung trung bình</span>
          </div>
        </div>
      </div>

      {/* Middle Analytics: Monthly Trend */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600" />
              Diễn Biến Quỹ Thưởng Hiệu Quả 7 Tháng (T1 - T7 / 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-1">Tổng giá trị chi trả hiệu quả công việc từng tháng trên toàn công ty</p>
          </div>
          <div className="text-xs text-slate-500">
            Tổng 7 tháng: <strong className="text-emerald-600 font-black text-sm">{formatCurrency(stats.totalHQ)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-6 pb-2 border-b border-slate-100">
          {stats.monthlyHQStats.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.total / maxMonthlyHQ) * 100));
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[11px] font-bold text-slate-700 opacity-80 group-hover:opacity-100 mb-1.5 text-center whitespace-nowrap">
                  {formatShortCurrency(item.total)}
                </div>
                <div className="w-full max-w-[64px] bg-slate-100 rounded-t-xl relative overflow-hidden flex items-end justify-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 via-indigo-600 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                  />
                </div>
                <div className="text-xs font-bold text-slate-700 mt-2.5 text-center">
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>* Tháng cao điểm nhất: <strong className="text-slate-800">Tháng 1 ({formatCurrency(stats.monthlyHQStats[0]?.total)})</strong></span>
          <span>Bình quân mỗi tháng: <strong className="text-indigo-600">{formatCurrency(Math.round(stats.totalHQ / 7))} / tháng</strong></span>
        </div>
      </div>

      {/* Main Interactive Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã NV, họ tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Tất cả phòng ban ({KPI_PERFORMANCE_DATA.length})</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Hiển thị:</span>
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'all' ? 'bg-white text-indigo-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả (KPI & HQ)
              </button>
              <button
                onClick={() => setViewMode('hq')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'hq' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hiệu Quả (T1 - T7)
              </button>
              <button
                onClick={() => setViewMode('kpi')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'kpi' ? 'bg-white text-amber-700 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KPI (T5 - T7)
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-3 text-center w-12 sticky left-0 bg-slate-100 z-10">STT</th>
                <th
                  onClick={() => handleSort('maNV')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã NV</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('hoTen')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Họ và Tên</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-slate-500 min-w-[140px]">Phòng Ban</th>

                {/* KPI Columns */}
                {(viewMode === 'all' || viewMode === 'kpi') && (
                  <>
                    <th className="py-3 px-2 text-right bg-amber-50/50 text-amber-900 font-semibold border-l border-amber-200/40">KPI T5</th>
                    <th className="py-3 px-2 text-right bg-amber-50/50 text-amber-900 font-semibold">KPI T6</th>
                    <th className="py-3 px-2 text-right bg-amber-50/50 text-amber-900 font-semibold">KPI T7</th>
                    <th
                      onClick={() => handleSort('tongKPI')}
                      className="py-3 px-3 text-right bg-amber-100/70 text-amber-950 font-black cursor-pointer hover:bg-amber-200/70 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Tổng KPI</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                  </>
                )}

                {/* HQ Columns */}
                {(viewMode === 'all' || viewMode === 'hq') && (
                  <>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold border-l border-emerald-200/40">HQ T1</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T2</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T3</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T4</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T5</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T6</th>
                    <th className="py-3 px-2 text-right bg-emerald-50/40 text-emerald-900 font-semibold">HQ T7</th>
                    <th
                      onClick={() => handleSort('tongHQ')}
                      className="py-3 px-3 text-right bg-emerald-100/70 text-emerald-950 font-black cursor-pointer hover:bg-emerald-200/70 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Tổng HQ</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                  </>
                )}

                {/* Grand Total */}
                <th
                  onClick={() => handleSort('tongCong')}
                  className="py-3 px-4 text-right bg-indigo-900 text-white font-black cursor-pointer hover:bg-indigo-800 transition-colors sticky right-0 z-10"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>TỔNG CỘNG</span>
                    <ArrowUpDown size={12} className="text-indigo-300" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {processedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium sticky left-0 bg-white group-hover:bg-slate-50">
                    {item.stt}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-600">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[11px]">
                      {item.maNV || '---'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">
                    {item.hoTen}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[160px]">
                    {item.department || '---'}
                  </td>

                  {/* KPI Values */}
                  {(viewMode === 'all' || viewMode === 'kpi') && (
                    <>
                      <td className="py-2.5 px-2 text-right text-slate-600 border-l border-amber-100/50">
                        {item.kpiT5 ? formatNumber(item.kpiT5) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.kpiT6 ? formatNumber(item.kpiT6) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.kpiT7 ? formatNumber(item.kpiT7) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-800 bg-amber-50/40">
                        {item.tongKPI ? formatNumber(item.tongKPI) : '0'}
                      </td>
                    </>
                  )}

                  {/* HQ Values */}
                  {(viewMode === 'all' || viewMode === 'hq') && (
                    <>
                      <td className="py-2.5 px-2 text-right text-slate-600 border-l border-emerald-100/50">
                        {item.hqT1 ? formatNumber(item.hqT1) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT2 ? formatNumber(item.hqT2) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT3 ? formatNumber(item.hqT3) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT4 ? formatNumber(item.hqT4) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT5 ? formatNumber(item.hqT5) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT6 ? formatNumber(item.hqT6) : '-'}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-600">
                        {item.hqT7 ? formatNumber(item.hqT7) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800 bg-emerald-50/40">
                        {item.tongHQ ? formatNumber(item.tongHQ) : '0'}
                      </td>
                    </>
                  )}

                  {/* Grand Total */}
                  <td className="py-2.5 px-4 text-right font-black text-indigo-900 bg-indigo-50/60 sticky right-0">
                    {formatNumber(item.tongCong)}
                  </td>
                </tr>
              ))}

              {processedData.length === 0 && (
                <tr>
                  <td colSpan={17} className="py-8 text-center text-slate-400 font-medium">
                    Không tìm thấy nhân sự nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer with Summary Row */}
            {processedData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td colSpan={4} className="py-3.5 px-4 text-left font-black tracking-wide uppercase sticky left-0 bg-slate-900 z-10">
                    TỔNG CỘNG ({processedData.length} nhân sự)
                  </td>

                  {/* KPI Totals */}
                  {(viewMode === 'all' || viewMode === 'kpi') && (
                    <>
                      <td className="py-3.5 px-2 text-right font-semibold text-amber-200">
                        {formatShortCurrency(filteredTotals.kpiT5)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-amber-200">
                        {formatShortCurrency(filteredTotals.kpiT6)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-amber-200">
                        {formatShortCurrency(filteredTotals.kpiT7)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-amber-300 bg-slate-800">
                        {formatShortCurrency(filteredTotals.tongKPI)}
                      </td>
                    </>
                  )}

                  {/* HQ Totals */}
                  {(viewMode === 'all' || viewMode === 'hq') && (
                    <>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT1)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT2)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT3)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT4)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT5)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT6)}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-200">
                        {formatShortCurrency(filteredTotals.hqT7)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-300 bg-slate-800">
                        {formatShortCurrency(filteredTotals.tongHQ)}
                      </td>
                    </>
                  )}

                  {/* Grand Total */}
                  <td className="py-3.5 px-4 text-right font-black text-white bg-indigo-700 sticky right-0">
                    {formatCurrency(filteredTotals.tongCong)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default KpiPerformanceReport;
