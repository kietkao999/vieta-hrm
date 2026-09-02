import React from 'react';
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
  CheckCircle2
} from 'lucide-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all animate-in fade-in zoom-in-95 my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Chi Tiết Hồ Sơ Nhân Sự</h3>
              <p className="text-xs text-slate-300 font-mono">
                {employee.code} • {employee.fullname}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Hero Profile Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-5 border border-slate-200/80 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-700 to-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-md border-2 border-white flex-shrink-0">
                {employee.fullname ? employee.fullname.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-xl font-extrabold text-slate-900">{employee.fullname}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(employee.status)}`}>
                    {employee.status || 'Đang làm việc'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {employee.position_name || 'Chức vụ chưa đặt'}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">
                    {employee.department_name || 'Chưa phân bổ phòng ban'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-500">
                    {employee.branch_name || 'Công ty Nệm Việt Á'}
                  </span>
                </div>
                <div className="pt-1 flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-500">
                  <Clock size={13} className="text-blue-600" />
                  <span>Thâm niên công tác: <strong className="text-blue-800 font-bold">{seniority}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick KPI Badge */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-3 border border-slate-200/70 shadow-sm text-right min-w-[170px] self-stretch md:self-auto flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Thưởng KPI Trách nhiệm
              </span>
              <span className="text-lg font-black text-brand-700">
                {formatCurrency(employee.kpi_bonus)}
              </span>
              {employee.tier && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block text-center border border-blue-200">
                  {employee.tier}
                </span>
              )}
            </div>
          </div>

          {/* 3 Main Information Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* NHÓM 1: Thông tin cơ bản & Cá nhân */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 text-brand-800 font-bold text-sm">
                <User size={17} className="text-brand-600" />
                <span>1. Thông tin cá nhân</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Mã nhân sự</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{employee.code}</span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Họ và tên</span>
                  <span className="font-bold text-slate-800 text-sm">{employee.fullname}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Giới tính</span>
                    <span className="font-semibold text-slate-700">{employee.gender || 'Chưa cập nhật'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Ngày sinh</span>
                    <span className="font-semibold text-slate-700">{formatDate(employee.dob)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Số CMND / CCCD</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-mono font-medium">
                    <CreditCard size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{employee.cccd || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Số điện thoại</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                    <Phone size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{employee.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Email liên hệ</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-medium break-all">
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{employee.email || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Địa chỉ thường trú / Nơi ở</span>
                  <div className="flex items-start space-x-1.5 text-slate-700 font-medium mt-0.5">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{employee.address || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NHÓM 2: Công việc & Vị trí */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 text-blue-900 font-bold text-sm">
                <Briefcase size={17} className="text-blue-600" />
                <span>2. Công việc & Vị trí</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Chi nhánh công tác</span>
                  <div className="flex items-center space-x-1.5 text-slate-800 font-semibold mt-0.5">
                    <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{employee.branch_name || 'Chi nhánh Chính'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Phòng ban</span>
                  <span className="font-bold text-slate-800 text-sm block mt-0.5">
                    {employee.department_name || 'Chưa phân bổ'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Chức danh / Chức vụ</span>
                  <span className="font-bold text-blue-800 text-sm block mt-0.5">
                    {employee.position_name || 'Chưa thiết lập'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 block uppercase">Tầng nhân sự</span>
                    <span className="font-bold text-blue-800 text-xs">
                      {employee.tier || 'Chưa phân tầng'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 block uppercase">Bậc chuyên môn</span>
                    <span className="font-bold text-blue-800 text-xs">
                      {employee.grade || 'Bậc 1'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Ngày vào làm</span>
                  <div className="flex items-center justify-between text-slate-700 font-semibold mt-0.5">
                    <span>{formatDate(employee.join_date)}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {seniority}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Loại hợp đồng lao động</span>
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mt-0.5">
                    <FileText size={13} className="text-slate-400 flex-shrink-0" />
                    <span>{employee.contract_type || 'Hợp đồng lao động'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Quản lý trực tiếp</span>
                  <span className="font-medium text-slate-700 block mt-0.5">
                    {employee.manager_name || 'Không có / Ban Giám đốc'}
                  </span>
                </div>
              </div>
            </div>

            {/* NHÓM 3: Chế độ Lương & KPI */}
            <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 text-emerald-900 font-bold text-sm">
                <DollarSign size={17} className="text-emerald-600" />
                <span>3. Chế độ Lương & KPI</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Lương theo tầng */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Lương theo tầng</span>
                    <span className="text-xs text-slate-600">{employee.tier || 'Mức lương tầng vị trí'}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(employee.tier_salary || employee.base_salary)}
                  </span>
                </div>

                {/* Lương theo bậc */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Lương theo bậc</span>
                    <span className="text-xs text-slate-600">{employee.grade || 'Mức bậc hiện tại'}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(employee.grade_salary || 0)}
                  </span>
                </div>

                {/* Thưởng KPI trách nhiệm định mức */}
                <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 uppercase block">Thưởng KPI Trách nhiệm</span>
                    <span className="text-[11px] text-blue-700 font-medium">Định mức theo Tầng</span>
                  </div>
                  <span className="font-extrabold text-blue-800 text-sm">
                    {formatCurrency(employee.kpi_bonus)}
                  </span>
                </div>

                {/* Phụ cấp khác */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-slate-500 font-medium">Phụ cấp khác:</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(employee.allowance || 0)}
                  </span>
                </div>

                {/* Ghi chú */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase mb-1">Ghi chú</span>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-h-[44px]">
                    {employee.notes || 'Không có ghi chú bổ sung.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Hồ sơ cập nhật: {formatDate(employee.updated_at || employee.created_at)}
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Đóng
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(employee)}
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow transition inline-flex items-center space-x-1.5"
              >
                <Edit3 size={14} />
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
