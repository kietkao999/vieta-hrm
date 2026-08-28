import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, AlertTriangle, Plus, Search, Filter, Edit2, Trash2, Upload, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ContractPage = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedContract, setSelectedContract] = useState(null);
  
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({ 
    employee_id: '', contract_number: '', type: 'Xác định thời hạn 1 năm', 
    start_date: '', end_date: '', basic_salary: '', status: 'Có hiệu lực', notes: '' 
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractRes, empRes] = await Promise.all([
        api.get(`/contracts?status=${statusFilter}`),
        api.get('/employees/simple')
      ]);
      setContracts(contractRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedContract(null);
    setFormData({ 
      employee_id: employees.length > 0 ? employees[0].id : '', 
      contract_number: `HD-${new Date().getTime()}`, 
      type: 'Xác định thời hạn 1 năm', 
      start_date: new Date().toISOString().slice(0,10), 
      end_date: '', 
      basic_salary: '', 
      status: 'Có hiệu lực', 
      notes: '' 
    });
    setModalOpen(true);
  };

  const handleOpenCreateForEmployee = (employeeId) => {
    setModalType('create');
    setSelectedContract(null);
    setFormData({ 
      employee_id: employeeId, 
      contract_number: `HD-${new Date().getTime()}`, 
      type: 'Xác định thời hạn 1 năm', 
      start_date: new Date().toISOString().slice(0,10), 
      end_date: '', 
      basic_salary: '', 
      status: 'Có hiệu lực', 
      notes: '' 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (contract) => {
    setModalType('edit');
    setSelectedContract(contract);
    setFormData({
      employee_id: contract.employee_id,
      contract_number: contract.contract_number,
      type: contract.contract_type || 'Xác định thời hạn 1 năm',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
      basic_salary: contract.basic_salary || '',
      status: contract.contract_status || 'Có hiệu lực',
      notes: contract.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/contracts', formData);
        setSuccess('Tạo hợp đồng thành công');
      } else {
        await api.put(`/contracts/${selectedContract.contract_id}`, formData);
        setSuccess('Cập nhật hợp đồng thành công');
      }
      setModalOpen(false);
      fetchData();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
      try {
        await api.delete(`/contracts/${id}`);
        setSuccess('Đã xóa hợp đồng');
        fetchData();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const handleFileUpload = async (e, c) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setLoading(true);
      // 1. Tải file lên server
      const uploadRes = await api.post('/contracts/upload-file', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const document_url = uploadRes.data.document_url;

      // 2. Cập nhật URL file vào hợp đồng
      await api.put(`/contracts/${c.contract_id}`, {
        employee_id: c.employee_id,
        contract_number: c.contract_number,
        type: c.contract_type,
        start_date: c.start_date,
        end_date: c.end_date,
        basic_salary: c.basic_salary,
        status: c.contract_status,
        notes: c.notes || '',
        document_url: document_url
      });

      setSuccess(`Đã tải lên tệp hợp đồng cho nhân viên ${c.fullname}!`);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải lên tệp hợp đồng');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Tính số ngày còn lại
  const getRemainingDays = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hợp đồng Lao động</h2>
          <p className="text-xs text-slate-500">Quản lý và cảnh báo hợp đồng sắp hết hạn</p>
        </div>
        {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
          <button onClick={handleOpenCreate} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
            <Plus size={16} />
            <span>Tạo Hợp đồng</span>
          </button>
        )}
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="flex items-center space-x-2 max-w-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
        <Filter size={18} className="text-slate-400" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="Chưa có hợp đồng">Chưa có hợp đồng</option>
          <option value="Có hiệu lực">Có hiệu lực</option>
          <option value="Hết hạn">Hết hạn</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">Số HĐ</th>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Loại hợp đồng</th>
                <th className="px-4 py-3">Thời hạn</th>
                <th className="px-4 py-3">Cảnh báo</th>
                <th className="px-4 py-3">Trạng thái</th>
                {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 whitespace-nowrap">
              {contracts.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">Không có dữ liệu hợp đồng</td></tr>
              ) : contracts.map(c => {
                const hasContract = c.contract_id !== null;
                const daysLeft = hasContract ? getRemainingDays(c.end_date) : null;
                const isWarning = hasContract && daysLeft !== null && daysLeft > 0 && daysLeft <= 30;
                const isExpired = hasContract && daysLeft !== null && daysLeft <= 0;

                const fileUrl = c.document_url 
                  ? (api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') + c.document_url : c.document_url) 
                  : null;

                return (
                  <tr key={c.employee_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-mono font-semibold">
                      {hasContract ? (
                        <span className="text-brand-700">{c.contract_number}</span>
                      ) : (
                        <span className="text-red-500 font-normal italic">Chưa có HĐ</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{c.fullname}</div>
                      <div className="text-xs text-slate-500">{c.employee_code} - {c.department_name}</div>
                    </td>
                    <td className="px-4 py-4">{hasContract ? c.contract_type : '—'}</td>
                    <td className="px-4 py-4">
                      {hasContract ? (
                        <>
                          <div>Từ: {c.start_date || 'N/A'}</div>
                          <div className="text-slate-500">Đến: {c.end_date || 'Vô thời hạn'}</div>
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4">
                      {hasContract ? (
                        <>
                          {isWarning && <span className="flex items-center text-amber-600 text-xs font-bold"><AlertTriangle size={14} className="mr-1"/> Còn {daysLeft} ngày</span>}
                          {isExpired && c.contract_status === 'Có hiệu lực' && <span className="flex items-center text-red-600 text-xs font-bold"><AlertTriangle size={14} className="mr-1"/> Đã quá hạn</span>}
                          {(!isWarning && !isExpired && c.contract_status === 'Có hiệu lực' && daysLeft !== null) && <span className="text-emerald-600 text-xs font-medium">Còn {daysLeft} ngày</span>}
                        </>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-4">
                      {hasContract ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          c.contract_status === 'Có hiệu lực' ? 'bg-emerald-100 text-emerald-700' :
                          c.contract_status === 'Hết hạn' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.contract_status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">Chưa tạo HĐ</span>
                      )}
                    </td>
                    {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                      <td className="px-4 py-4 text-right space-x-2">
                        {hasContract ? (
                          <div className="flex items-center justify-end space-x-2">
                            {/* Download/View Link */}
                            {fileUrl ? (
                              <a href={fileUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800 p-1 bg-emerald-50 rounded inline-flex items-center" title="Xem hợp đồng đã tải lên">
                                <ExternalLink size={16} />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic mr-1">Chưa tải file</span>
                            )}
                            
                            {/* File Upload Button */}
                            <label className="cursor-pointer text-brand-600 hover:text-brand-800 p-1 bg-brand-50 rounded inline-flex items-center" title="Tải file hợp đồng lên">
                              <Upload size={16} />
                              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, c)} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                            </label>

                            <button onClick={() => handleOpenEdit(c)} className="text-slate-500 hover:text-brand-600 p-1 hover:bg-slate-100 rounded" title="Sửa hợp đồng"><Edit2 size={16}/></button>
                            {user?.roleName === 'ADMIN' && (
                              <button onClick={() => handleDelete(c.contract_id)} className="text-slate-500 hover:text-red-600 p-1 hover:bg-slate-100 rounded" title="Xóa hợp đồng"><Trash2 size={16}/></button>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => handleOpenCreateForEmployee(c.employee_id)} className="text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 px-3 py-1 rounded shadow-sm" title="Tạo hợp đồng nhanh">
                            Tạo HĐ
                          </button>
                        )}
                      </td>
                    )}
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
            <h3 className="font-bold text-lg mb-4">{modalType === 'create' ? 'Tạo Hợp đồng' : 'Cập nhật Hợp đồng'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Nhân viên (*)</label>
                  <select required disabled={modalType==='edit'} value={formData.employee_id} onChange={e=>setFormData({...formData, employee_id: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullname} - {emp.code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Số HĐ (*)</label>
                  <input required type="text" value={formData.contract_number} onChange={e=>setFormData({...formData, contract_number: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Trạng thái</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="Có hiệu lực">Có hiệu lực</option>
                    <option value="Hết hạn">Hết hạn</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Loại Hợp đồng</label>
                  <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 bg-white">
                    <option value="Thử việc">Thử việc</option>
                    <option value="Xác định thời hạn 1 năm">Xác định thời hạn 1 năm</option>
                    <option value="Xác định thời hạn 3 năm">Xác định thời hạn 3 năm</option>
                    <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                    <option value="Thời vụ">Thời vụ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Từ ngày</label>
                  <input type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Đến ngày</label>
                  <input type="date" value={formData.end_date} onChange={e=>setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Lương cơ bản (VND)</label>
                  <input type="number" value={formData.basic_salary} onChange={e=>setFormData({...formData, basic_salary: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
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

export default ContractPage;
