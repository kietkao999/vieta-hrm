import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Award, Plus, Trash2, Edit2, Search, Trophy, Medal,
  ShieldAlert, AlertTriangle, Ban, Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ═══════════════════════════════════════════════════════════════
   RewardPage — Hợp nhất "Khen thưởng" + "Kỷ luật & Vi phạm"
   ═══════════════════════════════════════════════════════════════ */

const formatCurrency = (val) => {
  if (!val) return '0';
  return Number(val).toLocaleString('vi-VN');
};

const RewardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'discipline' ? 'discipline' : 'rewards';
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'discipline' ? { tab: 'discipline' } : {});
  };

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';
  const currentYear = new Date().getFullYear();

  // ─── SHARED STATE ───
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── KHEN THƯỞNG STATE ───
  const [rewards, setRewards] = useState([]);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [rewardYear, setRewardYear] = useState(currentYear.toString());
  const [rewardFilterType, setRewardFilterType] = useState('');
  const [rewardSearch, setRewardSearch] = useState('');
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    employee_id: '', title: '', content: '', date: '', reward_type: 'Tiền mặt', value: 0
  });

  const rewardTypes = ['Tiền mặt', 'Kỷ niệm chương', 'Bằng khen', 'Quà tặng', 'Ngày phép thưởng', 'Khác'];

  // ─── KỶ LUẬT STATE ───
  const [disciplines, setDisciplines] = useState([]);
  const [discLoading, setDiscLoading] = useState(true);
  const [discYear, setDiscYear] = useState(currentYear.toString());
  const [discFilterForm, setDiscFilterForm] = useState('');
  const [discSearch, setDiscSearch] = useState('');
  const [discModalOpen, setDiscModalOpen] = useState(false);
  const [editingDisc, setEditingDisc] = useState(null);
  const [discForm, setDiscForm] = useState({
    employee_id: '', content: '', form: 'Nhắc nhở', date: '', value: 0
  });

  const disciplineForms = ['Nhắc nhở', 'Khiển trách', 'Cảnh cáo bằng văn bản', 'Phạt tiền', 'Hạ bậc lương', 'Cách chức', 'Sa thải'];

  // ═══ FETCH FUNCTIONS ═══
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees/simple');
      setEmployees(res.data);
    } catch (err) { /* silent */ }
  };

  const fetchRewards = async () => {
    setRewardLoading(true);
    try {
      const params = new URLSearchParams();
      if (rewardYear) params.append('year', rewardYear);
      if (rewardFilterType) params.append('reward_type', rewardFilterType);
      const res = await api.get(`/rewards?${params.toString()}`);
      setRewards(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu khen thưởng');
    } finally {
      setRewardLoading(false);
    }
  };

  const fetchDisciplines = async () => {
    setDiscLoading(true);
    try {
      const params = new URLSearchParams();
      if (discYear) params.append('year', discYear);
      if (discFilterForm) params.append('form', discFilterForm);
      const res = await api.get(`/discipline?${params.toString()}`);
      setDisciplines(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu kỷ luật');
    } finally {
      setDiscLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchRewards(); }, [rewardYear, rewardFilterType]);
  useEffect(() => { fetchDisciplines(); }, [discYear, discFilterForm]);

  // ═══ KHEN THƯỞNG HANDLERS ═══
  const handleRewardOpenCreate = () => {
    setEditingReward(null);
    setRewardForm({
      employee_id: employees.length > 0 ? employees[0].id : '',
      title: '', content: '', date: new Date().toISOString().split('T')[0],
      reward_type: 'Tiền mặt', value: 0
    });
    setRewardModalOpen(true);
  };

  const handleRewardOpenEdit = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      employee_id: reward.employee_id,
      title: reward.title,
      content: reward.content || '',
      date: reward.date || '',
      reward_type: reward.reward_type || 'Tiền mặt',
      value: reward.value || 0
    });
    setRewardModalOpen(true);
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReward) {
        await api.put(`/rewards/${editingReward.id}`, rewardForm);
        setSuccess('Cập nhật khen thưởng thành công');
      } else {
        await api.post('/rewards', rewardForm);
        setSuccess('Thêm khen thưởng thành công');
      }
      setRewardModalOpen(false);
      fetchRewards();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRewardDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi khen thưởng này?')) {
      try {
        await api.delete(`/rewards/${id}`);
        setSuccess('Đã xóa khen thưởng');
        fetchRewards();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // ═══ KỶ LUẬT HANDLERS ═══
  const handleDiscOpenCreate = () => {
    setEditingDisc(null);
    setDiscForm({
      employee_id: employees.length > 0 ? employees[0].id : '',
      content: '', form: 'Nhắc nhở', date: new Date().toISOString().split('T')[0], value: 0
    });
    setDiscModalOpen(true);
  };

  const handleDiscOpenEdit = (disc) => {
    setEditingDisc(disc);
    setDiscForm({
      employee_id: disc.employee_id,
      content: disc.content || '',
      form: disc.form || 'Nhắc nhở',
      date: disc.date || '',
      value: disc.value || 0
    });
    setDiscModalOpen(true);
  };

  const handleDiscSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDisc) {
        await api.put(`/discipline/${editingDisc.id}`, discForm);
        setSuccess('Cập nhật quyết định kỷ luật thành công');
      } else {
        await api.post('/discipline', discForm);
        setSuccess('Ghi nhận vi phạm / kỷ luật thành công');
      }
      setDiscModalOpen(false);
      fetchDisciplines();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDiscDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi kỷ luật này?')) {
      try {
        await api.delete(`/discipline/${id}`);
        setSuccess('Đã xóa bản ghi kỷ luật');
        fetchDisciplines();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // ═══ STYLE HELPERS ═══
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

  const getDiscFormStyle = (form) => {
    switch (form) {
      case 'Nhắc nhở': return 'bg-amber-100 text-amber-700';
      case 'Khiển trách': return 'bg-orange-100 text-orange-700';
      case 'Cảnh cáo bằng văn bản': return 'bg-orange-200 text-orange-800';
      case 'Phạt tiền': return 'bg-red-100 text-red-700';
      case 'Hạ bậc lương': return 'bg-rose-100 text-rose-700';
      case 'Cách chức': return 'bg-red-200 text-red-800';
      case 'Sa thải': return 'bg-red-300 text-red-900';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getSeverityIcon = (form) => {
    if (['Sa thải', 'Cách chức', 'Hạ bậc lương'].includes(form)) return <Ban size={16} className="text-red-500" />;
    if (['Phạt tiền', 'Cảnh cáo bằng văn bản', 'Khiển trách'].includes(form)) return <AlertTriangle size={16} className="text-orange-500" />;
    return <ShieldAlert size={16} className="text-amber-500" />;
  };

  // ═══ FILTERED DATA ═══
  const filteredRewards = rewards.filter(r =>
    !rewardSearch || r.fullname?.toLowerCase().includes(rewardSearch.toLowerCase()) || r.title?.toLowerCase().includes(rewardSearch.toLowerCase()) || r.employee_code?.toLowerCase().includes(rewardSearch.toLowerCase())
  );

  const filteredDisciplines = disciplines.filter(d =>
    !discSearch || d.fullname?.toLowerCase().includes(discSearch.toLowerCase()) || d.content?.toLowerCase().includes(discSearch.toLowerCase()) || d.employee_code?.toLowerCase().includes(discSearch.toLowerCase())
  );

  // ═══ STATS ═══
  const totalRewardValue = filteredRewards.reduce((s, r) => s + (r.value || 0), 0);
  const totalDiscValue = filteredDisciplines.reduce((s, d) => s + (d.value || 0), 0);
  const uniqueDiscEmployees = new Set(filteredDisciplines.map(d => d.employee_id)).size;

  // ═══ RENDER ═══
  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Khen thưởng & Kỷ luật</h2>
          <p className="text-xs text-slate-500">Ghi nhận thành tích, vinh danh và theo dõi vi phạm, kỷ luật nhân viên</p>
        </div>

        {/* Action buttons — change per tab */}
        {isAdmin && (
          <div>
            {activeTab === 'rewards' ? (
              <button onClick={handleRewardOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 shadow">
                <Plus size={16} />
                <span>Thêm Khen thưởng</span>
              </button>
            ) : (
              <button onClick={handleDiscOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 shadow">
                <Plus size={16} />
                <span>Ghi nhận Vi phạm / Kỷ luật</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alerts */}
      {success && <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">{error}</div>}

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => switchTab('rewards')}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'rewards'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy size={16} />
          <span>Danh Sách Khen Thưởng</span>
          {rewards.length > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {rewards.length}
            </span>
          )}
        </button>
        <button
          onClick={() => switchTab('discipline')}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'discipline'
              ? 'bg-white text-rose-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Danh Sách Kỷ Luật & Vi Phạm</span>
          {disciplines.length > 0 && (
            <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {disciplines.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          TAB 1: DANH SÁCH KHEN THƯỞNG
         ═══════════════════════════════════════════════ */}
      {activeTab === 'rewards' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Trophy size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">TỔNG LƯỢT KHEN THƯỞNG</p>
                <p className="text-xl font-bold text-slate-800">{filteredRewards.length} lượt</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><Award size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">TỔNG GIÁ TRỊ (VNĐ)</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalRewardValue)} đ</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-purple-50 p-3 text-purple-600"><Medal size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">VINH DANH THÂM NIÊN</p>
                <p className="text-xl font-bold text-slate-800">{filteredRewards.filter(r => r.reward_type === 'Kỷ niệm chương').length} người</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-700">Năm</span>
              <select value={rewardYear} onChange={e => setRewardYear(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-700">Loại</span>
              <select value={rewardFilterType} onChange={e => setRewardFilterType(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
                <option value="">Tất cả</option>
                {rewardTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo tên/mã NV hoặc nội dung..." value={rewardSearch} onChange={e => setRewardSearch(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            {rewardLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Tiêu đề khen thưởng</th>
                    <th className="px-4 py-3">Ngày ghi nhận</th>
                    <th className="px-4 py-3">Loại khen thưởng</th>
                    <th className="px-4 py-3 text-right">Giá trị (VNĐ)</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRewards.length === 0 ? (
                    <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">Chưa có khen thưởng nào trong năm {rewardYear}</td></tr>
                  ) : filteredRewards.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.fullname}</div>
                        <div className="text-xs text-slate-500">{r.department_name} • {r.employee_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{r.title}</div>
                        {r.content && <div className="text-xs text-slate-500 line-clamp-1">{r.content}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.date ? new Date(r.date).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getRewardTypeStyle(r.reward_type)}`}>{r.reward_type}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(r.value)} đ</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleRewardOpenEdit(r)} className="text-brand-600 hover:text-brand-800"><Edit2 size={16} /></button>
                          <button onClick={() => handleRewardDelete(r.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Reward Modal */}
          {rewardModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4">{editingReward ? 'Cập nhật Khen thưởng' : 'Thêm Khen thưởng mới'}</h3>
                <form onSubmit={handleRewardSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                    <select required value={rewardForm.employee_id} onChange={e => setRewardForm({...rewardForm, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tiêu đề / Danh hiệu khen thưởng (*)</label>
                    <input required type="text" value={rewardForm.title} onChange={e => setRewardForm({...rewardForm, title: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="VD: Khen thưởng Quý 2, Vinh danh thâm niên 10 năm..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Lý do khen thưởng</label>
                    <textarea rows="2" value={rewardForm.content} onChange={e => setRewardForm({...rewardForm, content: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Mô tả lý do khen thưởng..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Ngày quyết định</label>
                      <input type="date" value={rewardForm.date} onChange={e => setRewardForm({...rewardForm, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Hình thức</label>
                      <select value={rewardForm.reward_type} onChange={e => setRewardForm({...rewardForm, reward_type: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                        {rewardTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Số tiền thưởng (VNĐ)</label>
                      <input type="number" step="50000" value={rewardForm.value} onChange={e => setRewardForm({...rewardForm, value: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setRewardModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: DANH SÁCH KỶ LUẬT & VI PHẠM
         ═══════════════════════════════════════════════ */}
      {activeTab === 'discipline' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-red-50 p-3 text-red-600"><ShieldAlert size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">TỔNG LƯỢT VI PHẠM</p>
                <p className="text-xl font-bold text-slate-800">{filteredDisciplines.length} lượt</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-rose-50 p-3 text-rose-600"><AlertTriangle size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">TỔNG TIỀN PHẠT / KHẤU TRỪ</p>
                <p className="text-xl font-bold text-rose-700">{formatCurrency(totalDiscValue)} đ</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
              <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Users size={24} /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400">SỐ NHÂN SỰ VI PHẠM</p>
                <p className="text-xl font-bold text-slate-800">{uniqueDiscEmployees} người</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-700">Năm</span>
              <select value={discYear} onChange={e => setDiscYear(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-700">Hình thức</span>
              <select value={discFilterForm} onChange={e => setDiscFilterForm(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none">
                <option value="">Tất cả</option>
                {disciplineForms.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Tìm theo tên/mã NV hoặc nội dung..." value={discSearch} onChange={e => setDiscSearch(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            {discLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
            ) : (
              <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Hình thức kỷ luật</th>
                    <th className="px-4 py-3">Ngày vi phạm</th>
                    <th className="px-4 py-3 text-right">Mức phạt (VNĐ)</th>
                    <th className="px-4 py-3">Lý do vi phạm</th>
                    <th className="px-4 py-3">Người quyết định</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDisciplines.length === 0 ? (
                    <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-500">Chưa có bản ghi kỷ luật nào trong năm {discYear}</td></tr>
                  ) : filteredDisciplines.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{d.fullname}</div>
                        <div className="text-xs text-slate-500">{d.department_name} • {d.employee_code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(d.form)}
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getDiscFormStyle(d.form)}`}>{d.form}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{d.date ? new Date(d.date).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-700">{d.value > 0 ? `${formatCurrency(d.value)} đ` : '-'}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 font-medium line-clamp-2">{d.content}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{d.decision_maker_name || '-'}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleDiscOpenEdit(d)} className="text-brand-600 hover:text-brand-800"><Edit2 size={16} /></button>
                          <button onClick={() => handleDiscDelete(d.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Discipline Modal */}
          {discModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
                <h3 className="font-bold text-lg mb-4">{editingDisc ? 'Cập nhật Kỷ luật' : 'Ghi nhận Vi phạm / Kỷ luật mới'}</h3>
                <form onSubmit={handleDiscSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                    <select required value={discForm.employee_id} onChange={e => setDiscForm({...discForm, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Nội dung vi phạm / Lý do kỷ luật (*)</label>
                    <textarea required rows="3" value={discForm.content} onChange={e => setDiscForm({...discForm, content: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Mô tả chi tiết nội dung vi phạm..." />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Hình thức xử lý (*)</label>
                      <select required value={discForm.form} onChange={e => setDiscForm({...discForm, form: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                        {disciplineForms.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Ngày vi phạm</label>
                      <input type="date" value={discForm.date} onChange={e => setDiscForm({...discForm, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Mức phạt tiền (VNĐ)</label>
                      <input type="number" step="50000" value={discForm.value} onChange={e => setDiscForm({...discForm, value: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setDiscModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-rose-700 text-white rounded-lg text-sm font-semibold hover:bg-rose-800">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default RewardPage;
