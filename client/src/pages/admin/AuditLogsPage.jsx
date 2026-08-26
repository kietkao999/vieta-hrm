import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Database, Search, RefreshCw } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Không thể tải nhật ký thao tác:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nhật ký Thao tác Hệ thống</h2>
          <p className="text-xs text-slate-500">Xem vết các hành động thêm, sửa, xóa dữ liệu và lịch sử đăng nhập của người dùng.</p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Tải lại</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center space-x-2 max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tài khoản, hành động, dữ liệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="outline-none text-sm w-full bg-transparent"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Tài khoản</th>
                  <th className="px-6 py-3">Thao tác API</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Chi tiết dữ liệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {log.username}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        log.action.includes('POST') || log.action.includes('Thêm') ? 'bg-emerald-50 text-emerald-600' :
                        log.action.includes('PUT') || log.action.includes('Cập nhật') || log.action.includes('Đổi') ? 'bg-amber-50 text-amber-600' :
                        log.action.includes('DELETE') || log.action.includes('Xóa') ? 'bg-red-50 text-red-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-[10px]">{log.ip_address}</td>
                    <td className="px-6 py-3 font-mono text-[10px] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 italic">Không tìm thấy nhật ký phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
