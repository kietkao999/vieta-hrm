import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EmployeeFormModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '', fullname: '', email: '', phone: '', cccd: '', 
    dob: '', gender: '', address: '', join_date: '',
    branch_id: '', department_id: '', position_id: '', manager_id: '',
    status: 'Thử việc', contract_type: '', base_salary: '', allowance: '', notes: ''
  });

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bRes, dRes, pRes, mRes] = await Promise.all([
          api.get('/branches'),
          api.get('/departments'),
          api.get('/positions'),
          api.get('/employees/simple')
        ]);
        setBranches(bRes.data);
        setDepartments(dRes.data);
        setPositions(pRes.data);
        setManagers(mRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOptions();

    if (employee) {
      setFormData({
        code: employee.code || '',
        fullname: employee.fullname || '',
        email: employee.email || '',
        phone: employee.phone || '',
        cccd: employee.cccd || '',
        dob: employee.dob || '',
        gender: employee.gender || '',
        address: employee.address || '',
        join_date: employee.join_date || '',
        branch_id: employee.branch_id || '',
        department_id: employee.department_id || '',
        position_id: employee.position_id || '',
        manager_id: employee.manager_id || '',
        status: employee.status || 'Thử việc',
        contract_type: employee.contract_type || '',
        base_salary: employee.base_salary || '',
        allowance: employee.allowance || '',
        notes: employee.notes || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (employee) {
        await api.put(`/employees/${employee.id}`, formData);
        onSuccess('Cập nhật nhân viên thành công');
      } else {
        await api.post('/employees', formData);
        onSuccess('Thêm nhân viên thành công');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 overflow-y-auto py-10">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="font-bold text-xl mb-4 border-b pb-2">
          {employee ? 'Sửa Hồ sơ Nhân viên' : 'Thêm Nhân viên Mới'}
        </h3>
        
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Thông tin cá nhân */}
          <div>
            <h4 className="font-semibold text-brand-700 mb-3">Thông tin cá nhân</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Mã NV (*)</label>
                <input required name="code" value={formData.code} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Họ và tên (*)</label>
                <input required name="fullname" value={formData.fullname} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Ngày sinh</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Số CCCD</label>
                <input name="cccd" value={formData.cccd} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Điện thoại</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Địa chỉ</label>
                <input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            </div>
          </div>

          {/* Thông tin công việc */}
          <div>
            <h4 className="font-semibold text-brand-700 mb-3">Thông tin công việc</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Chi nhánh</label>
                <select name="branch_id" value={formData.branch_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Phòng ban</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Chức vụ</label>
                <select name="position_id" value={formData.position_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn chức vụ --</option>
                  {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Quản lý trực tiếp</label>
                <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Không có --</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.fullname} - {m.code}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Ngày vào làm</label>
                <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="Thử việc">Thử việc</option>
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Loại hợp đồng</label>
                <select name="contract_type" value={formData.contract_type} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                  <option value="">-- Chọn loại --</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Xác định thời hạn 1 năm">Xác định thời hạn 1 năm</option>
                  <option value="Xác định thời hạn 3 năm">Xác định thời hạn 3 năm</option>
                  <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                  <option value="Thời vụ">Thời vụ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Lương cơ bản (VND)</label>
                <input type="number" name="base_salary" value={formData.base_salary} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Phụ cấp (VND)</label>
                <input type="number" name="allowance" value={formData.allowance} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-slate-500">Ghi chú</label>
                <input name="notes" value={formData.notes} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-bold hover:bg-brand-800 disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Lưu Hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;

