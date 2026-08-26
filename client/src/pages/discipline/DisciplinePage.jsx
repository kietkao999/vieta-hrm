import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Plus, Trash2, Edit2, Search, AlertTriangle, Ban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DisciplinePage = () => {
  const { user } = useAuth();
  const [disciplines, setDisciplines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [filterForm, setFilterForm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', content: '', form: 'Nhắc nhở', date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const disciplineForms = ['Nhắc nhở', 'Cảnh cáo bằng văn bản', 'Phạt tiền', 'Hạ bậc lương', 'Cách chức', 'Sa thải'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (filterForm) params.append('form', filterForm);

      const [discRes, empRes] = await Promise.all([
        api.get(`/discipline?${params.toString()}`),
        api.get('/employees/simple')
      ]);
      setDisciplines(discRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu kỷ luật');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, filterForm]);

  const handleOpenCreate = () => {
    setEditingDisc(null);
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      content: '', form: 'Nhắc nhở', date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (disc) => {
    setEditingDisc(disc);
    setFormData({
      employee_id: disc.employee_id,
      content: disc.content || '',
      form: disc.form || 'Nhắc nhở',
      date: disc.date || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDisc) {
        await api.put(`/discipline/${editingDisc.id}`, formData);
        setSuccess('Cập nhật quyết định kỷ luật thành công');
      } else {
        await api.post('/discipline', formData);
        setSuccess('Thêm quyết định kỷ luật thành công');
      }
      setModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi kỷ luật này?')) {
      try {
        await api.delete(`/discipline/${id}`);
        setSuccess('Đã xóa bản ghi kỷ luật');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredDisciplines = disciplines.filter(d =>
    !searchTerm || d.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || d.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFormStyle = (form) => {
    switch (form) {
      case 'Nhắc nhở': return 'bg-amber-100 text-amber-700';
      case 'Cảnh cáo bằng văn bản': return 'bg-orange-100 text-orange-700';
      case 'Phạt tiền': return 'bg-red-100 text-red-700';
      case 'Hạ bậc lương': return 'bg-rose-100 text-rose-700';
      case 'Cách chức': return 'bg-red-200 text-red-800';
      case 'Sa thải': return 'bg-red-300 text-red-900';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getSeverityIcon = (form) => {
    if (['Sa thải', 'Cách chức', 'Hạ bậc lương'].includes(form)) return <Ban size={16} className="text-red-500" />;
    if (['Phạt tiền', 'Cảnh cáo bằng văn bản'].includes(form)) return <AlertTriangle size={16} className="text-orange-500" />;
    return <ShieldAlert size={16} className="text-amber-500" />;
  };

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Kỷ luật</h2>
          <p className="text-xs text-slate-500">Theo dõi vi phạm và các hình thức xử lý kỷ luật nhân viên</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Thêm Quyết định</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-red-50 p-3 text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG SỐ VỤ VIỆC</p>
            <p className="text-xl font-bold text-slate-800">{filteredDisciplines.length} vụ</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">NHẮC NHỞ / CẢNH CÁO</p>
            <p className="text-xl font-bold text-slate-800">{filteredDisciplines.filter(d => ['Nhắc nhở', 'Cảnh cáo bằng văn bản'].includes(d.form)).length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">XỬ LÝ NẶNG</p>
            <p className="text-xl font-bold text-slate-800">{filteredDisciplines.filter(d => ['Phạt tiền', 'Hạ bậc lương', 'Cách chức', 'Sa thải'].includes(d.form)).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Năm</span>
          <select value={year} onChange={e => setYear(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-700">Hình thức</span>
          <select value={filterForm} onChange={e => setFilterForm(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            <option value="">Tất cả</option>
            {disciplineForms.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm nhân viên hoặc nội dung..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3 w-1/3">Nội dung vi phạm</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Hình thức</th>
                <th className="px-4 py-3">Người quyết định</th>
                {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDisciplines.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">Chưa có bản ghi kỷ luật nào trong năm {year}</td></tr>
              ) : filteredDisciplines.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{d.fullname}</div>
                    <div className="text-xs text-slate-500">{d.department_name} • {d.employee_code}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-start space-x-2">
                      {getSeverityIcon(d.form)}
                      <span className="text-sm text-slate-700 font-medium">{d.content}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{d.date ? new Date(d.date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getFormStyle(d.form)}`}>{d.form}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{d.decision_maker_name || '-'}</td>
                  {isAdmin && (
                    <td className="px-4 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(d)} className="text-brand-600 hover:text-brand-800"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">{editingDisc ? 'Cập nhật Kỷ luật' : 'Thêm Quyết định Kỷ luật'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Nội dung vi phạm (*)</label>
                <textarea required rows="3" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Mô tả chi tiết nội dung vi phạm..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Hình thức xử lý (*)</label>
                  <select required value={formData.form} onChange={e => setFormData({...formData, form: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    {disciplineForms.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ngày quyết định</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplinePage;
