import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Printer, Search, Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  
  const [formData, setFormData] = useState({ 
    employee_id: '', base_salary: 0, allowance: 0, bonus: 0, deductions: 0, status: 'Chưa thanh toán', notes: '' 
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payrollRes, empRes] = await Promise.all([
        api.get(`/payroll?month=${month}&year=${year}`),
        api.get('/employees/simple')
      ]);
      setPayrolls(payrollRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu bảng lương');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedPayroll(null);
    setFormData({ 
      employee_id: employees.length > 0 ? employees[0].id : '', 
      base_salary: 0, allowance: 0, bonus: 0, deductions: 0, 
      status: 'Chưa thanh toán', notes: '' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setModalType('edit');
    setSelectedPayroll(p);
    setFormData({
      employee_id: p.employee_id,
      base_salary: p.base_salary,
      allowance: p.allowance,
      bonus: p.bonus,
      deductions: p.deductions,
      status: p.payment_status || 'Chưa thanh toán',
      notes: p.notes || ''
    });
    setModalOpen(true);
  };

  const handleEmployeeChange = async (empId) => {
    setFormData(prev => ({ ...prev, employee_id: empId }));
    // Auto fill base salary if possible
    try {
      const res = await api.get(`/employees/${empId}`);
      if (res.data) {
        setFormData(prev => ({ 
          ...prev, 
          base_salary: res.data.base_salary || 0,
          allowance: res.data.allowance || 0 
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, month, year };
      if (modalType === 'create') {
        await api.post('/payroll', data);
        setSuccess('Tạo phiếu lương thành công');
      } else {
        await api.put(`/payroll/${selectedPayroll.id}`, data);
        setSuccess('Cập nhật phiếu lương thành công');
      }
      setModalOpen(false);
      fetchData();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phiếu lương này?')) {
      try {
        await api.delete(`/payroll/${id}`);
        setSuccess('Đã xóa phiếu lương');
        fetchData();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bảng Lương</h2>
          <p className="text-xs text-slate-500">Quản lý lương, thưởng, khấu trừ và payslip</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handlePrint} className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm print:hidden">
            <Printer size={16} />
            <span>In Bảng Lương</span>
          </button>
          {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
            <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow print:hidden">
              <Plus size={16} />
              <span>Tạo Phiếu Lương</span>
            </button>
          )}
        </div>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 print:hidden">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 print:hidden">{error}</div>}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4 print:hidden">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Tháng</span>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Năm</span>
          <select value={year} onChange={e=>setYear(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3 text-right">Lương Cơ bản</th>
                <th className="px-4 py-3 text-right">Phụ cấp</th>
                <th className="px-4 py-3 text-right">Thưởng</th>
                <th className="px-4 py-3 text-right">Khấu trừ</th>
                <th className="px-4 py-3 text-right">Thực nhận</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && <th className="px-4 py-3 text-right print:hidden">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-500">Chưa có bảng lương tháng {month}/{year}</td></tr>
              ) : payrolls.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{p.fullname}</div>
                    <div className="text-xs text-slate-500">{p.employee_code} - {p.department_name}</div>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-600">{formatVND(p.base_salary)}</td>
                  <td className="px-4 py-4 text-right text-slate-600">{formatVND(p.allowance)}</td>
                  <td className="px-4 py-4 text-right text-emerald-600">{formatVND(p.bonus)}</td>
                  <td className="px-4 py-4 text-right text-red-600">-{formatVND(p.deductions)}</td>
                  <td className="px-4 py-4 text-right font-bold text-brand-700 text-base">{formatVND(p.total_salary)}</td>
                  <td className="px-4 py-4 text-center">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                      p.payment_status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {p.payment_status}
                    </span>
                  </td>
                  {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                    <td className="px-4 py-4 text-right space-x-2 print:hidden">
                      <button onClick={() => handleOpenEdit(p)} className="text-slate-500 hover:text-brand-600"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(p.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16}/></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 print:hidden">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Tạo Phiếu Lương' : 'Cập nhật Phiếu Lương'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                  <select required disabled={modalType==='edit'} value={formData.employee_id} onChange={e=>handleEmployeeChange(e.target.value)} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Lương cơ bản</label>
                  <input type="number" required value={formData.base_salary} onChange={e=>setFormData({...formData, base_salary: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Phụ cấp</label>
                  <input type="number" value={formData.allowance} onChange={e=>setFormData({...formData, allowance: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Thưởng</label>
                  <input type="number" value={formData.bonus} onChange={e=>setFormData({...formData, bonus: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Khấu trừ</label>
                  <input type="number" value={formData.deductions} onChange={e=>setFormData({...formData, deductions: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                  <input type="text" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center mt-2">
                <span className="text-sm font-semibold text-slate-600">Tổng thực nhận tạm tính:</span>
                <span className="text-lg font-bold text-brand-700">
                  {formatVND((parseFloat(formData.base_salary)||0) + (parseFloat(formData.allowance)||0) + (parseFloat(formData.bonus)||0) - (parseFloat(formData.deductions)||0))}
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
