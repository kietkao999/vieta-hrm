import React from 'react';

const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 overflow-y-auto py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-brand-700 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Chi Tiết Hồ Sơ Nhân Sự</h3>
          <button onClick={onClose} className="text-white hover:text-slate-200 text-xl font-semibold">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4 border-b pb-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl">
              {employee.fullname ? employee.fullname.charAt(0) : '?'}
            </div>
            <div>
              <h4 className="font-bold text-xl text-slate-800">{employee.fullname}</h4>
              <p className="text-sm font-mono text-slate-500">{employee.code}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Mã nhân sự</span>
              <span className="font-mono text-slate-800">{employee.code}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Họ và tên</span>
              <span className="font-medium text-slate-800">{employee.fullname}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Phòng ban</span>
              <span className="font-medium text-slate-800">{employee.department_name || 'Chưa phân bổ'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Chức vụ</span>
              <span className="font-medium text-slate-800">{employee.position_name || 'Chưa phân bổ'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Ngày sinh</span>
              <span className="font-medium text-slate-800">{employee.dob || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase">Ngày vào làm</span>
              <span className="font-medium text-slate-800">{employee.join_date || 'N/A'}</span>
            </div>
            <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Thưởng KPI</span>
                <span className="text-lg font-bold text-brand-700">{formatCurrency(employee.kpi_bonus)}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase text-right">Trạng thái</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                  employee.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-700' :
                  employee.status === 'Thử việc' ? 'bg-amber-100 text-amber-700' :
                  employee.status === 'Đã nghỉ việc' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition-all">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
