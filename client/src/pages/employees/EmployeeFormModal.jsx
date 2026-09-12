import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Briefcase, DollarSign, X } from 'lucide-react';

const TIER_OPTIONS = [
  { label: 'Tầng 1 - Nhân viên mới (< 1 năm: 4.500.000 đ)', value: 'Tầng 1', salary: 4500000, kpi: 1000000 },
  { label: 'Tầng 2 - Chuyên viên (1-3 năm: 5.000.000 đ)', value: 'Tầng 2', salary: 5000000, kpi: 1000000 },
  { label: 'Tầng 3 - Chuyên viên cao cấp (≥ 3 năm: 5.500.000 đ)', value: 'Tầng 3', salary: 5500000, kpi: 1000000 },
  { label: 'Tầng 4 - Phó phòng / Phó Quản lý (6.000.000 đ)', value: 'Tầng 4', salary: 6000000, kpi: 1500000 },
  { label: 'Tầng 5 - Trưởng phòng / Quản lý (6.500.000 đ)', value: 'Tầng 5', salary: 6500000, kpi: 2000000 },
  { label: 'Tầng 6 - Phó Giám đốc (8.000.000 đ)', value: 'Tầng 6', salary: 8000000, kpi: 2500000 },
  { label: 'Tầng 7 - Giám đốc (9.500.000 đ)', value: 'Tầng 7', salary: 9500000, kpi: 0 }
];

const GRADE_OPTIONS = Array.from({ length: 21 }, (_, i) => ({
  label: i === 0 ? 'Bậc 0 (0 đ)' : `Bậc ${i} (${new Intl.NumberFormat('vi-VN').format(i * 400000)} đ)`,
  value: `Bậc ${i}`,
  salary: i * 400000
}));

const formatInputNumber = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  const clean = String(val).replace(/\D/g, '');
  if (clean === '') return '';
  const num = parseInt(clean, 10);
  return new Intl.NumberFormat('vi-VN').format(num);
};

