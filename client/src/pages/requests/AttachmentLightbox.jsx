import React from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';

const FILE_TYPE_LABELS = {
  HOA_DON_GTGT: '🧾 Hóa đơn GTGT',
  BAO_GIA_HOP_DONG: '📑 Báo giá & Hợp đồng',
  BIEN_BAN_NGHIEM_THU: '📋 Biên bản nghiệm thu / Bàn giao',
  ANH_THUC_TE: '📸 Ảnh thi công / Thực tế',
  KHAC: '📂 Chứng từ khác'
};

const AttachmentLightbox = ({ attachment, allAttachments = [], isOpen, onClose, onSelect }) => {
  if (!isOpen || !attachment) return null;

  const currentIndex = allAttachments.findIndex(a => a.id === attachment.id || a.file_url === attachment.file_url);
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(attachment.file_url || attachment.file_name || '');
  const isPdf = /\.pdf$/i.test(attachment.file_url || attachment.file_name || '');

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0 && onSelect) {
      onSelect(allAttachments[currentIndex - 1]);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < allAttachments.length - 1 && onSelect) {
      onSelect(allAttachments[currentIndex + 1]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
            {isImage ? <ImageIcon className="w-5 h-5 text-brand-300" /> : <FileText className="w-5 h-5 text-amber-300" />}
          </div>
          <div>
            <h4 className="text-sm font-bold truncate max-w-md">{attachment.file_name || 'Tệp đính kèm'}</h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="text-brand-300 font-semibold">{FILE_TYPE_LABELS[attachment.file_type] || attachment.file_type}</span>
              {attachment.file_size && <span>• {attachment.file_size}</span>}
              {allAttachments.length > 1 && (
                <span>• ({currentIndex + 1}/{allAttachments.length})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={attachment.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center space-x-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải xuống</span>
          </a>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage ? (
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
          />
        ) : isPdf ? (
          <div className="w-full h-[80vh] bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <iframe
              src={attachment.file_url}
              title={attachment.file_name}
              className="w-full flex-1 border-none"
            />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl text-center text-white max-w-md">
            <FileText className="w-16 h-16 text-brand-400 mx-auto mb-4" />
            <h5 className="font-bold text-base mb-2">{attachment.file_name}</h5>
            <p className="text-xs text-slate-400 mb-6">Định dạng file không thể xem trước trực tiếp trong trình duyệt.</p>
            <a
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở hoặc tải file gốc</span>
            </a>
          </div>
        )}

        {/* Prev / Next Navigators */}
        {allAttachments.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-brand-600 text-white rounded-full shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentIndex < allAttachments.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-brand-600 text-white rounded-full shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttachmentLightbox;
