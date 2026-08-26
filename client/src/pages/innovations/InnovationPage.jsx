import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Lightbulb, Plus, Trash2, Edit2, Search, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const InnovationPage = () => {
  const { user } = useAuth();
  const [innovations, setInnovations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', title: '', content: '', date: '', status: 'Đề xuất',
    efficiency: '', cost_savings: 0, productivity_increase: '', value_created: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusList = ['Đề xuất', 'Đang xét duyệt', 'Chấp nhận', 'Từ chối', 'Đã triển khai'];
  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR' || user?.roleName === 'MANAGER';

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (filterStatus) params.append('status', filterStatus);

      const [innovRes, empRes] = await Promise.all([
        api.get(`/innovations?${params.toString()}`),
        api.get('/employees/simple')
      ]);
      setInnovations(innovRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu sáng kiến');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, filterStatus]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      employee_id: user?.roleName === 'EMPLOYEE' ? '' : (employees.length > 0 ? employees[0].id : ''),
      title: '', content: '', date: new Date().toISOString().split('T')[0], status: 'Đề xuất',
      efficiency: '', cost_savings: 0, productivity_increase: '', value_created: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      employee_id: item.employee_id,
      title: item.title || '',
      content: item.content || '',
      date: item.date || '',
      status: item.status || 'Đề xuất',
      efficiency: item.efficiency || '',
      cost_savings: item.cost_savings || 0,
      productivity_increase: item.productivity_increase || '',
      value_created: item.value_created || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/innovations/${editingItem.id}`, formData);
        setSuccess('Cập nhật sáng kiến thành công');
      } else {
        await api.post('/innovations', formData);
        setSuccess('Đề xuất sáng kiến thành công');
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
    if (window.confirm('Bạn có chắc muốn xóa sáng kiến này?')) {
      try {
        await api.delete(`/innovations/${id}`);
        setSuccess('Đã xóa sáng kiến');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredInnovations = innovations.filter(i =>
    !searchTerm || i.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || i.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val) => val ? Number(val).toLocaleString('vi-VN') : '0';

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Đề xuất': return 'bg-blue-100 text-blue-700';
      case 'Đang xét duyệt': return 'bg-amber-100 text-amber-700';
      case 'Chấp nhận': return 'bg-emerald-100 text-emerald-700';
      case 'Đã triển khai': return 'bg-teal-100 text-teal-700';
      case 'Từ chối': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Chấp nhận': case 'Đã triển khai': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'Từ chối': return <XCircle size={14} className="text-red-500" />;
      case 'Đang xét duyệt': return <Clock size={14} className="text-amber-500" />;
      default: return <Lightbulb size={14} className="text-blue-500" />;
    }
  };

  const currentYear = new Date().getFullYear();
  const totalSavings = filteredInnovations.filter(i => i.status === 'Chấp nhận' || i.status === 'Đã triển khai').reduce((s, i) => s + (i.cost_savings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sáng kiến & Cải tiến Sản xuất</h2>
          <p className="text-xs text-slate-500">Đề xuất, đánh giá và theo dõi sáng kiến cải tiến trong doanh nghiệp</p>
        </div>
        <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
          <Plus size={16} />
          <span>Đề xuất Sáng kiến</span>
        </button>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Lightbulb size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG SÁNG KIẾN</p>
            <p className="text-xl font-bold text-slate-800">{filteredInnovations.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Clock size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">ĐANG XÉT DUYỆT</p>
            <p className="text-xl font-bold text-slate-800">{filteredInnovations.filter(i => i.status === 'Đề xuất' || i.status === 'Đang xét duyệt').length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">ĐÃ CHẤP NHẬN</p>
            <p className="text-xl font-bold text-slate-800">{filteredInnovations.filter(i => i.status === 'Chấp nhận' || i.status === 'Đã triển khai').length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-600"><Zap size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TIẾT KIỆM</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(totalSavings)} đ</p>
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
          <span className="text-sm font-semibold text-slate-700">Trạng thái</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            <option value="">Tất cả</option>
            {statusList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm theo người đề xuất hoặc tiêu đề..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Người đề xuất</th>
                <th className="px-4 py-3">Sáng kiến</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Tiết kiệm (VNĐ)</th>
                <th className="px-4 py-3">Hiệu quả</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInnovations.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">Chưa có sáng kiến nào trong năm {year}</td></tr>
              ) : filteredInnovations.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{item.fullname}</div>
                    <div className="text-xs text-slate-500">{item.department_name} • {item.employee_code}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-800">{item.title}</div>
                    {item.content && <div className="text-xs text-slate-500 line-clamp-1 max-w-[250px]">{item.content}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold ${getStatusStyle(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-teal-700">{formatCurrency(item.cost_savings)}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 max-w-[150px] truncate">{item.efficiency || '-'}</td>
                  <td className="px-4 py-4 text-right space-x-2">
                    {(isAdmin || (user?.roleName === 'EMPLOYEE' && item.employee_id === user?.employeeId && item.status === 'Đề xuất')) && (
                      <button onClick={() => handleOpenEdit(item)} className="text-brand-600 hover:text-brand-800"><Edit2 size={16} /></button>
                    )}
                    {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                      <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">{editingItem ? 'Cập nhật Sáng kiến' : 'Đề xuất Sáng kiến mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="text-xs font-semibold text-slate-500">Người đề xuất</label>
                  <select value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="">-- Tự động (tài khoản hiện tại) --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500">Tiêu đề sáng kiến (*)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Ví dụ: Cải tiến quy trình đóng gói sản phẩm..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Mô tả chi tiết</label>
                <textarea rows="3" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Mô tả giải pháp đề xuất, các bước thực hiện..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ngày đề xuất</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                {isAdmin && editingItem && (
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Trạng thái duyệt</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                      {statusList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Đánh giá hiệu quả (nếu có)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Hiệu quả / Lợi ích</label>
                    <input type="text" value={formData.efficiency} onChange={e => setFormData({...formData, efficiency: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Giảm thời gian 20%..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tiết kiệm chi phí (VNĐ)</label>
                    <input type="number" value={formData.cost_savings} onChange={e => setFormData({...formData, cost_savings: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tăng năng suất</label>
                    <input type="text" value={formData.productivity_increase} onChange={e => setFormData({...formData, productivity_increase: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Tăng 15% sản lượng..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Giá trị tạo ra</label>
                    <input type="text" value={formData.value_created} onChange={e => setFormData({...formData, value_created: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Nâng cao chất lượng..." />
                  </div>
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

export default InnovationPage;
