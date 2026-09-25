import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  CheckCircle2,
  Paperclip,
  Plus,
  Receipt,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import AttachmentLightbox from './AttachmentLightbox';

export const FILE_TYPES = [
  { id: 'HOA_DON_GTGT', label: '🧾 Hóa đơn GTGT', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { id: 'BAO_GIA_HOP_DONG', label: '📑 Báo giá & HĐ', badgeClass: 'bg-blue-50 text-blue-800 border-blue-300' },
  { id: 'BIEN_BAN_NGHIEM_THU', label: '📋 Biên bản nghiệm thu', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  { id: 'ANH_THUC_TE', label: '📸 Ảnh nghiệm thu', badgeClass: 'bg-purple-50 text-purple-800 border-purple-300' },
  { id: 'KHAC', label: '📂 Chứng từ khác', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' }
];

const AttachmentManager = ({
  attachments = [],
  onChange,
  readOnly = false,
  title = 'PHẦN 2: HÓA ĐƠN & CHỨNG TỪ GỐC (ATTACHMENTS & INVOICES)',
  subtitle = 'Đính kèm Hóa đơn GTGT, Báo giá, Biên bản bàn giao và Ảnh nghiệm thu thực tế'
}) => {
  const [selectedType, setSelectedType] = useState('HOA_DON_GTGT');
  const [isUploading, setIsUploading] = useState(false);
  const [activeLightboxFile, setActiveLightboxFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Xử lý upload file
  const handleUploadFiles = async (filesList) => {
    const files = Array.from(filesList);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const newAttachments = [...attachments];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/requests/upload-attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.file_url) {
          newAttachments.push({
            file_type: selectedType,
            file_name: res.data.file_name,
            file_url: res.data.file_url,
            file_size: res.data.file_size,
            uploaded_at: new Date().toISOString()
          });
        }
      }

      if (onChange) onChange(newAttachments);
    } catch (err) {
      console.error('Lỗi khi tải lên file đính kèm:', err);
      alert('Không thể tải lên tệp tin. Vui lòng kiểm tra dung lượng và thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (idx) => {
    if (readOnly) return;
    const updated = attachments.filter((_, i) => i !== idx);
    if (onChange) onChange(updated);
  };

  const handleUpdateType = (idx, newType) => {
    if (readOnly) return;
    const updated = [...attachments];
    updated[idx] = { ...updated[idx], file_type: newType };
    if (onChange) onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Receipt className="w-4 h-4 text-brand-600" />
            <span>{title}</span>
          </h4>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
            Tổng số: <strong className="text-brand-700">{attachments.length}</strong> chứng từ
          </span>
        </div>
      </div>

      {/* Upload Zone & Type Selector (Nếu không ở chế độ ReadOnly) */}
      {!readOnly && (
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          {/* 1. Chọn loại chứng từ trước khi tải lên */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              1. CHỌN PHÂN LOẠI CHỨNG TỪ CHUẨN BỊ TẢI LÊN:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {FILE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex items-center justify-center ${
                    selectedType === t.id
                      ? `${t.badgeClass} ring-2 ring-brand-500/20 shadow-xs font-bold`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              isDragging
                ? 'border-brand-500 bg-brand-50/40 ring-4 ring-brand-500/10'
                : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-brand-50/20'
            }`}
          >
            <label className="flex flex-col items-center cursor-pointer w-full text-center">
              <UploadCloud className={`w-8 h-8 mb-1 transition-transform ${isDragging ? 'scale-110 text-brand-600' : 'text-brand-500'}`} />
              <span className="text-xs font-bold text-slate-700">
                {isUploading ? 'Đang tải tệp tin lên máy chủ...' : 'Kéo thả ảnh hóa đơn / file PDF vào đây hoặc Nhấp để chọn'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Hỗ trợ PNG, JPG, JPEG, PDF, DOCX (Đang chọn loại: <strong className="text-brand-700">{FILE_TYPES.find(t => t.id === selectedType)?.label}</strong>)
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.docx,.xlsx"
                onChange={(e) => handleUploadFiles(e.target.files)}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Grid Danh Sách File / Lightbox Cards */}
      {attachments.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
          <Paperclip className="w-8 h-8 mx-auto mb-1 text-slate-300" />
          <p className="text-xs font-medium text-slate-500">Chưa có hóa đơn hoặc chứng từ gốc nào được đính kèm</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Vui lòng tải lên Hóa đơn GTGT, Báo giá hoặc Biên bản nghiệm thu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map((file, idx) => {
            const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.file_url || file.file_name || '');
            const typeConfig = FILE_TYPES.find(t => t.id === file.file_type) || FILE_TYPES[FILE_TYPES.length - 1];

            return (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200 hover:border-brand-400 rounded-xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2 overflow-hidden"
              >
                {/* File Header & Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeConfig.badgeClass}`}>
                    {typeConfig.label}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Xóa chứng từ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Thumbnail Preview on Click */}
                <div
                  onClick={() => setActiveLightboxFile(file)}
                  className="flex items-center space-x-2.5 p-2 bg-slate-50/70 hover:bg-brand-50/40 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {isImage ? (
                      <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-700">
                      {file.file_name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{file.file_size || 'Tệp đính kèm'}</span>
                  </div>
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                </div>

                {/* Phân loại lại loại file nếu cần */}
                {!readOnly && (
                  <select
                    value={file.file_type || 'HOA_DON_GTGT'}
                    onChange={(e) => handleUpdateType(idx, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-700 font-medium focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  >
                    {FILE_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      <AttachmentLightbox
        attachment={activeLightboxFile}
        allAttachments={attachments}
        isOpen={Boolean(activeLightboxFile)}
        onClose={() => setActiveLightboxFile(null)}
        onSelect={(newAtt) => setActiveLightboxFile(newAtt)}
      />
    </div>
  );
};

export default AttachmentManager;
