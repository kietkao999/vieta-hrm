import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle, XCircle, Plus, Search, Filter, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LeavePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ leave_type: 'Phép năm', start_date: '', end_date: '', reason: '' });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leave-requests?status=${statusFilter}`);
      setRequests(res.data);
    } catch (err) {
      setError('Lỗi tải dữ liệu nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-requests', formData);
      setSuccess('Tạo đơn xin nghỉ thành công');
      setModalOpen(false);
      fetchRequests();
      setTimeout(()=>setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo đơn');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Bạn có chắc muốn ${status === 'Đã duyệt' ? 'duyệt' : 'từ chối'} đơn này?`)) {
      try {
        await api.put(`/leave-requests/${id}/status`, { status });
        setSuccess(`Đã ${status.toLowerCase()} đơn xin nghỉ`);
        fetchRequests();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi cập nhật');
        setTimeout(()=>setError(''), 3000);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn này?')) {
      try {
        await api.delete(`/leave-requests/${id}`);
        setSuccess('Đã xóa đơn');
        fetchRequests();
        setTimeout(()=>setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
        setTimeout(()=>setError(''), 3000);
      }
    }
  };

  const getDepartmentApprover = (deptName) => {
    switch (deptName) {
      case 'Ban giám đốc':
        return { full: 'Ban giám đốc', short: 'Ban giám đốc' };
      case 'Kho Cần Thơ':
        return { full: 'Quản lý Kho Cần Thơ và Ban giám đốc', short: 'Quản lý Kho Cần Thơ và Ban giám đốc' };
      case 'Kho Mỹ Tho':
        return { full: 'Quản lý Kho Mỹ Tho và Ban giám đốc', short: 'Quản lý Kho Mỹ Tho và Ban giám đốc' };
      case 'Khối văn phòng':
        return { full: 'Trưởng phòng Hành chính Nhân sự và Ban giám đốc', short: 'Trưởng phòng HCNS và Ban giám đốc' };
      case 'Xưởng sản xuất nệm':
        return { full: 'Quản đốc Xưởng sản xuất nệm và Ban giám đốc', short: 'Quản đốc và Ban giám đốc' };
      case 'Phòng kinh doanh':
        return { full: 'Trưởng phòng Kinh doanh và Ban giám đốc', short: 'Trưởng phòng KD và Ban giám đốc' };
      case 'Phòng Marketing':
        return { full: 'Trưởng phòng Marketing và Ban giám đốc', short: 'Trưởng phòng MKT và Ban giám đốc' };
      case 'Xưởng sản xuất gối':
        return { full: 'Trưởng nhóm Xưởng sản xuất gối và Ban giám đốc', short: 'Trưởng nhóm và Ban giám đốc' };
      default:
        return { full: 'Trưởng bộ phận và Ban giám đốc', short: 'Trưởng bộ phận và Ban giám đốc' };
    }
  };

  const handlePrintLeaveRequest = (r) => {
    const approverInfo = getDepartmentApprover(r.department_name);
    const sDate = new Date(r.start_date);
    const eDate = new Date(r.end_date);
    const diffTime = Math.abs(eDate - sDate);
    const daysCount = r.days_count || Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const today = new Date();
    const nowDay = String(today.getDate()).padStart(2, '0');
    const nowMonth = String(today.getMonth() + 1).padStart(2, '0');
    const nowYear = today.getFullYear();

    const formatDateString = (dateStr) => {
      if (!dateStr) return '...';
      const [y, m, d] = dateStr.split('-');
      return `ngày ${d} tháng ${m} năm ${y}`;
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>Đơn xin nghỉ phép - ${r.fullname}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 13pt;
            line-height: 1.6;
            color: black;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid black;
            margin-bottom: 25px;
          }
          .header-table td {
            padding: 10px;
            vertical-align: middle;
            border: 1.5px solid black;
          }
          .logo-container {
            width: 25%;
            text-align: center;
          }
          .logo-img {
            max-height: 55px;
            max-width: 100%;
            object-fit: contain;
          }
          .national-title {
            width: 75%;
            text-align: center;
          }
          .national-title h3 {
            margin: 0;
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          .national-title p {
            margin: 4px 0 0 0;
            font-size: 11pt;
          }
          .national-motto {
            font-weight: bold;
            margin-top: 2px;
          }
          .doc-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            color: #0000FF;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 20px;
          }
          .content-section {
            margin-bottom: 20px;
          }
          .content-line {
            margin-bottom: 10px;
            text-align: justify;
          }
          .signatures-container {
            margin-top: 30px;
            width: 100%;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 45%;
            text-align: center;
          }
          .signature-title {
            font-weight: bold;
          }
          .signature-subtitle {
            font-style: italic;
            font-size: 10.5pt;
            margin-top: 2px;
          }
          .signature-space {
            height: 90px;
          }
          .no-print {
            text-align: center;
            margin-bottom: 20px;
          }
          .btn-print {
            padding: 8px 16px;
            background-color: #1e3a8a;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">In Đơn Xin Nghỉ Phép</button>
        </div>

        <table class="header-table">
          <tr>
            <td class="logo-container">
              <img class="logo-img" src="/logo.jpg" alt="VIET A Logo" />
            </td>
            <td class="national-title">
              <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
              <p class="national-motto">Độc lập - Tự do - Hạnh phúc</p>
              <p>-------***-------</p>
            </td>
          </tr>
        </table>

        <div class="doc-title">ĐƠN XIN NGHỈ PHÉP</div>

        <div class="content-section">
          <div class="content-line" style="text-align: center; margin-bottom: 15px;">
            Kính gửi : ${approverInfo.full}
          </div>
          
          <div class="content-line">
            Tên tôi là: ${r.fullname}
          </div>
          
          <div class="content-line">
            Chức vụ: ${r.position_name || 'Nhân viên'}
          </div>
          
          <div class="content-line">
            Bộ phận: ${r.department_name || '....................'}
          </div>
          
          <div class="content-line">
            Nay tôi làm đơn này kính xin ${approverInfo.short} chấp thuận cho tôi được nghỉ phép trong thời gian <strong>${daysCount}</strong> ngày
          </div>
          
          <div class="content-line">
            Kể từ ngày <strong>${r.start_date}</strong> đến hết ngày <strong>${r.end_date}</strong>
          </div>
          
          <div class="content-line">
            Lý do xin nghỉ phép: ${r.reason || '.......................................................................................................'}
          </div>
          
          <div class="content-line">
            Tôi đã bàn giao công việc trong thời gian nghỉ phép lại cho đồng nghiệp của tôi
          </div>
          
          <div class="content-line">
            Rất mong được sự xem xét và chấp thuận. Tôi xin chân thành cảm ơn!
          </div>
        </div>

        <div style="text-align: right; font-style: italic; margin-top: 20px;">
          ........., ngày ${nowDay} tháng ${nowMonth} năm ${nowYear}
        </div>

        <div class="signatures-container">
          <div class="signature-box">
            <div class="signature-title">Người phê duyệt</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-space"></div>
            <div style="border-bottom: 1px dotted black; width: 80%; margin: 0 auto;"></div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Người làm đơn</div>
            <div class="signature-subtitle">(Ký, ghi rõ họ tên)</div>
            <div class="signature-space"></div>
            <strong style="display: block; margin-top: 10px;">${r.fullname}</strong>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Nghỉ phép</h2>
          <p className="text-xs text-slate-500">Đơn từ và phê duyệt nghỉ phép</p>
        </div>
        <button onClick={() => { setFormData({ leave_type: 'Phép năm', start_date: '', end_date: '', reason: '' }); setModalOpen(true); }} className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 shadow">
          <Plus size={16} />
          <span>Xin Nghỉ phép</span>
        </button>
      </div>

      {success && <div className="rounded-lg bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{success}</div>}
      {error && <div className="rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <div className="flex items-center space-x-2 max-w-sm bg-white border border-slate-200 rounded-lg px-3 py-2">
        <Filter size={18} className="text-slate-400" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="w-full bg-transparent outline-none text-sm font-medium text-slate-700">
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Từ chối">Từ chối</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        {loading ? (
           <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div></div>
        ) : (
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Phòng ban</th>
                <th className="px-4 py-3">Loại nghỉ</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">Không có đơn nghỉ phép nào</td></tr>
              ) : requests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{r.fullname}</div>
                    <div className="text-xs text-slate-500">{r.employee_code}</div>
                  </td>
                  <td className="px-4 py-4">{r.department_name}</td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{r.leave_type}</td>
                  <td className="px-4 py-4">
                    <div className="text-brand-700 font-medium">{r.start_date}</div>
                    <div className="text-xs text-slate-500">đến {r.end_date}</div>
                  </td>
                  <td className="px-4 py-4 text-xs max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Chờ duyệt' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                    {r.status !== 'Chờ duyệt' && r.approver_name && (
                      <div className="text-[10px] text-slate-400 mt-1">bởi {r.approver_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right space-x-2">
                     <button onClick={() => handlePrintLeaveRequest(r)} className="text-brand-600 hover:text-brand-800 p-1 bg-brand-50 rounded" title="In đơn xin nghỉ phép"><Printer size={18}/></button>
                     {r.status === 'Chờ duyệt' && user?.roleName !== 'EMPLOYEE' && (
                       <>
                        <button onClick={() => handleUpdateStatus(r.id, 'Đã duyệt')} className="text-emerald-600 hover:text-emerald-800 p-1 bg-emerald-50 rounded inline-flex items-center" title="Duyệt"><CheckCircle size={18}/></button>
                        <button onClick={() => handleUpdateStatus(r.id, 'Từ chối')} className="text-red-600 hover:text-red-800 p-1 bg-red-50 rounded inline-flex items-center" title="Từ chối"><XCircle size={18}/></button>
                       </>
                     )}
                     {r.status === 'Chờ duyệt' && (user?.roleName === 'EMPLOYEE' || user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                        <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-600 p-1 text-xs border rounded">Xóa</button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <h3 className="font-bold text-lg mb-4">Xin nghỉ phép</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Loại nghỉ phép</label>
                <select value={formData.leave_type} onChange={e=>setFormData({...formData, leave_type: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none">
                  <option value="Phép năm">Phép năm</option>
                  <option value="Nghỉ ốm">Nghỉ ốm</option>
                  <option value="Nghỉ không lương">Nghỉ không lương</option>
                  <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Từ ngày (*)</label>
                  <input required type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Đến ngày (*)</label>
                  <input required type="date" value={formData.end_date} onChange={e=>setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Lý do</label>
                <textarea rows="3" value={formData.reason} onChange={e=>setFormData({...formData, reason: e.target.value})} className="w-full border rounded-lg p-2 text-sm mt-1 outline-none resize-none" placeholder="Nhập chi tiết lý do xin nghỉ..." />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-semibold hover:bg-brand-800">Gửi đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;
