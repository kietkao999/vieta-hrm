import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, Clock, MapPin, Plus, Trash2, Search, Star, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SeniorityPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('seniority');
  const [seniorityData, setSeniorityData] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '', department_id: '', position_id: '', start_date: '', end_date: '', notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.roleName === 'ADMIN' || user?.roleName === 'HR';

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [
        api.get('/seniority'),
        api.get('/seniority/work-history'),
        api.get('/employees/simple')
      ];
      if (isAdmin) {
        requests.push(api.get('/departments'));
        requests.push(api.get('/positions'));
      }

      const results = await Promise.all(requests);
      setSeniorityData(results[0].data);
      setWorkHistory(results[1].data);
      setEmployees(results[2].data);
      if (isAdmin && results[3]) setDepartments(results[3].data);
      if (isAdmin && results[4]) setPositions(results[4].data);
    } catch (err) {
      setError('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    setFormData({
      employee_id: employees.length > 0 ? employees[0].id : '',
      department_id: departments.length > 0 ? departments[0].id : '',
      position_id: positions.length > 0 ? positions[0].id : '',
      start_date: '', end_date: '', notes: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/seniority/work-history', formData);
      setSuccess('Thêm lịch sử công tác thành công');
      setModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
      try {
        await api.delete(`/seniority/work-history/${id}`);
        setSuccess('Đã xóa bản ghi');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const getMilestoneStyle = (years) => {
    if (years >= 20) return { bg: 'bg-gradient-to-r from-amber-400 to-yellow-500', text: 'text-white', label: '🏆 20+ năm', shadow: 'shadow-amber-200' };
    if (years >= 15) return { bg: 'bg-gradient-to-r from-purple-500 to-indigo-600', text: 'text-white', label: '💎 15+ năm', shadow: 'shadow-purple-200' };
    if (years >= 10) return { bg: 'bg-gradient-to-r from-blue-500 to-cyan-600', text: 'text-white', label: '⭐ 10+ năm', shadow: 'shadow-blue-200' };
    if (years >= 5) return { bg: 'bg-gradient-to-r from-emerald-500 to-teal-600', text: 'text-white', label: '🎖 5+ năm', shadow: 'shadow-emerald-200' };
    return { bg: 'bg-slate-100', text: 'text-slate-700', label: '', shadow: '' };
  };

  const filteredSeniority = seniorityData.filter(s =>
    !searchTerm || s.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWorkHistory = workHistory.filter(w =>
    !searchTerm || w.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thâm niên & Quá trình Công tác</h2>
          <p className="text-xs text-slate-500">Theo dõi thâm niên làm việc, lịch sử phòng ban và chức vụ nhân viên</p>
        </div>
        {isAdmin && activeTab === 'history' && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Thêm Lịch sử</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Award size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">TỔNG NHÂN SỰ</p>
            <p className="text-xl font-bold text-slate-800">{seniorityData.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><Star size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">THÂM NIÊN 5+ NĂM</p>
            <p className="text-xl font-bold text-slate-800">{seniorityData.filter(s => s.years_of_service >= 5).length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600"><Star size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">THÂM NIÊN 10+ NĂM</p>
            <p className="text-xl font-bold text-slate-800">{seniorityData.filter(s => s.years_of_service >= 10).length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><Briefcase size={24} /></div>
          <div>
            <p className="text-xs font-semibold text-slate-400">LỊCH SỬ CÔNG TÁC</p>
            <p className="text-xl font-bold text-slate-800">{workHistory.length} bản ghi</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('seniority')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'seniority' ? 'text-brand-700 border-b-2 border-brand-700 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center space-x-2"><Award size={16} /><span>Bảng Thâm niên</span></span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'text-brand-700 border-b-2 border-brand-700 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center space-x-2"><MapPin size={16} /><span>Quá trình Công tác</span></span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tìm nhân viên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
          ) : activeTab === 'seniority' ? (
            /* Tab 1: Bảng thâm niên */
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3">Mã NV</th>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Phòng ban / Chức vụ</th>
                  <th className="px-4 py-3">Ngày vào</th>
                  <th className="px-4 py-3 text-center">Thâm niên</th>
                  <th className="px-4 py-3">Mốc vinh danh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSeniority.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-500">Không có dữ liệu</td></tr>
                ) : filteredSeniority.map(emp => {
                  const milestone = getMilestoneStyle(emp.years_of_service);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-brand-700">{emp.code}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">{emp.fullname}</div>
                        <div className="text-xs text-slate-500">{emp.branch_name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-slate-700">{emp.department_name}</div>
                        <div className="text-xs text-slate-500">{emp.position_name}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{emp.join_date ? new Date(emp.join_date).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-lg font-bold text-slate-800">{emp.years_of_service}</span>
                        <span className="text-xs text-slate-500 ml-1">năm {emp.months_remainder > 0 ? `${emp.months_remainder} tháng` : ''}</span>
                      </td>
                      <td className="px-4 py-4">
                        {milestone.label ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${milestone.bg} ${milestone.text} shadow-sm ${milestone.shadow}`}>
                            {milestone.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Tab 2: Quá trình công tác */
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Phòng ban</th>
                  <th className="px-4 py-3">Chức vụ</th>
                  <th className="px-4 py-3">Từ ngày</th>
                  <th className="px-4 py-3">Đến ngày</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkHistory.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-500">Chưa có dữ liệu lịch sử công tác</td></tr>
                ) : filteredWorkHistory.map(wh => (
                  <tr key={wh.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{wh.fullname}</div>
                      <div className="text-xs text-slate-500">{wh.employee_code}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-medium">{wh.department_name || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{wh.position_name || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{wh.start_date ? new Date(wh.start_date).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{wh.end_date ? new Date(wh.end_date).toLocaleDateString('vi-VN') : <span className="text-emerald-600 font-semibold">Hiện tại</span>}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">{wh.notes || '-'}</td>
                    {isAdmin && (
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => handleDelete(wh.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal thêm lịch sử công tác */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">Thêm Lịch sử Công tác</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Phòng ban (*)</label>
                  <select required value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="">-- Chọn --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Chức vụ (*)</label>
                  <select required value={formData.position_id} onChange={e => setFormData({...formData, position_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="">-- Chọn --</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Từ ngày (*)</label>
                  <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Đến ngày (bỏ trống = hiện tại)</label>
                  <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Lý do chuyển, thăng chức..." />
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

export default SeniorityPage;
