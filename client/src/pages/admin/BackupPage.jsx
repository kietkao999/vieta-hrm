import React, { useState } from 'react';
import api from '../../services/api';
import { Database, Download, ShieldAlert, CheckCircle } from 'lucide-react';

const BackupPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleBackup = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Gọi API tải file dưới dạng nhị phân Blob
      const response = await api.get('/system/backup', {
        responseType: 'blob'
      });

      // Tạo một URL tạm thời cho blob để tải xuống
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Đặt tên file backup kèm thời gian thực
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `viet_a_hrm_backup_${dateStr}.db`);
      
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp bộ nhớ tạm
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage('Đã tải xuống bản sao lưu database thành công!');
    } catch (err) {
      console.error('Lỗi khi tải bản sao lưu:', err);
      setError('Không thể xuất file sao lưu cơ sở dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Sao lưu Cơ sở Dữ liệu</h2>
        <p className="text-xs text-slate-500">Bảo vệ an toàn dữ liệu nhân sự bằng cách xuất bản sao lưu SQLite snapshot định kỳ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600 shrink-0">
              <Database size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Thông tin Cơ sở Dữ liệu Hiện tại</h3>
              <p className="text-xs text-slate-500">Hệ thống đang hoạt động với cơ sở dữ liệu quan hệ SQLite (ACID Compliant) ở chế độ WAL.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">ĐỘNG CƠ CƠ SỞ DỮ LIỆU</span>
              <span className="font-bold text-slate-700">SQLite 3</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">VỊ TRÍ LƯU TRỮ VẬT LÝ</span>
              <span className="font-mono text-slate-600 text-[10px]">server/hrm.db</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">CHẾ ĐỘ GHI NHẬT KÝ</span>
              <span className="font-bold text-slate-700">WAL (Write-Ahead Logging)</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">TRẠNG THÁI KẾT NỐI</span>
              <span className="inline-flex items-center space-x-1 font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Tốt (Hoạt động)</span>
              </span>
            </div>
          </div>

          {message && (
            <div className="flex items-center space-x-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
              <ShieldAlert size={16} className="text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center pt-4 border-t border-slate-100">
            <button
              onClick={handleBackup}
              disabled={loading}
              className="inline-flex items-center space-x-2 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:bg-slate-400 text-white font-bold text-sm px-5 py-2.5 transition-all shadow cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>ĐANG SAO LƯU DỮ LIỆU...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>TẢI BẢN SAO LƯU DATABASE (.DB)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lưu ý khi sao lưu</h3>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>Nên thực hiện sao lưu trước khi cập nhật nhân sự quy mô lớn.</li>
            <li>File sao lưu định dạng <code className="font-mono text-brand-700 bg-brand-50 px-1 rounded">.db</code> chứa toàn bộ dữ liệu quan hệ, bảng chấm công, lương và nhật ký.</li>
            <li>Để phục hồi dữ liệu trong trường hợp sự cố, chỉ cần copy thay thế file tải về thành <code className="font-mono">hrm.db</code> trong thư mục server.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
