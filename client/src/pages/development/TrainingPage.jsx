import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Calendar, DollarSign, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TrainingPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [formData, setFormData] = useState({ 
    course_name: '', provider: '', start_date: '', end_date: '', cost: 0, status: 'Lên kế hoạch', notes: '' 
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/training');
      setCourses(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu khóa đào tạo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedCourse(null);
    setFormData({ 
      course_name: '', provider: '', start_date: '', end_date: '', cost: 0, status: 'Lên kế hoạch', notes: '' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setModalType('edit');
    setSelectedCourse(course);
    setFormData({
      course_name: course.course_name,
      provider: course.provider || '',
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      cost: course.cost || 0,
      status: course.status || 'Lên kế hoạch',
      notes: course.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/training', formData);
        setSuccess('Tạo khóa đào tạo thành công');
      } else {
        await api.put(`/training/${selectedCourse.id}`, formData);
        setSuccess('Cập nhật khóa đào tạo thành công');
      }
      setModalOpen(false);
      fetchCourses();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khóa đào tạo này?')) {
      try {
        await api.delete(`/training/${id}`);
        setSuccess('Đã xóa khóa học');
        fetchCourses();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Đào tạo</h2>
          <p className="text-xs text-slate-500">Khóa học và chương trình nâng cao năng lực</p>
        </div>
        {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Thêm Khóa học</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">Không có khóa đào tạo nào</div>
        ) : courses.map(course => (
          <div key={course.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col h-full relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${
              course.status === 'Đang diễn ra' ? 'bg-emerald-500' : 
              course.status === 'Đã hoàn thành' ? 'bg-brand-500' : 'bg-amber-400'
            }`}></div>
            
            <h3 className="font-bold text-lg text-slate-800 pr-4 mb-2 leading-tight">{course.course_name}</h3>
            
            <div className="space-y-2 flex-grow mt-2">
              <div className="flex items-start space-x-2 text-sm text-slate-600">
                <BookOpen size={16} className="mt-0.5 text-slate-400 shrink-0"/>
                <span>Đơn vị tổ chức: <span className="font-semibold">{course.provider || 'Nội bộ'}</span></span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400 shrink-0"/>
                <span>{course.start_date || 'Chưa xác định'} <span className="text-slate-400">đến</span> {course.end_date || 'Chưa xác định'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <DollarSign size={16} className="text-slate-400 shrink-0"/>
                <span className="font-semibold text-brand-700">{formatVND(course.cost)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
               <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                course.status === 'Đang diễn ra' ? 'bg-emerald-100 text-emerald-700' :
                course.status === 'Đã hoàn thành' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {course.status}
              </span>
              {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenEdit(course)} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(course.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Thêm Khóa Đào tạo' : 'Cập nhật Khóa Đào tạo'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Tên khóa học (*)</label>
                  <input required type="text" value={formData.course_name} onChange={e=>setFormData({...formData, course_name: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Đơn vị tổ chức</label>
                  <input type="text" value={formData.provider} onChange={e=>setFormData({...formData, provider: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" placeholder="Nội bộ hoặc tên đối tác..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ngày bắt đầu</label>
                  <input type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ngày kết thúc</label>
                  <input type="date" value={formData.end_date} onChange={e=>setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Chi phí (VND)</label>
                  <input type="number" value={formData.cost} onChange={e=>setFormData({...formData, cost: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="Lên kế hoạch">Lên kế hoạch</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                  <textarea rows="2" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" />
                </div>
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

export default TrainingPage;
