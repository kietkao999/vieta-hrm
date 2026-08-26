import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, CheckCircle, Search, Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const KpiPage = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'evaluate'
  const [selectedKpi, setSelectedKpi] = useState(null);
  
  const [formData, setFormData] = useState({ 
    employee_id: '', criteria: '', target_score: 100, achieved_score: 0, evaluator_comments: '', status: 'Chưa đánh giá' 
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, empRes] = await Promise.all([
        api.get(`/kpi?month=${month}&year=${year}`),
        api.get('/employees/simple')
      ]);
      setKpis(kpiRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu KPI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedKpi(null);
    setFormData({ 
      employee_id: employees.length > 0 ? employees[0].id : '', 
      criteria: '', target_score: 100, achieved_score: 0, evaluator_comments: '', status: 'Chưa đánh giá'
    });
    setModalOpen(true);
  };

  const handleOpenEvaluate = (kpi) => {
    setModalType('evaluate');
    setSelectedKpi(kpi);
    setFormData({
      employee_id: kpi.employee_id,
      criteria: kpi.criteria,
      target_score: kpi.target_score,
      achieved_score: kpi.achieved_score || 0,
      evaluator_comments: kpi.evaluator_comments || '',
      status: kpi.status || 'Chưa đánh giá'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/kpi', { ...formData, month, year });
        setSuccess('Giao KPI thành công');
      } else {
        await api.put(`/kpi/${selectedKpi.id}`, formData);
        setSuccess('Đánh giá KPI thành công');
      }
      setModalOpen(false);
      fetchData();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa KPI này?')) {
      try {
        await api.delete(`/kpi/${id}`);
        setSuccess('Đã xóa KPI');
        fetchData();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý KPI & Đánh giá</h2>
          <p className="text-xs text-slate-500">Thiết lập mục tiêu và đánh giá hiệu suất nhân viên</p>
        </div>
        {(user?.roleName === 'ADMIN' || user?.roleName === 'HR' || user?.roleName === 'MANAGER') && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Giao KPI Mới</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
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
          <table className="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3 w-1/3">Tiêu chí KPI</th>
                <th className="px-4 py-3 text-center">Mục tiêu</th>
                <th className="px-4 py-3 text-center">Đạt được</th>
                <th className="px-4 py-3 text-center">Tiến độ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpis.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">Chưa có KPI nào tháng {month}/{year}</td></tr>
              ) : kpis.map(k => {
                const percent = Math.min(100, Math.round((k.achieved_score / k.target_score) * 100)) || 0;
                return (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{k.fullname}</div>
                      <div className="text-xs text-slate-500">{k.department_name}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-medium">
                      {k.criteria}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-600">{k.target_score}</td>
                    <td className="px-4 py-4 text-center font-bold text-brand-700">{k.achieved_score}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[80px]">
                          <div className={`h-2.5 rounded-full ${percent >= 100 ? 'bg-emerald-500' : percent >= 50 ? 'bg-brand-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{percent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                        k.status === 'Đã đánh giá' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right space-x-2">
                      {(user?.roleName === 'ADMIN' || user?.roleName === 'HR' || user?.roleName === 'MANAGER') && (
                        <>
                          <button onClick={() => handleOpenEvaluate(k)} className="text-brand-600 hover:text-brand-800 text-xs border border-brand-200 px-2 py-1 rounded bg-brand-50 font-semibold shadow-sm">
                            Đánh giá
                          </button>
                          <button onClick={() => handleDelete(k.id)} className="text-slate-400 hover:text-red-600 ml-2"><Trash2 size={16}/></button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Giao KPI Mới' : 'Đánh giá KPI'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {modalType === 'create' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                    <select required value={formData.employee_id} onChange={e=>setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tiêu chí KPI (*)</label>
                    <textarea required rows="3" value={formData.criteria} onChange={e=>setFormData({...formData, criteria: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Ví dụ: Đạt doanh số 100 triệu, Hoàn thành dự án A..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Điểm mục tiêu</label>
                    <input type="number" required value={formData.target_score} onChange={e=>setFormData({...formData, target_score: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-50 p-3 rounded-lg text-sm mb-4">
                    <p className="font-semibold text-slate-700">Tiêu chí: <span className="font-normal text-slate-600">{formData.criteria}</span></p>
                    <p className="font-semibold text-slate-700">Mục tiêu: <span className="font-bold text-brand-700">{formData.target_score}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Điểm đạt được</label>
                      <input type="number" required value={formData.achieved_score} onChange={e=>setFormData({...formData, achieved_score: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none font-bold text-brand-700" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                      <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                        <option value="Chưa đánh giá">Chưa đánh giá</option>
                        <option value="Đã đánh giá">Đã đánh giá</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Nhận xét của quản lý</label>
                    <textarea rows="3" value={formData.evaluator_comments} onChange={e=>setFormData({...formData, evaluator_comments: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Nhận xét về kết quả thực hiện..." />
                  </div>
                </>
              )}

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

export default KpiPage;
