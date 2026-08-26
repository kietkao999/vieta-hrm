import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Download, Edit2, Trash2, Search, Filter } from 'lucide-react';
import EmployeeFormModal from './EmployeeFormModal';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [departments, setDepartments] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (departmentId) params.append('department_id', departmentId);
      if (status) params.append('status', status);

      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees?${params.toString()}`),
        api.get('/departments')
      ]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data);
    } catch (err) {
      setError('Lỗi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, status]); // Re-fetch on filter change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenCreate = () => {
    setSelectedEmp(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhân viên ${name}?`)) {
      try {
        await api.delete(`/employees/${id}`);
        setSuccess('Xóa thành công');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/employees/export-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NhanVien_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      setError('Lỗi khi xuất file Excel');
    }
  };

  const handleSaveSuccess = (msg) => {
    setSuccess(msg);
    setModalOpen(false);
    fetchEmployees();
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hồ sơ Nhân viên</h2>
          <p className="text-xs text-slate-500">Quản lý danh sách và thông tin nhân sự</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleExport} className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
            <Download size={16} />
            <span>Xuất Excel</span>
          </button>
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Thêm Nhân viên</span>
          </button>
        </div>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:space-x-4">
        <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-2 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-brand-500">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Tìm tên, mã NV, SĐT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm w-full bg-transparent" />
          <button type="submit" className="hidden">Search</button>
        </form>
        
        <div className="flex space-x-2">
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white min-w-[150px]">
            <option value="">Tất cả phòng ban</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white min-w-[150px]">
            <option value="">Tất cả trạng thái</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
            <option value="Nghỉ thai sản">Nghỉ thai sản</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Mã NV</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3">Phòng ban</th>
                <th className="px-4 py-3">Chức vụ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Không tìm thấy nhân viên nào</td></tr>
              ) : employees.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">{e.code}</td>
                  <td className="px-4 py-4 font-semibold text-slate-800 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                      {e.fullname.charAt(0)}
                    </div>
                    <div>
                      <div>{e.fullname}</div>
                      <div className="text-xs text-slate-400 font-normal">{e.email || e.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{e.department_name}</td>
                  <td className="px-4 py-4">{e.position_name}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      e.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-700' :
                      e.status === 'Thử việc' ? 'bg-amber-100 text-amber-700' :
                      e.status === 'Đã nghỉ việc' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                     <button onClick={() => handleOpenEdit(e)} className="text-slate-500 hover:text-brand-600"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(e.id, e.fullname)} className="text-slate-500 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <EmployeeFormModal 
          employee={selectedEmp}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default EmployeePage;

