import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../services/api';
import {
  Calendar as CalendarIcon,
  Download,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck,
  Lock,
  ChevronDown,
  Info,
  Clock,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_OPTIONS = [
  { symbol: 'X', label: 'Đi làm (1 công)', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  { symbol: 'NN', label: 'Nửa ngày (0.5 công)', color: 'bg-amber-500 text-white hover:bg-amber-600' },
  { symbol: 'P', label: 'Phép năm (1 công)', color: 'bg-purple-600 text-white hover:bg-purple-700' },
  { symbol: 'KL', label: 'Nghỉ không lương (0 công)', color: 'bg-rose-600 text-white hover:bg-rose-700' },
  { symbol: 'CT', label: 'Công tác (1 công)', color: 'bg-sky-600 text-white hover:bg-sky-700' },
  { symbol: 'L', label: 'Nghỉ lễ (1 công)', color: 'bg-orange-600 text-white hover:bg-orange-700' },
  { symbol: 'OFF', label: 'Nghỉ tuần (0 công)', color: 'bg-slate-500 text-white hover:bg-slate-600' },
  { symbol: 'TS', label: 'Thai sản (0 công)', color: 'bg-pink-600 text-white hover:bg-pink-700' },
  { symbol: '', label: 'Xóa trắng ô', color: 'bg-slate-200 text-slate-700 hover:bg-slate-300' }
];

export default function TimesheetMatrixView({
  month,
  year,
  onMonthChange,
  onYearChange,
  onRefresh
}) {
  const { user } = useAuth();

  const [sheetsConfig, setSheetsConfig] = useState([]);
  const [activeSheetKey, setActiveSheetKey] = useState('van_phong');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [matrixData, setMatrixData] = useState([]);
  const [days, setDays] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [sheetInfo, setSheetInfo] = useState(null);

  // Lưu trữ các ô bị thay đổi trên client chưa save
  // Format: { [`${empId}_${day}`]: { employee_id, day, symbol, ot_hours, late_minutes } }
  const [dirtyChanges, setDirtyChanges] = useState({});
  const [showOtRows, setShowOtRows] = useState(true);

  // Modal / Popover chọn ký hiệu
  const [editingCell, setEditingCell] = useState(null); // { empId, day, rect, currentSymbol }

  const [notification, setNotification] = useState({ type: '', message: '' });

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  // 1. Tải danh sách sheets cấu hình
  useEffect(() => {
    api.get('/attendance/sheets-config')
      .then(res => {
        const sheets = res.data?.sheets || [];
        setSheetsConfig(sheets);
        // Chọn sheet đầu tiên mà user có quyền edit, nếu không thì lấy sheet đầu tiên
        const editable = sheets.find(s => s.canEdit);
        if (editable && !sheets.find(s => s.key === activeSheetKey)?.canEdit) {
          setActiveSheetKey(editable.key);
        }
      })
      .catch(err => {
        console.error('Lỗi tải sheets config:', err);
      });
  }, []);

  // 2. Tải ma trận dữ liệu của sheet đang chọn
  const fetchMatrix = async () => {
    setLoading(true);
    setDirtyChanges({});
    try {
      const res = await api.get('/attendance/sheet-matrix', {
        params: {
          month,
          year,
          sheet_key: activeSheetKey
        }
      });
      setMatrixData(res.data?.matrix || []);
      setDays(res.data?.days || []);
      setCanEdit(Boolean(res.data?.canEdit));
      setSheetInfo(res.data?.sheet || null);
    } catch (err) {
      showNotice('error', err.response?.data?.message || 'Lỗi tải dữ liệu bảng chấm công.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSheetKey) {
      fetchMatrix();
    }
  }, [activeSheetKey, month, year]);

  // Cập nhật ô dữ liệu (local state)
  const handleCellChange = (empId, day, newSymbol) => {
    if (!canEdit) return;

    setDirtyChanges(prev => {
      const key = `${empId}_${day}`;
      const existing = prev[key] || {};
      const baseRow = matrixData.find(m => m.employee_id === empId)?.days[day] || {};
      return {
        ...prev,
        [key]: {
          employee_id: empId,
          day,
          symbol: newSymbol,
          ot_hours: existing.ot_hours !== undefined ? existing.ot_hours : (baseRow.ot_hours || 0),
          cut_hours: existing.cut_hours !== undefined ? existing.cut_hours : (baseRow.cut_hours || 0),
          late_minutes: existing.late_minutes !== undefined ? existing.late_minutes : (baseRow.late_minutes || 0)
        }
      };
    });

    setEditingCell(null);
  };

  // Cập nhật số giờ tăng ca của ô
  const handleOtChange = (empId, day, otHours) => {
    if (!canEdit) return;
    const parsed = parseFloat(otHours) || 0;

    setDirtyChanges(prev => {
      const key = `${empId}_${day}`;
      const existing = prev[key] || {};
      const baseRow = matrixData.find(m => m.employee_id === empId)?.days[day] || {};
      const curSym = existing.symbol !== undefined ? existing.symbol : (baseRow.symbol || '');
      return {
        ...prev,
        [key]: {
          employee_id: empId,
          day,
          symbol: curSym,
          ot_hours: parsed,
          cut_hours: existing.cut_hours !== undefined ? existing.cut_hours : (baseRow.cut_hours || 0),
          late_minutes: existing.late_minutes !== undefined ? existing.late_minutes : (baseRow.late_minutes || 0)
        }
      };
    });
  };

  // Cập nhật số giờ cắt của ô
  const handleCutChange = (empId, day, cutHours) => {
    if (!canEdit) return;
    const parsed = parseFloat(cutHours) || 0;

    setDirtyChanges(prev => {
      const key = `${empId}_${day}`;
      const existing = prev[key] || {};
      const baseRow = matrixData.find(m => m.employee_id === empId)?.days[day] || {};
      const curSym = existing.symbol !== undefined ? existing.symbol : (baseRow.symbol || '');
      return {
        ...prev,
        [key]: {
          employee_id: empId,
          day,
          symbol: curSym,
          ot_hours: existing.ot_hours !== undefined ? existing.ot_hours : (baseRow.ot_hours || 0),
          cut_hours: parsed,
          late_minutes: existing.late_minutes !== undefined ? existing.late_minutes : (baseRow.late_minutes || 0)
        }
      };
    });
  };

  // Tính toán ma trận hiển thị (kết hợp dữ liệu gốc + thay đổi chưa lưu)
  const computedMatrix = useMemo(() => {
    return matrixData.map(row => {
      let workDays = 0;
      let paidLeaves = 0;
      let totalOt = 0;
      let totalCut = 0;

      const mergedDays = {};
      days.forEach(d => {
        const dirty = dirtyChanges[`${row.employee_id}_${d.day}`];
        const base = row.days[d.day] || { symbol: '', ot_hours: 0, cut_hours: 0, late_minutes: 0 };
        const sym = dirty && dirty.symbol !== undefined ? dirty.symbol : base.symbol;
        const ot = dirty && dirty.ot_hours !== undefined ? dirty.ot_hours : (base.ot_hours || 0);
        const cut = dirty && dirty.cut_hours !== undefined ? dirty.cut_hours : (base.cut_hours || 0);
        const late = dirty && dirty.late_minutes !== undefined ? dirty.late_minutes : (base.late_minutes || 0);

        mergedDays[d.day] = {
          symbol: sym,
          ot_hours: ot,
          cut_hours: cut,
          late_minutes: late,
          isDirty: Boolean(dirty)
        };

        if (sym === 'X' || sym === 'CT' || sym === 'L') {
          workDays += 1;
        } else if (sym === 'NN') {
          workDays += 0.5;
        }
        if (sym === 'P') {
          paidLeaves += 1;
        }
        totalOt += (Number(ot) || 0);
        totalCut += (Number(cut) || 0);
      });

      return {
        ...row,
        computedDays: mergedDays,
        computedSummary: {
          workDays: Number(workDays.toFixed(1)),
          paidLeaves,
          totalOt: Number(totalOt.toFixed(1)),
          totalCut: Number(totalCut.toFixed(1))
        }
      };
    });
  }, [matrixData, days, dirtyChanges]);

  // Lưu các thay đổi xuống CSDL lâu dài
  const handleSaveChanges = async () => {
    const updates = Object.values(dirtyChanges);
    if (updates.length === 0) {
      showNotice('info', 'Không có thay đổi nào cần lưu.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/attendance/save-sheet-matrix', {
        month,
        year,
        sheet_key: activeSheetKey,
        updates
      });
      showNotice('success', res.data?.message || 'Đã lưu dữ liệu chấm công thành công!');
      setDirtyChanges({});
      await fetchMatrix();
      if (onRefresh) onRefresh();
    } catch (err) {
      showNotice('error', err.response?.data?.message || 'Lỗi lưu bảng chấm công.');
    } finally {
      setSaving(false);
    }
  };

  // Điền nhanh T2 - T7 = X cho tất cả nhân viên trong sheet (trừ Chủ Nhật)
  const handleQuickFillWeekdays = () => {
    if (!canEdit) return;
    if (!window.confirm('Tự động điền ký hiệu "X" (đi làm) cho tất cả các ngày Thứ 2 đến Thứ 7 trong tháng này? (Chủ Nhật giữ nguyên)')) {
      return;
    }

    const newDirty = { ...dirtyChanges };
    computedMatrix.forEach(row => {
      days.forEach(d => {
        if (!d.isSunday) {
          const key = `${row.employee_id}_${d.day}`;
          newDirty[key] = {
            employee_id: row.employee_id,
            day: d.day,
            symbol: 'X',
            ot_hours: newDirty[key]?.ot_hours || row.computedDays[d.day]?.ot_hours || 0,
            late_minutes: newDirty[key]?.late_minutes || row.computedDays[d.day]?.late_minutes || 0
          };
        }
      });
    });

    setDirtyChanges(newDirty);
    showNotice('info', `Đã điền nhanh toàn bộ ngày làm việc. Vui lòng bấm "Lưu Chấm Công" để cập nhật.`);
  };

  // Xóa trắng toàn bộ các ô trong tháng của sheet
  const handleClearMonth = () => {
    if (!canEdit) return;
    if (!window.confirm('Bạn có chắc muốn XÓA TRẮNG tất cả các ô chấm công tháng này của bộ phận để chấm lại từ đầu?')) {
      return;
    }

    const newDirty = { ...dirtyChanges };
    computedMatrix.forEach(row => {
      days.forEach(d => {
        const key = `${row.employee_id}_${d.day}`;
        newDirty[key] = {
          employee_id: row.employee_id,
          day: d.day,
          symbol: '',
          ot_hours: 0,
          late_minutes: 0
        };
      });
    });

    setDirtyChanges(newDirty);
    showNotice('info', 'Đã xóa trắng các ô. Hãy bấm "Lưu Chấm Công" để xác nhận lưu.');
  };

  // Xuất file Excel chuẩn 100% Google Sheets
  const handleExportExcel = async (exportKey = activeSheetKey) => {
    setExporting(true);
    try {
      const response = await api.get('/attendance/export-excel', {
        params: {
          month,
          year,
          sheet_key: exportKey
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const title = exportKey === 'all' ? 'TOAN_CONG_TY_7_SHEETS' : (sheetInfo?.sheetName || exportKey).replace(/\s+/g, '_');
      link.setAttribute('download', `BANG_CHAM_CONG_${title}_T${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotice('success', 'Đã tải xuống file Excel chuẩn chấm công thành công!');
    } catch (err) {
      showNotice('error', 'Lỗi khi xuất file Excel.');
    } finally {
      setExporting(false);
    }
  };

  const dirtyCount = Object.keys(dirtyChanges).length;

  return (
    <div className="space-y-4">
      {/* Thông báo nổi */}
      {notification.message && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all animate-fadeIn ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : notification.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ═══ HÀNG 7 TABS BỘ PHẬN CHUẨN GOOGLE SHEETS ═══ */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet size={18} className="text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Bảng Chấm Công Theo Bộ Phận (Chuẩn Mẫu Bảng Tính)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            7 Sheet chuyên biệt theo từng kho & xưởng
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {sheetsConfig.map(sc => {
            const isActive = sc.key === activeSheetKey;
            return (
              <button
                key={sc.key}
                onClick={() => {
                  if (dirtyCount > 0 && !window.confirm('Bạn có thay đổi chưa lưu trên sheet hiện tại. Chuyển sheet sẽ làm mất thay đổi chưa lưu, tiếp tục?')) {
                    return;
                  }
                  setActiveSheetKey(sc.key);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-md shadow-brand-900/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{sc.sheetName}</span>
                {sc.canEdit ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Chấm công
                  </span>
                ) : (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                    isActive ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}>
                    Chỉ xem
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ BĂNG ĐIỀU HƯỚNG & PHÂN QUYỀN HIỆN TẠI ═══ */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Bên trái: Thông tin người phụ trách & quyền */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bộ chọn Tháng / Năm */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
            <CalendarIcon size={14} className="text-slate-500" />
            <span className="text-slate-500">Tháng:</span>
            <select
              value={month}
              onChange={e => onMonthChange(e.target.value)}
              className="bg-transparent font-black text-slate-800 outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m.toString()}>T{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-slate-300">/</span>
            <select
              value={year}
              onChange={e => onYearChange(e.target.value)}
              className="bg-transparent font-black text-slate-800 outline-none cursor-pointer"
            >
              {Array.from({ length: 5 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          {/* Phân quyền Badge */}
          {sheetInfo && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Người chấm được giao:</span>
              <span className="font-bold text-slate-900">{sheetInfo.managerName}</span>
              {canEdit ? (
                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  <ShieldCheck size={12} />
                  <span>Bạn có quyền chấm</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 bg-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full">
                  <Lock size={12} />
                  <span>Chỉ xem</span>
                </span>
              )}
            </div>
          )}

          {/* Toggle dòng tăng ca & cắt giờ */}
          <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-100">
            <input
              type="checkbox"
              checked={showOtRows}
              onChange={e => setShowOtRows(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span>Hiện hàng Tăng ca & Cắt giờ</span>
          </label>
        </div>

        {/* Bên phải: Nút thao tác (Lưu, Điền nhanh, Xuất Excel) */}
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <>
              {/* Nút điền nhanh */}
              <button
                onClick={handleQuickFillWeekdays}
                title="Tự động điền X cho các ngày làm việc T2 - T7"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Điền nhanh T2-T7 = X</span>
              </button>

              {/* Nút xóa trắng */}
              <button
                onClick={handleClearMonth}
                title="Xóa trắng toàn bộ ô tháng này"
                className="p-1.5 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>

              {/* Nút Lưu chấm công (Primary) */}
              <button
                onClick={handleSaveChanges}
                disabled={saving || dirtyCount === 0}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer ${
                  dirtyCount > 0
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30 ring-2 ring-emerald-500 animate-pulse'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Save size={15} />
                <span>Lưu Chấm Công {dirtyCount > 0 ? `(${dirtyCount} ô)` : ''}</span>
              </button>
            </>
          )}

          {/* Menu Xuất Excel */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleExportExcel(activeSheetKey)}
              disabled={exporting}
              title="Xuất riêng sheet đang xem"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Xuất Sheet này</span>
            </button>

            <button
              onClick={() => handleExportExcel('all')}
              disabled={exporting}
              title="Xuất đầy đủ 7 sheets toàn bộ công ty"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>Xuất Full 7 Sheets</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ BẢNG MA TRẬN CHẤM CÔNG (GRID SPREADSHEET) ═══ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-200 border-t-brand-700"></div>
            <p className="mt-3 text-xs text-slate-500 font-semibold">Đang tải ma trận chấm công [{sheetInfo?.name || activeSheetKey}]...</p>
          </div>
        ) : computedMatrix.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Chưa có nhân viên nào thuộc bộ phận này trong hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[72vh] scrollbar-thin">
            <table className="w-full text-xs border-collapse relative min-w-max table-auto">
              {/* Header dòng: Thứ và Ngày */}
              <thead className="sticky top-0 z-20 bg-slate-100 shadow-xs">
                <tr className="border-b border-slate-200 text-slate-700 font-bold text-[10px]">
                  <th className="p-1 text-center w-7 border-r border-slate-200 bg-slate-100">STT</th>
                  <th className="p-1 text-left w-16 border-r border-slate-200 bg-slate-100 font-mono">Mã NV</th>
                  <th className="p-1 text-left w-36 border-r border-slate-200 bg-slate-100">Họ và Tên</th>
                  <th className="p-1 text-left w-24 border-r border-slate-200 bg-slate-100 text-slate-500">Chức vụ</th>

                  {/* 31 Cột Ngày (kèm Thứ) */}
                  {days.map(d => (
                    <th
                      key={d.day}
                      className={`p-0.5 text-center w-[25px] min-w-[25px] max-w-[25px] border-r border-slate-200 ${
                        d.isSunday ? 'bg-amber-100/90 text-amber-900 font-black' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="text-[9px] uppercase leading-none">{d.dow}</div>
                      <div className="text-[10px] font-black leading-tight mt-0.5">{d.day}</div>
                    </th>
                  ))}

                  {/* Cột tổng kết (Nằm ngay sau ngày 31, không bị đè che) */}
                  <th className="bg-emerald-100/90 text-emerald-950 p-1 text-right w-16 border-l border-r border-slate-200 font-black text-[10px] whitespace-nowrap">
                    CÔNG TT
                  </th>
                  <th className="bg-purple-100/90 text-purple-950 p-1 text-center w-12 border-r border-slate-200 font-black text-[10px] whitespace-nowrap">
                    PHÉP
                  </th>
                  <th className="bg-indigo-100/90 text-indigo-950 p-1 text-right w-14 border-r border-slate-200 font-black text-[10px] whitespace-nowrap">
                    TĂNG CA (h)
                  </th>
                  <th className="bg-rose-100/90 text-rose-950 p-1 text-right w-14 font-black text-[10px] whitespace-nowrap">
                    CẮT GIỜ (h)
                  </th>
                </tr>
              </thead>

              {/* Dữ liệu từng nhân viên */}
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {computedMatrix.map(row => {
                  const isLeaveWarning = row.computedSummary.paidLeaves > 2;

                  return (
                    <React.Fragment key={row.employee_id}>
                      {/* Dòng chấm công chính */}
                      <tr className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-1 text-center font-bold text-slate-500 border-r border-slate-200 text-[10px]">
                          {row.stt}
                        </td>
                        <td className="p-1 font-mono font-bold text-slate-700 border-r border-slate-200 text-[10px] whitespace-nowrap">
                          {row.code}
                        </td>
                        <td className="p-1 font-bold text-slate-900 border-r border-slate-200 truncate max-w-[160px] text-[11px]">
                          {row.fullname}
                        </td>
                        <td className="p-1 text-slate-500 border-r border-slate-200 truncate max-w-[110px] text-[10px]">
                          {row.position_name || '-'}
                        </td>

                        {/* Ô ngày 1..31 */}
                        {days.map(d => {
                          const cell = row.computedDays[d.day] || {};
                          const sym = cell.symbol;
                          const isDirty = cell.isDirty;

                          // Màu sắc ký hiệu
                          let badgeClass = 'text-slate-300';
                          if (sym === 'X') badgeClass = 'bg-emerald-100 text-emerald-900 font-black border border-emerald-300';
                          else if (sym === 'NN') badgeClass = 'bg-amber-100 text-amber-900 font-black border border-amber-300';
                          else if (sym === 'P') badgeClass = 'bg-purple-100 text-purple-900 font-black border border-purple-300';
                          else if (sym === 'KL') badgeClass = 'bg-rose-100 text-rose-900 font-black border border-rose-300';
                          else if (sym === 'CT') badgeClass = 'bg-sky-100 text-sky-900 font-black border border-sky-300';
                          else if (sym === 'L') badgeClass = 'bg-orange-100 text-orange-900 font-black border border-orange-300';
                          else if (sym === 'OFF') badgeClass = 'bg-slate-100 text-slate-600 font-bold border border-slate-300';
                          else if (sym === 'TS') badgeClass = 'bg-pink-100 text-pink-900 font-black border border-pink-300';

                          return (
                            <td
                              key={d.day}
                              onClick={e => {
                                if (!canEdit) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                setEditingCell({
                                  empId: row.employee_id,
                                  empName: row.fullname,
                                  day: d.day,
                                  dow: d.dow,
                                  currentSymbol: sym,
                                  rect
                                });
                              }}
                              className={`p-0 text-center w-[25px] min-w-[25px] max-w-[25px] border-r border-slate-200 relative select-none ${
                                d.isSunday ? 'bg-amber-50/40' : ''
                              } ${
                                canEdit ? 'cursor-pointer hover:bg-brand-50' : ''
                              } ${
                                isDirty ? 'bg-blue-50/70 ring-1 ring-blue-400' : ''
                              }`}
                            >
                              <div className={`w-[22px] h-[22px] mx-auto rounded flex items-center justify-center text-[10px] transition-transform ${badgeClass}`}>
                                {sym || '·'}
                              </div>
                              {isDirty && (
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              )}
                            </td>
                          );
                        })}

                        {/* Cột CÔNG THỰC TẾ */}
                        <td className="bg-emerald-50/70 group-hover:bg-emerald-100/70 p-1 text-right font-black text-emerald-900 border-l border-r border-slate-200 text-xs whitespace-nowrap">
                          {row.computedSummary.workDays}
                        </td>

                        {/* Cột PHÉP NĂM */}
                        <td className={`p-1 text-center font-black border-r border-slate-200 text-xs whitespace-nowrap ${
                          isLeaveWarning
                            ? 'bg-amber-100/90 text-amber-900 ring-1 ring-amber-400'
                            : 'bg-purple-50/70 group-hover:bg-purple-100/70 text-purple-900'
                        }`}>
                          <div className="flex items-center justify-center space-x-0.5">
                            <span>{row.computedSummary.paidLeaves}</span>
                            {isLeaveWarning && (
                              <span title="Vượt quá quy định nội bộ (tối đa 2 ngày phép/tháng)" className="text-amber-700 text-[10px]">⚠️</span>
                            )}
                          </div>
                        </td>

                        {/* Cột TĂNG CA */}
                        <td className="bg-indigo-50/70 group-hover:bg-indigo-100/70 p-1 text-right font-black text-indigo-900 text-xs whitespace-nowrap border-r border-slate-200">
                          {row.computedSummary.totalOt > 0 ? `${row.computedSummary.totalOt}h` : '-'}
                        </td>

                        {/* Cột CẮT GIỜ */}
                        <td className="bg-rose-50/70 group-hover:bg-rose-100/70 p-1 text-right font-black text-rose-900 text-xs whitespace-nowrap">
                          {row.computedSummary.totalCut > 0 ? `-${row.computedSummary.totalCut}h` : '-'}
                        </td>
                      </tr>

                      {/* Dòng Tăng ca (khi bật toggle) */}
                      {showOtRows && (
                        <tr className="bg-indigo-50/20 hover:bg-indigo-50/40 text-[10px] text-slate-500 border-b border-indigo-100/40">
                          <td className="border-r border-slate-200"></td>
                          <td className="border-r border-slate-200"></td>
                          <td className="p-0.5 font-bold text-indigo-700 border-r border-slate-200 truncate text-[10px]">
                            ↳ Tăng ca (giờ)
                          </td>
                          <td className="p-0.5 border-r border-slate-200 text-indigo-600 text-[9px] italic">Làm thêm</td>

                          {days.map(d => {
                            const curOt = row.computedDays[d.day]?.ot_hours || 0;
                            return (
                              <td key={d.day} className="p-0 text-center border-r border-slate-200 w-[25px]">
                                {canEdit ? (
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="12"
                                    value={curOt > 0 ? curOt : ''}
                                    placeholder="-"
                                    onChange={e => handleOtChange(row.employee_id, d.day, e.target.value)}
                                    className="w-[23px] h-[18px] text-center text-[9px] font-bold text-indigo-900 bg-white border border-indigo-200 rounded outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 p-0"
                                  />
                                ) : (
                                  <span className="font-bold text-indigo-800 text-[9px]">{curOt > 0 ? curOt : '-'}</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="border-l border-r border-slate-200 bg-emerald-50/30"></td>
                          <td className="border-r border-slate-200 bg-purple-50/30"></td>
                          <td className="p-1 text-right font-black text-indigo-900 bg-indigo-100/60 border-r border-slate-200 text-xs whitespace-nowrap">
                            {row.computedSummary.totalOt > 0 ? `${row.computedSummary.totalOt}h` : '-'}
                          </td>
                          <td className="bg-rose-50/30"></td>
                        </tr>
                      )}

                      {/* Dòng Cắt giờ (khi bật toggle) */}
                      {showOtRows && (
                        <tr className="bg-rose-50/20 hover:bg-rose-50/40 text-[10px] text-slate-500 border-b border-rose-100/60">
                          <td className="border-r border-slate-200"></td>
                          <td className="border-r border-slate-200"></td>
                          <td className="p-0.5 font-bold text-rose-700 border-r border-slate-200 truncate text-[10px]">
                            ↳ Cắt giờ (giờ)
                          </td>
                          <td className="p-0.5 border-r border-slate-200 text-rose-600 text-[9px] italic">Trừ giờ</td>

                          {days.map(d => {
                            const curCut = row.computedDays[d.day]?.cut_hours || 0;
                            return (
                              <td key={d.day} className="p-0 text-center border-r border-slate-200 w-[25px]">
                                {canEdit ? (
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="12"
                                    value={curCut > 0 ? curCut : ''}
                                    placeholder="-"
                                    onChange={e => handleCutChange(row.employee_id, d.day, e.target.value)}
                                    className="w-[23px] h-[18px] text-center text-[9px] font-bold text-rose-900 bg-white border border-rose-200 rounded outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500 p-0"
                                  />
                                ) : (
                                  <span className="font-bold text-rose-800 text-[9px]">{curCut > 0 ? `-${curCut}` : '-'}</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="border-l border-r border-slate-200 bg-emerald-50/30"></td>
                          <td className="border-r border-slate-200 bg-purple-50/30"></td>
                          <td className="border-r border-slate-200 bg-indigo-50/30"></td>
                          <td className="p-1 text-right font-black text-rose-900 bg-rose-100/60 text-xs whitespace-nowrap">
                            {row.computedSummary.totalCut > 0 ? `-${row.computedSummary.totalCut}h` : '-'}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ POPOVER CHỌN KÝ HIỆU CHẤM CÔNG NHANH ═══ */}
      {editingCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingCell(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{editingCell.empName}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Chấm công Ngày {editingCell.day} ({editingCell.dow}) - Tháng {month}/{year}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(opt => {
                const isSelected = editingCell.currentSymbol === opt.symbol;
                return (
                  <button
                    key={opt.symbol || 'empty'}
                    onClick={() => handleCellChange(editingCell.empId, editingCell.day, opt.symbol)}
                    className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 font-black shadow-xs ${opt.color}`}>
                      {opt.symbol || '✕'}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BẢNG CHÚ GIẢI KÝ HIỆU CHẤM CÔNG CHUẨN NỆM VIỆT Á ═══ */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center space-x-2 mb-2 text-slate-800 font-bold">
          <Info size={15} className="text-brand-700" />
          <span>QUY ĐỊNH KÝ HIỆU & CÁCH TÍNH CÔNG (CHUẨN THEO DÕI NỆM VIỆT Á)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px]">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-emerald-600 text-white rounded font-black flex items-center justify-center">X</span>
            <span><strong>Đi làm cả ngày</strong> (+1 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-amber-500 text-white rounded font-black flex items-center justify-center">NN</span>
            <span><strong>Làm nửa ngày</strong> (+0.5 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-purple-600 text-white rounded font-black flex items-center justify-center">P</span>
            <span><strong>Phép năm</strong> (Tối đa 2 ngày/tháng)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-rose-600 text-white rounded font-black flex items-center justify-center">KL</span>
            <span><strong>Nghỉ không lương</strong> (0 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-sky-600 text-white rounded font-black flex items-center justify-center">CT</span>
            <span><strong>Công tác ngoài</strong> (+1 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-orange-600 text-white rounded font-black flex items-center justify-center">L</span>
            <span><strong>Nghỉ lễ hưởng lương</strong> (+1 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-slate-500 text-white rounded font-black flex items-center justify-center">OFF</span>
            <span><strong>Nghỉ tuần</strong> (0 công)</span>
          </div>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200/80">
            <span className="w-5 h-5 bg-pink-600 text-white rounded font-black flex items-center justify-center">TS</span>
            <span><strong>Nghỉ thai sản</strong> (0 công)</span>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] text-slate-500 italic">
          * Lưu ý: Cột "CÔNG THỰC TẾ" tự động tính tổng (X + CT + L + NN*0.5). Cảnh báo &gt;2 ngày phép/tháng là giới hạn theo dõi nội bộ của công ty. Mọi dữ liệu được lưu vĩnh viễn trong CSDL và có thể xuất ra file Excel bất kỳ lúc nào.
        </p>
      </div>
    </div>
  );
}
