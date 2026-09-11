import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Briefcase, Plus, Edit2, Trash2, Search, Power, CheckCircle, AlertTriangle, Users, XCircle, UserCheck, Phone, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DeptPosSettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'ADMIN';

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

  // View Department Employees Modal State
  const [viewDeptEmployeesModalOpen, setViewDeptEmployeesModalOpen] = useState(false);
  const [viewDeptData, setViewDeptData] = useState({ department: null, employees: [] });
  const [viewDeptLoading, setViewDeptLoading] = useState(false);
  const [empSearch, setEmpSearch] = useState('');

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

  const handleViewDeptEmployees = async (dept) => {
    setViewDeptLoading(true);
    setViewDeptData({ department: dept, employees: [] });
    setEmpSearch('');
    setViewDeptEmployeesModalOpen(true);
    try {
      const res = await api.get(`/departments/${dept.id}/employees`);
      if (res.data?.employees && res.data.employees.length > 0) {
        setViewDeptData(res.data);
      } else {
        // Fallback: Lấy danh sách từ /employees và lọc theo phòng ban
        const empRes = await api.get(`/employees?limit=1000`);
        const allList = empRes.data?.data || empRes.data || [];
        const matched = allList.filter(e => 
          Number(e.department_id) === Number(dept.id) ||
          e.department_name === dept.name ||
          e.department_id === dept.name
        );
        setViewDeptData({
          department: dept,
          employees: matched
        });
      }
    } catch (err) {
      console.error('Lỗi tải nhân sự phòng ban, sử dụng fallback:', err);
      try {
        const empRes = await api.get(`/employees?limit=1000`);
        const allList = empRes.data?.data || empRes.data || [];
        const matched = allList.filter(e => 
          Number(e.department_id) === Number(dept.id) ||
          e.department_name === dept.name ||
          e.department_id === dept.name
        );
        setViewDeptData({
          department: dept,
          employees: matched
        });
      } catch (e2) {
        setViewDeptData({ department: dept, employees: [] });
      }
    } finally {
      setViewDeptLoading(false);
    }
  };

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
        setSuccess('Xóa phòng ban thành công');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa phòng ban');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDeletePos = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chức vụ này?')) {
      try {
        await api.delete(`/positions/${id}`);
        setSuccess('Xóa chức vụ thành công');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa chức vụ');
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

  const modalFilteredEmployees = (viewDeptData?.employees || []).filter(e => {
    if (!empSearch) return true;
    const term = empSearch.toLowerCase();
    return (
      (e.fullname && e.fullname.toLowerCase().includes(term)) ||
      (e.code && e.code.toLowerCase().includes(term)) ||
      (e.position_name && e.position_name.toLowerCase().includes(term)) ||
      (e.phone && e.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cơ Cấu Phòng Ban & Chức Vụ</h2>
          <p className="text-xs text-slate-500">
            Sơ đồ cơ cấu tổ chức phòng ban, danh mục chức vụ và nhân sự trực thuộc công ty Việt Á
          </p>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            {activeTab === 'departments' ? (
              <button
                onClick={() => handleOpenDeptModal('create')}
                className="inline-flex items-center space-x-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
              >
                <Plus size={16} />
                <span>Thêm Phòng ban</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenPosModal('create')}
                className="inline-flex items-center space-x-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all"
              >
                <Plus size={16} />
                <span>Thêm Chức vụ</span>
              </button>
            )}
          </div>
        )}
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
      <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 ${
              activeTab === 'departments'
                ? 'border-brand-700 text-brand-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Layers size={18} />
            <span>Danh mục Phòng ban ({departments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 py-4 text-center font-bold text-sm border-b-2 transition-all flex justify-center items-center space-x-2 ${
              activeTab === 'positions'
                ? 'border-brand-700 text-brand-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Briefcase size={18} />
            <span>Danh mục Chức vụ ({positions.length})</span>
          </button>
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'departments' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng ban..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                💡 <span className="font-semibold text-brand-700">Mẹo:</span> Nhấp vào bất kỳ phòng ban nào để xem danh sách nhân sự trực thuộc!
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scroll-x">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-3.5">Tên Phòng ban</th>
                        <th className="px-6 py-3.5">Chi nhánh liên kết</th>
                        <th className="px-6 py-3.5 text-center">Nhân sự hiện tại</th>
                        <th className="px-6 py-3.5 text-center">Trạng thái</th>
                        {isAdmin && <th className="px-6 py-3.5 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {filteredDepts.map(d => (
                        <tr
                          key={d.id}
                          onClick={() => handleViewDeptEmployees(d)}
                          className="hover:bg-brand-50/40 transition-colors cursor-pointer group"
                          title="Nhấp để xem danh sách nhân sự thuộc phòng ban này"
                        >
                          <td className="px-6 py-4 font-bold text-slate-800">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-2 rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-600 group-hover:text-white transition">
                                <Layers size={16} />
                              </div>
                              <div>
                                <span className="group-hover:text-brand-700 transition font-bold">{d.name}</span>
                                <div className="text-[10px] text-brand-600 font-normal opacity-0 group-hover:opacity-100 transition flex items-center space-x-1">
                                  <span>👉 Nhấp xem danh sách nhân sự</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {d.branch_name || <span className="text-slate-400 italic">Không có</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center space-x-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold border border-brand-200 group-hover:bg-brand-700 group-hover:text-white transition shadow-sm">
                              <Users size={13} />
                              <span>{d.employee_count} nhân viên</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
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
                          {isAdmin && (
                            <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenDeptModal('edit', d)}
                                className="text-slate-500 hover:text-brand-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                title="Sửa phòng ban"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleDeptStatus(d)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${d.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                title={d.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteDept(d.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${d.employee_count > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                                disabled={d.employee_count > 0}
                                title={d.employee_count > 0 ? 'Phòng ban đang có nhân sự, không thể xóa' : 'Xóa phòng ban'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredDepts.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-400 italic">
                            Không có kết quả tìm kiếm phòng ban.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Positions */}
        {activeTab === 'positions' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chức vụ..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent border-none focus:ring-0 text-slate-700"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">Lọc phòng ban:</span>
                <select
                  value={posDeptFilter}
                  onChange={(e) => setPosDeptFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-brand-500 font-medium"
                >
                  <option value="">Tất cả phòng ban</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scroll-x">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-6 py-3.5">Tên Chức vụ</th>
                        <th className="px-6 py-3.5">Thuộc Phòng ban</th>
                        <th className="px-6 py-3.5 text-center">Nhân sự hiện tại</th>
                        <th className="px-6 py-3.5 text-center">Trạng thái</th>
                        {isAdmin && <th className="px-6 py-3.5 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {filteredPositions.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-2">
                            <Briefcase size={16} className="text-brand-500" />
                            <span>{p.name}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{p.department_name || <span className="text-slate-400 italic">Chưa xác định</span>}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {p.employee_count || 0} nhân sự
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
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
                          {isAdmin && (
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleOpenPosModal('edit', p)}
                                className="text-slate-500 hover:text-brand-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                title="Sửa chức vụ"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleTogglePosStatus(p)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${p.is_active !== 0 ? 'text-slate-500 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                title={p.is_active !== 0 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => handleDeletePos(p.id)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${(p.employee_count || 0) > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-red-600'}`}
                                disabled={(p.employee_count || 0) > 0}
                                title={(p.employee_count || 0) > 0 ? 'Chức vụ đang có nhân sự, không thể xóa' : 'Xóa chức vụ'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredPositions.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-slate-400 italic">
                            Không có kết quả tìm kiếm chức vụ.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Danh sách Nhân sự thuộc Phòng ban */}
      {viewDeptEmployeesModalOpen && viewDeptData.department && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-5xl lg:max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-brand-800 via-brand-700 to-slate-800 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                  <Layers size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight flex items-center space-x-2">
                    <span>Phòng ban: {viewDeptData.department.name}</span>
                    <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      {viewDeptData.employees?.length || 0} nhân sự
                    </span>
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5 font-medium">
                    {viewDeptData.department.branch_name || 'Văn phòng Trụ sở chính'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDeptEmployeesModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                title="Đóng modal"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
              <div className="flex items-center space-x-2 max-w-md w-full bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên trong phòng ban này (tên, mã, chức vụ, SĐT)..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="outline-none text-xs w-full bg-transparent text-slate-700"
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Hiển thị: <b className="text-brand-700 font-bold">{modalFilteredEmployees.length}</b> / {viewDeptData.employees?.length || 0} nhân sự
              </span>
            </div>

            {/* Modal Body / Table */}
            <div className="p-4 overflow-y-auto flex-1 custom-scroll">
              {viewDeptLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
                </div>
              ) : modalFilteredEmployees.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm">Chưa có nhân sự nào trong phòng ban này.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 overflow-x-auto custom-scroll-x shadow-sm">
                  <table className="w-full text-left text-xs border-collapse min-w-[800px] whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3.5 text-center w-12">STT</th>
                        <th className="px-5 py-3.5">Mã NV & Họ Tên</th>
                        <th className="px-5 py-3.5">Chức vụ</th>
                        <th className="px-4 py-3.5 text-center">Giới tính</th>
                        <th className="px-5 py-3.5">Liên hệ (SĐT / Email)</th>
                        <th className="px-4 py-3.5 text-center">Trạng thái</th>
                        <th className="px-5 py-3.5 text-right">Ngày vào làm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                      {modalFilteredEmployees.map((emp, idx) => (
                        <tr key={emp.id} className="hover:bg-brand-50/30 transition">
                          <td className="px-4 py-3 text-slate-400 font-bold text-center">{idx + 1}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="font-bold text-slate-800 text-sm">
                              {emp.fullname}
                            </div>
                            <span className="text-[10px] text-brand-700 font-mono font-bold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/60 inline-block mt-0.5">
                              {emp.code}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                              {emp.position_name || 'Chưa phân chức vụ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 font-medium whitespace-nowrap">
                            {emp.gender || '-'}
                          </td>
                          <td className="px-5 py-3 space-y-1 whitespace-nowrap">
                            {emp.phone ? (
                              <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                                <Phone size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                            {emp.email && (
                              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px]">
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.email}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block whitespace-nowrap ${
                              emp.status === 'Đang làm việc'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : emp.status === 'Thử việc'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600 font-medium whitespace-nowrap">
                            {emp.join_date ? (
                              <span className="inline-flex items-center space-x-1.5">
                                <Calendar size={12} className="text-slate-400 shrink-0" />
                                <span>{emp.join_date}</span>
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewDeptEmployeesModalOpen(false)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Form Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
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
                  placeholder="Ví dụ: Phòng Marketing"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Chi nhánh trực thuộc</label>
                <select
                  value={deptForm.branch_id}
                  onChange={e => setDeptForm({ ...deptForm, branch_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm mt-1 bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800"
                >
                  <option value="">-- Chọn chi nhánh (tùy chọn) --</option>
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
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
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
