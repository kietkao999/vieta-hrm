import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Plus, Trash2, Edit2, Search, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RewardPage = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '', title: '', content: '', date: '', reward_type: 'Tiền mặt', value: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const rewardTypes = ['Tiền mặt', 'Kỷ niệm chương', 'Bằng khen', 'Quà tặng', 'Ngày phép thưởng', 'Khác'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (filterType) params.append('reward_type', filterType);

      const [rewardRes, empRes] = await Promise.all([
        api.get(`/rewards?${params.toString()}`),
        api.get('/employees/simple')
      ]);
      setRewards(rewardRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu khen thưởng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, filterType]);

  const handleOpenCreate = () => {
    setEditingReward(null);
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      title: '', content: '', date: new Date().toISOString().split('T')[0],
      reward_type: 'Tiền mặt', value: 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      employee_id: reward.employee_id,
      title: reward.title,
      content: reward.content || '',
      date: reward.date || '',
      reward_type: reward.reward_type || 'Tiền mặt',
      value: reward.value || 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await api.put(`/rewards/${editingReward.id}`, formData);
        setSuccess('Cập nhật khen thưởng thành công');
      } else {
        await api.post('/rewards', formData);
        setSuccess('Thêm khen thưởng thành công');
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
    if (window.confirm('Bạn có chắc muốn xóa bản ghi khen thưởng này?')) {
      try {
        await api.delete(`/rewards/${id}`);
        setSuccess('Đã xóa khen thưởng');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredRewards = rewards.filter(r =>
    !searchTerm || r.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val) => {
    if (!val) return '0';
    return Number(val).toLocaleString('vi-VN');
  };

  const getRewardTypeStyle = (type) => {
    switch (type) {
      case 'Tiền mặt': return 'bg-emerald-100 text-emerald-700';
      case 'Kỷ niệm chương': return 'bg-purple-100 text-purple-700';
      case 'Bằng khen': return 'bg-blue-100 text-blue-700';
      case 'Quà tặng': return 'bg-amber-100 text-amber-700';
      case 'Ngày phép thưởng': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Khen thưởng & Vinh danh</h2>
          <p className="text-xs text-slate-500">Ghi nhận thành tích, khen thưởng và vinh danh thâm niên nhân viên</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Thêm Khen thưởng</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG KHEN THƯỞNG</p>
            <p className="text-xl font-bold text-slate-800">{filteredRewards.length} lượt</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG GIÁ TRỊ</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(filteredRewards.reduce((s, r) => s + (r.value || 0), 0))} đ</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <Medal size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">VINH DANH THÂM NIÊN</p>
            <p className="text-xl font-bold text-slate-800">{filteredRewards.filter(r => r.reward_type === 'Kỷ niệm chương').length} người</p>
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
          <span className="text-sm font-semibold text-slate-700">Loại</span>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
            <option value="">Tất cả</option>
            {rewardTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhân viên hoặc nội dung..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none"
            />
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
                <th className="px-4 py-3">Tiêu đề khen thưởng</th>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3 text-right">Giá trị (VNĐ)</th>
                {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRewards.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">Chưa có khen thưởng nào trong năm {year}</td></tr>
              ) : filteredRewards.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{r.fullname}</div>
                    <div className="text-xs text-slate-500">{r.department_name} • {r.employee_code}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-800">{r.title}</div>
                    {r.content && <div className="text-xs text-slate-500 line-clamp-1">{r.content}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{r.date ? new Date(r.date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getRewardTypeStyle(r.reward_type)}`}>
                      {r.reward_type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-brand-700">{formatCurrency(r.value)}</td>
                  {isAdmin && (
                    <td className="px-4 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(r)} className="text-brand-600 hover:text-brand-800"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
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
            <h3 className="font-bold text-lg mb-4">{editingReward ? 'Cập nhật Khen thưởng' : 'Thêm Khen thưởng mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Tiêu đề khen thưởng (*)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Ví dụ: Khen thưởng Quý 2, Vinh danh thâm niên 10 năm..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Nội dung chi tiết</label>
                <textarea rows="2" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Mô tả lý do khen thưởng..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ngày khen thưởng</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Loại khen thưởng</label>
                  <select value={formData.reward_type} onChange={e => setFormData({...formData, reward_type: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    {rewardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Giá trị (VNĐ)</label>
                <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
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

export default RewardPage;
