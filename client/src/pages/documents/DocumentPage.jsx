import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  FileText,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  X,
  Upload,
  ExternalLink,
  Printer,
  FileDown,
  Maximize2
} from 'lucide-react';

const CATEGORIES = [
  'Tất cả',
  'Nội quy & Quy chế',
  'Chính sách & Phúc lợi',
  'Lương & Đãi ngộ',
  'Biểu mẫu nhân sự',
  'Đào tạo & Hướng dẫn'
];

const CATEGORY_COLORS = {
  'Nội quy & Quy chế': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: 'text-rose-600 bg-rose-100',
    border: 'border-l-rose-500'
  },
  'Chính sách & Phúc lợi': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'text-emerald-600 bg-emerald-100',
    border: 'border-l-emerald-500'
  },
  'Lương & Đãi ngộ': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'text-amber-600 bg-amber-100',
    border: 'border-l-amber-500'
  },
  'Biểu mẫu nhân sự': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'text-blue-600 bg-blue-100',
    border: 'border-l-blue-500'
  },
  'Đào tạo & Hướng dẫn': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'text-purple-600 bg-purple-100',
    border: 'border-l-purple-500'
  }
};

export default function DocumentPage() {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === 'ADMIN' || user?.role === 'HR';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    rules: 0,
    welfare: 0,
    salary: 0,
    forms: 0,
    training: 0
  });

  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState('embed'); // 'embed' | 'text'
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    category: 'Nội quy & Quy chế',
    file_name: '',
    doc_id: '',
    google_drive_url: '',
    file_size: '1.5 MB',
    file_type: 'docx',
    effective_date: new Date().toISOString().split('T')[0],
    applicable_to: 'Toàn thể CBNV',
    description: '',
    status: 'Đang hiệu lực'
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, searchKeyword]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'Tất cả') params.category = selectedCategory;
      if (searchKeyword.trim()) params.search = searchKeyword.trim();

      const response = await api.get('/documents', { params });
      if (response.data.success) {
        setDocuments(response.data.data);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách văn bản:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      category: 'Nội quy & Quy chế',
      file_name: '',
      doc_id: '',
      google_drive_url: '',
      file_size: '1.2 MB',
      file_type: 'docx',
      effective_date: new Date().toISOString().split('T')[0],
      applicable_to: 'Toàn thể CBNV',
      description: '',
      status: 'Đang hiệu lực'
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title || '',
      category: doc.category || 'Nội quy & Quy chế',
      file_name: doc.file_name || '',
      doc_id: doc.doc_id || '',
      google_drive_url: doc.google_drive_url || '',
      file_size: doc.file_size || '1.0 MB',
      file_type: doc.file_type || 'docx',
      effective_date: doc.effective_date || '',
      applicable_to: doc.applicable_to || 'Toàn thể CBNV',
      description: doc.description || '',
      status: doc.status || 'Đang hiệu lực'
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setFormError('');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await api.post('/documents/upload-file', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          file_name: res.data.file_name,
          file_url: res.data.file_url,
          file_size: res.data.file_size,
          file_type: res.data.file_type,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '')
        }));
      }
    } catch (err) {
      console.error('Lỗi upload file:', err);
      setFormError('Không thể tải file lên máy chủ. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Vui lòng nhập tên/tiêu đề văn bản.');
      return;
    }

    try {
      setSubmitLoading(true);
      setFormError('');

      if (editingDoc) {
        await api.put(`/documents/${editingDoc.id}`, formData);
      } else {
        await api.post('/documents', formData);
      }

      setIsFormModalOpen(false);
      fetchDocuments();
    } catch (err) {
      console.error('Lỗi lưu văn bản:', err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu văn bản.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa văn bản "${title}" không?`)) {
      return;
    }
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error('Lỗi xóa văn bản:', err);
      alert('Không thể xóa văn bản. Vui lòng thử lại.');
    }
  };

  // Tải file DOCX hoặc PDF trực tiếp từ Google Docs
  const handleDownloadFile = (doc, format = 'docx') => {
    if (doc.doc_id) {
      const url = `https://docs.google.com/document/d/${doc.doc_id}/export?format=${format}`;
      window.open(url, '_blank');
      return;
    }
    if (doc.download_docx_url) {
      window.open(doc.download_docx_url, '_blank');
      return;
    }
    window.open(`/api/documents/${doc.id}/download?format=${format}`, '_blank');
  };

  // Mở xem trực tiếp trên Google Docs
  const handleOpenGoogleDocs = (doc) => {
    const url = doc.google_drive_url || (doc.doc_id ? `https://docs.google.com/document/d/${doc.doc_id}/edit` : null);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Tài liệu chưa có liên kết Google Docs.');
    }
  };

  // Helper lấy URL preview iframe
  const getPreviewIframeUrl = (doc) => {
    if (doc.doc_id) {
      return `https://docs.google.com/document/d/${doc.doc_id}/preview`;
    }
    if (doc.preview_url) {
      return doc.preview_url;
    }
    if (doc.google_drive_url) {
      return doc.google_drive_url.replace(/\/edit.*$/, '/preview');
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HỆ THỐNG VĂN BẢN & QUY ĐỊNH NỘI BỘ NỆM VIỆT Á 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Văn Bản, Quy Định & Phúc Lợi
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Xem trực tiếp định dạng gốc nguyên bản (Google Docs) và tải về toàn bộ Nội quy, Chính sách phúc lợi, Biểu mẫu nhân sự và Hệ số lương công ty.
            </p>
          </div>

          {isAdminOrHR && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ban hành văn bản mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng văn bản</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total || documents.length}</span>
            <span className="text-xs text-slate-500 font-medium">tài liệu</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% đang có hiệu lực</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nội quy & Quy chuẩn</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.rules}</span>
            <span className="text-xs text-slate-500 font-medium">văn bản</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Nội quy 2026, An toàn LĐ</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phúc lợi & Lương</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{(stats.welfare || 0) + (stats.salary || 0)}</span>
            <span className="text-xs text-slate-500 font-medium">chính sách</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Chế độ 2026, TB 18 Lương</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biểu mẫu & Hướng dẫn</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{(stats.forms || 0) + (stats.training || 0)}</span>
            <span className="text-xs text-slate-500 font-medium">mẫu biểu</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Tuyển dụng, Đào tạo hội nhập</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên quy định, nội dung, đối tượng áp dụng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
            <span>Hiển thị <strong>{documents.length}</strong> văn bản</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lưới thẻ
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng biểu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content List / Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
          <p className="text-sm text-slate-500">Đang tải danh sách văn bản & quy định...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy tài liệu phù hợp</h3>
          <p className="text-sm text-slate-400 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục "Tất cả".</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const catColor = CATEGORY_COLORS[doc.category] || {
              badge: 'bg-slate-100 text-slate-700 border-slate-200',
              icon: 'text-slate-600 bg-slate-100',
              border: 'border-l-slate-400'
            };

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border-l-4 ${catColor.border} group`}
              >
                <div>
                  {/* Top: Category badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catColor.badge}`}>
                      {doc.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {doc.status || 'Đang hiệu lực'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => {
                      setSelectedDoc(doc);
                      setPreviewTab('embed');
                      setIsPreviewOpen(true);
                    }}
                    className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 cursor-pointer hover:underline"
                  >
                    {doc.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {doc.description || 'Chưa có thông tin mô tả chi tiết.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đối tượng:</span>
                      </span>
                      <strong className="text-slate-700 font-semibold">{doc.applicable_to || 'Toàn thể CBNV'}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Áp dụng từ:</span>
                      </span>
                      <strong className="text-slate-700 font-semibold">{doc.effective_date || '2026'}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tệp đính kèm:</span>
                      </span>
                      <span className="text-slate-600 truncate max-w-[180px] font-mono text-[11px]" title={doc.file_name}>
                        {doc.file_name || 'Tài liệu chuẩn hóa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setPreviewTab('embed');
                        setIsPreviewOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Xem bản gốc</span>
                    </button>

                    <button
                      onClick={() => handleDownloadFile(doc, 'docx')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Tải file Word (.docx)"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tải về</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenGoogleDocs(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Mở trên Google Docs tab mới"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {isAdminOrHR && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">STT</th>
                  <th className="px-4 py-3.5">Tên văn bản / Quy định</th>
                  <th className="px-4 py-3.5">Danh mục</th>
                  <th className="px-4 py-3.5">Đối tượng áp dụng</th>
                  <th className="px-4 py-3.5">Ngày áp dụng</th>
                  <th className="px-4 py-3.5">Tên file</th>
                  <th className="px-4 py-3.5 text-center">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc, idx) => {
                  const catColor = CATEGORY_COLORS[doc.category] || {
                    badge: 'bg-slate-100 text-slate-700 border-slate-200'
                  };

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div
                          className="font-bold text-slate-900 hover:text-blue-900 cursor-pointer"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setPreviewTab('embed');
                            setIsPreviewOpen(true);
                          }}
                        >
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catColor.badge}`}>
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{doc.applicable_to || 'Toàn thể CBNV'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{doc.effective_date}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-600 truncate max-w-[200px] block" title={doc.file_name}>
                          {doc.file_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {doc.status || 'Đang hiệu lực'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setPreviewTab('embed');
                              setIsPreviewOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Xem văn bản gốc"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem</span>
                          </button>
                          <button
                            onClick={() => handleDownloadFile(doc, 'docx')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Tải file Word (.docx)"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải</span>
                          </button>
                          <button
                            onClick={() => handleOpenGoogleDocs(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Mở Google Docs tab mới"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          {isAdminOrHR && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(doc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id, doc.title)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL DOCUMENT PREVIEW MODAL WITH EMBEDDED GOOGLE DOCS ORIGINAL FORMAT */}
      {isPreviewOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[95vh] shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-md">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-white truncate">{selectedDoc.title}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{selectedDoc.category}</span>
                    <span>•</span>
                    <span>Hiệu lực từ: {selectedDoc.effective_date}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{selectedDoc.status || 'Đang hiệu lực'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs text-slate-300 border border-slate-700">
                  <button
                    onClick={() => setPreviewTab('embed')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewTab === 'embed' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                    }`}
                  >
                    Bản gốc Google Docs
                  </button>
                  <button
                    onClick={() => setPreviewTab('text')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      previewTab === 'text' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                    }`}
                  >
                    Tóm tắt văn bản
                  </button>
                </div>

                <button
                  onClick={() => handleOpenGoogleDocs(selectedDoc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                  title="Mở trong Google Docs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mở Google Docs</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(selectedDoc, 'docx')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                  title="Tải file Word (.docx) gốc"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Word (.docx)</span>
                </button>

                <button
                  onClick={() => handleDownloadFile(selectedDoc, 'pdf')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                  title="Tải file PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Tải PDF</span>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="flex-1 bg-slate-100 overflow-hidden relative">
              {previewTab === 'embed' ? (
                getPreviewIframeUrl(selectedDoc) ? (
                  <iframe
                    src={getPreviewIframeUrl(selectedDoc)}
                    title={selectedDoc.title}
                    className="w-full h-full border-0 bg-white"
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-400 mb-3" />
                    <h4 className="text-base font-bold text-slate-700">Chưa có liên kết bản gốc</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Vui lòng chuyển sang tab "Tóm tắt văn bản" hoặc mở file đính kèm.
                    </p>
                  </div>
                )
              ) : (
                /* Text View */
                <div className="h-full overflow-y-auto p-6 sm:p-10 bg-slate-200/60">
                  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 sm:p-12 border border-slate-200 min-h-full font-serif text-slate-800 space-y-6">
                    <div className="border-b-2 border-blue-900 pb-6 text-center space-y-2">
                      <div className="text-xs font-sans font-bold tracking-widest text-slate-500 uppercase">
                        CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold font-sans text-blue-900 uppercase tracking-tight">
                        {selectedDoc.title}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-sans text-slate-500 pt-1">
                        <span>Mã văn bản: <strong>#{selectedDoc.id}</strong></span>
                        <span>•</span>
                        <span>Danh mục: <strong>{selectedDoc.category}</strong></span>
                        <span>•</span>
                        <span>Hiệu lực từ: <strong>{selectedDoc.effective_date}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">● {selectedDoc.status || 'Đang hiệu lực'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs space-y-1 text-slate-700">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">Đối tượng áp dụng:</strong>
                        <span>{selectedDoc.applicable_to || 'Toàn thể Cán bộ Công nhân viên'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">Tên file chuẩn:</strong>
                        <span className="font-mono text-blue-700">{selectedDoc.file_name}</span>
                      </div>
                    </div>

                    <div className="prose max-w-none text-slate-800 space-y-4 pt-2 whitespace-pre-line font-sans text-sm sm:text-base leading-relaxed">
                      {selectedDoc.content || selectedDoc.description}
                    </div>

                    <div className="pt-8 border-t border-slate-200 flex items-center justify-between font-sans text-xs">
                      <button
                        onClick={() => handleOpenGoogleDocs(selectedDoc)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mở bản đầy đủ trên Google Docs</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile(selectedDoc, 'docx')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold"
                      >
                        <Download className="w-4 h-4" />
                        <span>Tải file Word (.docx)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (Admin & HR) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDoc ? 'Chỉnh sửa văn bản / quy định' : 'Thêm văn bản / quy định mới'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên văn bản / Quy định *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nội Quy Công Ty 2026..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Danh mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                  >
                    {CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày áp dụng</label>
                  <input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Docs URL hoặc ID</label>
                <input
                  type="text"
                  placeholder="VD: https://docs.google.com/document/d/.../edit hoặc ID tài liệu"
                  value={formData.google_drive_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    const docIdMatch = val.match(/\/d\/([a-zA-Z0-9-_]+)/);
                    setFormData({
                      ...formData,
                      google_drive_url: val,
                      doc_id: docIdMatch ? docIdMatch[1] : formData.doc_id
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối tượng áp dụng</label>
                  <input
                    type="text"
                    placeholder="VD: Toàn thể CBNV, Khối xưởng..."
                    value={formData.applicable_to}
                    onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800"
                  >
                    <option value="Đang hiệu lực">Đang hiệu lực</option>
                    <option value="Dự thảo">Dự thảo</option>
                    <option value="Hết hiệu lực">Hết hiệu lực</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tải lên file văn bản dự phòng (.docx, .pdf)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50 text-center hover:bg-slate-100/60 transition-colors relative">
                  <input
                    type="file"
                    accept=".docx,.doc,.pdf,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600 font-medium">
                      {uploading ? 'Đang tải file lên...' : formData.file_name ? `File đã chọn: ${formData.file_name}` : 'Nhấn vào đây để tải file lên'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ DOCX, PDF tối đa 20MB</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung tóm tắt / Ghi chú</label>
                <textarea
                  rows="3"
                  placeholder="Tóm tắt các điểm chính hoặc điều khoản quan trọng trong văn bản..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || uploading}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitLoading ? 'Đang lưu...' : editingDoc ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