const EmployeeFormModal = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    fullname: '',
    email: '',
    phone: '',
    cccd: '',
    dob: '',
    gender: '',
    address: '',
    join_date: '',
    branch_id: '',
    department_id: '',
    position_id: '',
    manager_id: '',
    status: 'Đang làm việc',
    contract_type: 'Không xác định thời hạn',
    tier: '',
    grade: 'Bậc 1',
    tier_salary: '',
    grade_salary: '',
    base_salary: '',
    allowance: '',
    kpi_bonus: '',
    notes: ''
  });

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterByDept, setFilterByDept] = useState(true);

  const filteredDepartmentsOptions = departments.filter(d => {
    return d.is_active !== 0 || (employee && Number(employee.department_id) === Number(d.id));
  });

  const filteredPositionsOptions = positions.filter(p => {
    const isAllowedStatus = p.is_active !== 0 || (employee && Number(employee.position_id) === Number(p.id));
    if (!isAllowedStatus) return false;
    if (formData.department_id && filterByDept) {
      return Number(p.department_id) === Number(formData.department_id);
    }
    return true;
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [bRes, dRes, pRes, mRes] = await Promise.all([
          api.get('/branches'),
          api.get('/departments'),
          api.get('/positions'),
          api.get('/employees/simple')
        ]);
        setBranches(bRes.data || []);
        setDepartments(dRes.data || []);
        setPositions(pRes.data || []);
        setManagers(mRes.data || []);
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
        status: employee.status || 'Đang làm việc',
        contract_type: employee.contract_type || 'Không xác định thời hạn',
        tier: employee.tier || '',
        grade: employee.grade || 'Bậc 1',
        tier_salary: employee.tier_salary ?? '',
        grade_salary: employee.grade_salary ?? '',
        base_salary: employee.base_salary ?? '',
        allowance: employee.allowance ?? '',
        kpi_bonus: employee.kpi_bonus ?? '',
        notes: employee.notes || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto set tier_salary and kpi_bonus if tier changes
      if (name === 'tier') {
        const matched = TIER_OPTIONS.find(t => t.value === value || t.label === value);
        if (matched) {
          updated.tier_salary = matched.salary.toString();
          if (matched.kpi > 0) {
            updated.kpi_bonus = matched.kpi.toString();
          }
          const gSalary = parseFloat(prev.grade_salary) || 0;
          updated.base_salary = (matched.salary + gSalary).toString();
        }
      }

      // Auto compute grade_salary if grade changes (mỗi bậc = 400.000 đ)
      if (name === 'grade') {
        const bacNum = parseInt(value.replace(/\D/g, '')) || 0;
        const gSalary = bacNum * 400000;
        updated.grade_salary = gSalary ? gSalary.toString() : '0';
        const tSalary = parseFloat(updated.tier_salary || prev.tier_salary) || 0;
        if (tSalary || gSalary) {
          updated.base_salary = (tSalary + gSalary).toString();
        }
      }

      // Auto compute base_salary if tier_salary or grade_salary is changed
      if (name === 'tier_salary' || name === 'grade_salary') {
        const tSalary = parseFloat(name === 'tier_salary' ? value : (updated.tier_salary || prev.tier_salary)) || 0;
        const gSalary = parseFloat(name === 'grade_salary' ? value : (updated.grade_salary || prev.grade_salary)) || 0;
        if (tSalary || gSalary) {
          updated.base_salary = (tSalary + gSalary).toString();
        }
      }

      return updated;
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-auto transform transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {employee ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}
            </h3>
            <p className="text-xs text-slate-300">
              {employee ? `Cập nhật thông tin cho ${employee.fullname} (${employee.code})` : 'Nhập thông tin nhân sự và thiết lập mức lương, KPI'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {error && <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Nhóm 1: Thông tin cá nhân */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center space-x-2 text-brand-800 font-bold text-sm border-b pb-2">
              <User size={16} className="text-brand-600" />
              <span>1. Thông tin cơ bản & Cá nhân</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Mã NV (*)</label>
                <input required name="code" value={formData.code} onChange={handleChange} placeholder="VD: VietA 058" className="w-full border rounded-lg p-2 text-xs font-mono font-bold mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Họ và tên (*)</label>
                <input required name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Nguyễn Văn A" className="w-full border rounded-lg p-2 text-xs font-semibold mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Giới tính</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Ngày sinh</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Số CMND / CCCD</label>
                <input name="cccd" value={formData.cccd} onChange={handleChange} placeholder="079..." className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="090..." className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email liên hệ</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@vieta.vn" className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Địa chỉ thường trú / Nơi ở</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
            </div>
          </div>

          {/* Nhóm 2: Thông tin công việc & Vị trí */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm border-b pb-2">
              <Briefcase size={16} className="text-blue-600" />
              <span>2. Công việc & Vị trí</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Chi nhánh công tác</label>
                <select name="branch_id" value={formData.branch_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Phòng ban</label>
                <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="">-- Chọn phòng ban --</option>
                  {filteredDepartmentsOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Chức vụ</label>
                  {formData.department_id && (
                    <label className="flex items-center space-x-1 text-[10px] text-slate-500 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filterByDept} 
                        onChange={(e) => setFilterByDept(e.target.checked)} 
                        className="rounded text-brand-700" 
                      />
                      <span>Lọc theo phòng</span>
                    </label>
                  )}
                </div>
                <select name="position_id" value={formData.position_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="">-- Chọn chức vụ --</option>
                  {filteredPositionsOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Quản lý trực tiếp</label>
                <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="">-- Không có / Ban Giám đốc --</option>
                  {managers.map(m => <option key={m.id} value={m.id}>{m.fullname} ({m.code})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Ngày vào làm</label>
                <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Trạng thái làm việc</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs font-semibold mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                  <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Loại hợp đồng</label>
                <select name="contract_type" value={formData.contract_type} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none">
                  <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                  <option value="Xác định thời hạn 1 năm">Xác định thời hạn 1 năm</option>
                  <option value="Xác định thời hạn 3 năm">Xác định thời hạn 3 năm</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Thời vụ">Thời vụ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nhóm 3: Chế độ Lương & KPI */}
          <div className="rounded-xl border border-emerald-200 p-4 bg-emerald-50/30 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm border-b border-emerald-100 pb-2">
              <DollarSign size={16} className="text-emerald-700" />
              <span>3. Chế độ Lương & KPI (Theo cơ chế công ty)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Tầng nhân sự (Thông báo 18)</label>
                <select name="tier" value={formData.tier} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none font-semibold text-blue-900">
                  <option value="">-- Chọn tầng --</option>
                  {TIER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Bậc chuyên môn (+400k/bậc)</label>
                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none font-semibold text-indigo-900">
                  {GRADE_OPTIONS.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Lương theo tầng (VND)</label>
                <input
                  type="text"
                  name="tier_salary"
                  value={formatInputNumber(formData.tier_salary)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'tier_salary', value: raw } });
                  }}
                  placeholder="VD: 8.000.000"
                  className="w-full border rounded-lg p-2 text-xs font-bold text-slate-800 mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Lương theo bậc (VND)</label>
                <input
                  type="text"
                  name="grade_salary"
                  value={formatInputNumber(formData.grade_salary)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'grade_salary', value: raw } });
                  }}
                  placeholder="VD: 1.200.000"
                  className="w-full border rounded-lg p-2 text-xs font-bold text-slate-800 mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Tổng Lương cơ bản (VND)</label>
                <input
                  type="text"
                  name="base_salary"
                  value={formatInputNumber(formData.base_salary)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'base_salary', value: raw } });
                  }}
                  placeholder="VD: 9.200.000"
                  className="w-full border rounded-lg p-2 text-xs font-bold text-emerald-800 mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Định mức Thưởng KPI Trách nhiệm (VND)</label>
                <input
                  type="text"
                  name="kpi_bonus"
                  value={formatInputNumber(formData.kpi_bonus)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'kpi_bonus', value: raw } });
                  }}
                  placeholder="VD: 2.000.000"
                  className="w-full border border-blue-300 rounded-lg p-2 text-xs font-bold text-blue-800 mt-1 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Phụ cấp khác (VND)</label>
                <input
                  type="text"
                  name="allowance"
                  value={formatInputNumber(formData.allowance)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'allowance', value: raw } });
                  }}
                  placeholder="0"
                  className="w-full border rounded-lg p-2 text-xs font-bold text-slate-700 mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Ghi chú bổ sung</label>
                <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Ghi chú về hợp đồng, điều chuyển, bảo hiểm..." className="w-full border rounded-lg p-2 text-xs mt-1 bg-white focus:ring-2 focus:ring-brand-400 outline-none" />
              </div>
            </div>
          </div>

          {/* Nhóm 4: Ghi nhận nhanh Khen thưởng / Kỷ luật (Chỉ hiển thị khi chỉnh sửa nhân viên) */}
          {employee && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <span>4. Quyết định Khen thưởng & Kỷ luật</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Dữ liệu được lưu độc lập vào hồ sơ thi đua & kỷ luật của nhân sự
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-600 font-medium">Bạn có thể thêm trực tiếp quyết định khen thưởng / kỷ luật từ Modal Chi tiết hoặc các menu chức năng riêng.</span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-700 text-white rounded-xl text-xs font-bold hover:bg-brand-800 shadow-md transition disabled:opacity-50">
              {loading ? 'Đang lưu...' : employee ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
