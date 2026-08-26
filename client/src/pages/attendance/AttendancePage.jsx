import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, Clock, Search, Filter, Download, Plus, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().slice(0,10), check_in: '', check_out: '', status: 'Có mặt', note: '' });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?month=${month}&year=${year}`);
      setRecords(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu chấm công');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      setSuccess('Ghi nhận chấm công thành công');
      setModalOpen(false);
      fetchAttendance();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi ghi nhận');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Chấm công</h2>
          <p className="text-xs text-slate-500">Bảng theo dõi giờ vào/ra và chuyên cần</p>
        </div>
        <div className="flex space-x-2">
          {user?.roleName !== 'EMPLOYEE' && (
            <button className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
              <Download size={16} />
              <span>Import Excel</span>
            </button>
          )}
          <button onClick={() => { setFormData({ date: new Date().toISOString().slice(0,10), check_in: '', check_out: '', status: 'Có mặt', note: '' }); setModalOpen(true); }} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Clock size={16} />
            <span>Chấm công tay</span>
          </button>
        </div>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon size={18} className="text-slate-400" />
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
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                {user?.roleName !== 'EMPLOYEE' && <th className="px-4 py-3">Nhân viên</th>}
                <th className="px-4 py-3">Phòng ban</th>
                <th className="px-4 py-3">Giờ vào (Check-in)</th>
                <th className="px-4 py-3">Giờ ra (Check-out)</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">Chưa có dữ liệu chấm công tháng này</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-700">{r.date}</td>
                  {user?.roleName !== 'EMPLOYEE' && (
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{r.fullname}</div>
                      <div className="text-xs text-slate-500">{r.employee_code}</div>
                    </td>
                  )}
                  <td className="px-4 py-4">{r.department_name}</td>
                  <td className="px-4 py-4 font-mono text-emerald-600 font-bold">{r.check_in || '--:--'}</td>
                  <td className="px-4 py-4 font-mono text-brand-600 font-bold">{r.check_out || '--:--'}</td>
                  <td className="px-4 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.status === 'Có mặt' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Đi trễ' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">Chấm công thủ công</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Ngày</label>
                <input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Giờ vào</label>
                  <input type="time" value={formData.check_in} onChange={e=>setFormData({...formData, check_in: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Giờ ra</label>
                  <input type="time" value={formData.check_out} onChange={e=>setFormData({...formData, check_out: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none">
                  <option value="Có mặt">Có mặt</option>
                  <option value="Đi trễ">Đi trễ</option>
                  <option value="Về sớm">Về sớm</option>
                  <option value="Vắng mặt">Vắng mặt</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                <input type="text" value={formData.note} onChange={e=>setFormData({...formData, note: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
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

export default AttendancePage;
