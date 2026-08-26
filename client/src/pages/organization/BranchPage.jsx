import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building, Plus, Edit2, Trash2, Search } from 'lucide-react';

const BranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedBranch(null);
    setName('');
    setAddress('');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setModalType('edit');
    setSelectedBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
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
        await api.post('/branches', { name, address });
        setSuccess('Thêm chi nhánh thành công');
      } else {
        await api.put(`/branches/${selectedBranch.id}`, { name, address });
        setSuccess('Cập nhật chi nhánh thành công');
      }
      fetchBranches();
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      try {
        await api.delete(`/branches/${id}`);
        setSuccess('Xóa thành công');
        fetchBranches();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filtered = branches.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Chi nhánh</h2>
          <p className="text-xs text-slate-500">Danh sách các cơ sở, văn phòng, nhà máy</p>
        </div>
        <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
          <Plus size={16} />
          <span>Thêm Chi nhánh</span>
        </button>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="flex items-center space-x-2 max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input type="text" placeholder="Tìm kiếm chi nhánh..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="outline-none text-sm w-full bg-transparent" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Tên Chi nhánh</th>
                <th className="px-6 py-3">Địa chỉ</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{b.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800"><Building size={16} className="inline mr-2 text-brand-500"/>{b.name}</td>
                  <td className="px-6 py-4">{b.address}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => handleOpenEdit(b)} className="text-slate-500 hover:text-brand-600"><Edit2 size={16}/></button>
                     <button onClick={() => handleDelete(b.id)} className="text-slate-500 hover:text-red-600"><Trash2 size={16}/></button>
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
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Thêm Chi nhánh' : 'Sửa Chi nhánh'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Tên chi nhánh</label>
                <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Địa chỉ</label>
                <input type="text" value={address} onChange={e=>setAddress(e.target.value)} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-1 focus:ring-brand-500" />
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
export default BranchPage;

