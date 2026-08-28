import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Briefcase, Plus, Edit2, Trash2, Search, Power, CheckCircle, AlertTriangle } from 'lucide-react';

const DeptPosSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptModalType, setDeptModalType] = useState('create');
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', branch_id: '' });

  const [posModalOpen, setPosModalOpen] = useState(false);
  const [posModalType, setPosModalType] = useState('create');
  const [selectedPos, setSelectedPos] = useState(null);
  const [posForm, setPosForm] = useState({ name: '', department_id: '' });

  // Filters & Search
  const [deptSearch, setDeptSearch] = useState('');
  const [posSearch, setPosSearch] = useState('');
  const [posDeptFilter, setPosDeptFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, branchRes] = await Promise.all([
        api.get('/departments'),
        api.get('/positions'),
        api.get('/branches')
      ]);
      setDepartments(deptRes.data);
      setPositions(posRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleDeptStatus = async (dept) => {
    try {
      const newStatus = dept.is_active === 0 ? 1 : 0;
      await api.put(`/departments/${dept.id}`, {
        name: dept.name,
        branch_id: dept.branch_id,
        is_active: newStatus
      });
      setSuccess(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} phòng ban thành công`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTogglePosStatus = async (pos) => {
    try {
      const newStatus = pos.is_active === 0 ? 1 : 0;
      await api.put(`/positions/${pos.id}`, {
        name: pos.name,
        department_id: pos.department_id,
        is_active: newStatus
      });
      setSuccess(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} chức vụ thành công`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi thao tác trạng thái');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenDeptModal = (type, dept = null) => {
    setDeptModalType(type);
    setSelectedDept(dept);
    if (type === 'create') {
      setDeptForm({ name: '', branch_id: branches.length > 0 ? branches[0].id : '' });
    } else {
      setDeptForm({ name: dept.name, branch_id: dept.branch_id || '' });
    }
    setDeptModalOpen(true);
  };

  const handleOpenPosModal = (type, pos = null) => {
    setPosModalType(type);
    setSelectedPos(pos);
    if (type === 'create') {
      setPosForm({ name: '', department_id: departments.length > 0 ? departments[0].id : '' });
    } else {
      setPosForm({ name: pos.name, department_id: pos.department_id || '' });
    }
    setPosModalOpen(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      if (deptModalType === 'create') {
        await api.post('/departments', deptForm);
        setSuccess('Thêm phòng ban thành công');
      } else {
        await api.put(`/departments/${selectedDept.id}`, {
          ...deptForm,
          is_active: selectedDept.is_active
        });
        setSuccess('Cập nhật phòng ban thành công');
      }
      setDeptModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePosSubmit = async (e) => {
    e.preventDefault();
    try {
      if (posModalType === 'create') {
        await api.post('/positions', posForm);
        setSuccess('Thêm chức vụ thành công');
      } else {
        await api.put(`/positions/${selectedPos.id}`, {
          ...posForm,
          is_active: selectedPos.is_active
        });
        setSuccess('Cập nhật chức vụ thành công');
      }
      setPosModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) {
      try {
        await api.delete(`/departments/${id}`);
        setSuccess('Xóa thành công phòng ban');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDeletePos = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) {
      try {
        await api.delete(`/positions/${id}`);
        setSuccess('Xóa thành công chức vụ');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi xóa');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredPositions = positions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesDept = posDeptFilter ? Number(p.department_id) === Number(posDeptFilter) : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cấu hình Phòng ban & Chức vụ</h2>
          <p className="text-xs text-slate-500">Quản lý danh mục phòng ban, chức vụ dùng chung cho toàn công ty Việt Á</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'departments' ? (
            <button
              onClick={() => handleOpenDeptModal('create')}
              className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
            >
              <Plus size={16} />
              <span>Thêm Phòng ban</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenPosModal('create')}
              className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
            >
              <Plus size={16} />
              <span>Thêm Chức vụ</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-800 animate-fadeIn">
          <AlertTriangle size={18} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 ${
              activeTab === 'departments'
                ? 'border-brand-600 text-brand-700 bg-brand-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <Layers size={18} />
            <span>Danh mục Phòng ban ({departments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 ${
              activeTab === 'positions'
                ? 'border-brand-600 text-brand-700 bg-brand-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <Briefcase size={18} />
            <span>Danh mục Chức vụ ({positions.length})</span>
          </button>
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'departments' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng ban..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100">
              {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
              ) : (
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5">Tên Phòng ban</th>
                      <th className="px-6 py-3.5">Chi nhánh liên kết</th>
                      <th className="px-6 py-3.5">Nhân sự hiện tại</th>
                      <th className="px-6 py-3.5">Trạng thái</th>
                      <th className="px-6 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                    {filteredDepts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-2 whitespace-nowrap">
                          <Layers size={16} className="text-brand-500" />
                          <span>{d.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{d.branch_name || <span className="text-slate-400 italic">Không có</span>}</td>
                        <td className="px-6 py-4">
                          <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-bold border border-brand-100">
                            {d.employee_count} nhân viên
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {d.is_active !== 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Vô hiệu hóa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleOpenDeptModal('edit', d)}
                            className="text-slate-500 hover:text-brand-600 transition-colors"
                            title="Sửa phòng ban"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleDeptStatus(d)}
                            className={`transition-colors ${d.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                            title={d.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(d.id)}
                            className={`transition-colors ${d.employee_count > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                            disabled={d.employee_count > 0}
                            title={d.employee_count > 0 ? 'Phòng ban đang có nhân sự, không thể xóa' : 'Xóa phòng ban'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredDepts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 italic">Không có kết quả tìm kiếm phòng ban.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Positions */}
        {activeTab === 'positions' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center space-x-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chức vụ..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
                />
              </div>
              <div className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <select
                  value={posDeptFilter}
                  onChange={(e) => setPosDeptFilter(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-600 p-1"
                >
                  <option value="">-- Tất cả phòng ban --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-100">
              {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
              ) : (
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b whitespace-nowrap">
                    <tr>
                      <th className="px-6 py-3.5">Tên Chức vụ</th>
                      <th className="px-6 py-3.5">Thuộc Phòng ban</th>
                      <th className="px-6 py-3.5">Nhân sự hiện tại</th>
                      <th className="px-6 py-3.5">Trạng thái</th>
                      <th className="px-6 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                    {filteredPositions.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-2 whitespace-nowrap">
                          <Briefcase size={16} className="text-brand-500" />
                          <span>{p.name}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{p.department_name || <span className="text-slate-400 italic">Chưa gán</span>}</td>
                        <td className="px-6 py-4">
                          <span className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full text-xs font-bold border border-brand-100">
                            {p.employee_count} nhân viên
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.is_active !== 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Vô hiệu hóa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button
                            onClick={() => handleOpenPosModal('edit', p)}
                            className="text-slate-500 hover:text-brand-600 transition-colors"
                            title="Sửa chức vụ"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleTogglePosStatus(p)}
                            className={`transition-colors ${p.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                            title={p.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePos(p.id)}
                            className={`transition-colors ${p.employee_count > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                            disabled={p.employee_count > 0}
                            title={p.employee_count > 0 ? 'Chức vụ đang có nhân sự, không thể xóa' : 'Xóa chức vụ'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPositions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 italic">Không có kết quả tìm kiếm chức vụ.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Department Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 border border-slate-100 animate-scaleUp">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
              {deptModalType === 'create' ? 'Thêm Phòng ban mới' : 'Cập nhật Phòng ban'}
            </h3>
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tên phòng ban (*)</label>
                <input
                  required
                  type="text"
                  value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="Ví dụ: Xưởng sản xuất nệm"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Thuộc chi nhánh</label>
                <select
                  value={deptForm.branch_id}
                  onChange={e => setDeptForm({ ...deptForm, branch_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                >
                  <option value="">-- Không chọn --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-700 text-white font-semibold rounded-lg text-sm hover:bg-brand-800 shadow"
                >
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {posModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 border border-slate-100 animate-scaleUp">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">
              {posModalType === 'create' ? 'Thêm Chức vụ mới' : 'Cập nhật Chức vụ'}
            </h3>
            <form onSubmit={handlePosSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Tên chức vụ (*)</label>
                <input
                  required
                  type="text"
                  value={posForm.name}
                  onChange={e => setPosForm({ ...posForm, name: e.target.value })}
                  placeholder="Ví dụ: Nhân viên may viền"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Thuộc phòng ban (*)</label>
                <select
                  required
                  value={posForm.department_id}
                  onChange={e => setPosForm({ ...posForm, department_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setPosModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-700 text-white font-semibold rounded-lg text-sm hover:bg-brand-800 shadow"
                >
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptPosSettingsPage;
