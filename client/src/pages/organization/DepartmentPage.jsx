import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Edit2, Trash2, Search } from 'lucide-react';

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, branchRes] = await Promise.all([
        api.get('/departments'),
        api.get('/branches')
      ]);
      setDepartments(deptRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedDept(null);
    setName('');
    setBranchId(branches.length > 0 ? branches[0].id : '');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setModalType('edit');
    setSelectedDept(dept);
    setName(dept.name);
    setBranchId(dept.branch_id || '');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (modalType === 'create') {
        await api.post('/departments', { name, branch_id: branchId });
        setSuccess('Thêm phòng ban thành công');
      } else {
        await api.put(`/departments/${selectedDept.id}`, { name, branch_id: branchId });
        setSuccess('Cập nhật phòng ban thành công');
      }
      fetchData();
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng ban này?')) {
      try {
        await api.delete(`/departments/${id}`);
        setSuccess('Xóa thành công');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filtered = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Phòng ban</h2>
          <p className="text-xs text-slate-500">Danh sách các phòng ban trực thuộc các chi nhánh</p>
        </div>
        <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
          <Plus size={16} />
          <span>Thêm Phòng ban</span>
        </button>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="flex items-center space-x-2 max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input type="text" placeholder="Tìm kiếm phòng ban..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm w-full bg-transparent" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3">Tên Phòng ban</th>
                <th className="px-6 py-3">Thuộc Chi nhánh</th>
                <th className="px-6 py-3">Số lượng nhân sự</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800"><Layers size={16} className="inline mr-2 text-brand-500"/>{d.name}</td>
                  <td className="px-6 py-4">{d.branch_name || <span className="text-slate-400 italic">Không rõ</span>}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{d.employee_count}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => handleOpenEdit(d)} className="text-slate-500 hover:text-brand-600"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(d.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Thêm Phòng ban' : 'Sửa Phòng ban'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Tên phòng ban</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Thuộc chi nhánh</label>
                <select value={branchId} onChange={e=>setBranchId(e.target.value)} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-brand-500">
                  <option value="">-- Không --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
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
export default DepartmentPage;

