import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, Plus, Edit2, Trash2, Key, Search, CheckCircle, XCircle } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isActive, setIsActive] = useState(1);

  // Danh sách nhân viên cố định để liên kết tài khoản trong Giai đoạn 1
  const employeesList = [
    { id: 1, fullname: 'Nguyễn Văn Quyết (NV0001) - Admin' },
    { id: 2, fullname: 'Lê Thị Thu Hương (NV0002) - HR' },
    { id: 3, fullname: 'Phạm Tấn Hưng (NV0003) - Trưởng phòng Kinh doanh' },
    { id: 4, fullname: 'Nguyễn Hoàng Nam (NV0004) - Nhân viên' },
    { id: 5, fullname: 'Võ Minh Cường (NV0005) - Phó Giám Đốc' }
  ];

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleOpenCreateModal = () => {
    setModalType('create');
    setSelectedUser(null);
    setUsername('');
    setPassword('');
    setRoleId(roles[3]?.id || '4'); // Mặc định role EMPLOYEE
    setEmployeeId('');
    setIsActive(1);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(''); // Để trống nếu không muốn đổi
    setRoleId(user.role_id.toString());
    setEmployeeId(user.employee_id ? user.employee_id.toString() : '');
    setIsActive(user.is_active);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalType === 'create') {
        await api.post('/users', {
          username,
          password,
          role_id: parseInt(roleId),
          employee_id: employeeId ? parseInt(employeeId) : null
        });
        setSuccess('Tạo tài khoản người dùng thành công.');
      } else {
        await api.put(`/users/${selectedUser.id}`, {
          role_id: parseInt(roleId),
          employee_id: employeeId ? parseInt(employeeId) : null,
          is_active: parseInt(isActive),
          password: password.trim() !== '' ? password : null
        });
        setSuccess('Cập nhật tài khoản người dùng thành công.');
      }
      
      // Load lại danh sách
      await fetchUsersAndRoles();
      
      // Đóng modal sau 1 giây
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu thông tin.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await api.delete(`/users/${id}`);
        setSuccess('Xóa tài khoản thành công.');
        fetchUsersAndRoles();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa tài khoản.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.employeeName && user.employeeName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Tài khoản & Phân quyền</h2>
          <p className="text-xs text-slate-500">Xem danh sách, cấp quyền truy cập hệ thống và cấu hình trạng thái hoạt động.</p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center space-x-2 max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tài khoản, nhân viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="outline-none text-sm w-full bg-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Tên đăng nhập</th>
                  <th className="px-6 py-3">Quyền hệ thống</th>
                  <th className="px-6 py-3">Nhân sự liên kết</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">{u.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.roleName === 'ADMIN' ? 'bg-red-50 text-red-600' :
                        u.roleName === 'HR' ? 'bg-blue-50 text-blue-600' :
                        u.roleName === 'MANAGER' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {u.roleDisplayName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.employeeName ? (
                        <div>
                          <p className="font-semibold text-slate-700">{u.employeeName}</p>
                          <span className="text-[10px] text-slate-400">{u.employeeCode}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa liên kết</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                          <CheckCircle size={14} />
                          <span>Đang hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 font-semibold">
                          <XCircle size={14} />
                          <span>Đã khóa</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="rounded p-1 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Chỉnh sửa tài khoản"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded p-1 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 italic">Không tìm thấy tài khoản phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              {modalType === 'create' ? 'TẠO MỚI TÀI KHOẢN' : 'CHỈNH SỬA TÀI KHOẢN'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">TÊN ĐĂNG NHẬP</label>
                <input
                  type="text"
                  required
                  disabled={modalType === 'edit'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-400"
                  placeholder="Ví dụ: nguyen_van_a"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">
                  {modalType === 'edit' ? 'MẬT KHẨU MỚI (ĐỂ TRỐNG NẾU KHÔNG ĐỔI)' : 'MẬT KHẨU'}
                </label>
                <input
                  type="password"
                  required={modalType === 'create'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">QUYỀN HỆ THỐNG</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.display_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">LIÊN KẾT HỒ SƠ NHÂN VIÊN</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">-- Không liên kết --</option>
                  {employeesList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullname}</option>
                  ))}
                </select>
              </div>

              {modalType === 'edit' && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive === 1}
                    onChange={(e) => setIsActive(e.target.checked ? 1 : 0)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-700">
                    Kích hoạt tài khoản
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-750 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800 shadow cursor-pointer bg-brand-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
