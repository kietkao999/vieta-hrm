import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  FileText,
  Search,
  Filter,
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
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck,
  X,
  Upload,
  ExternalLink
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    category: 'Nội quy & Quy chế',
    file_name: '',
    file_url: '',
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
      file_url: '',
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
      file_url: doc.file_url || '',
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

  const handleDownload = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      alert(`Đang tải file: ${doc.file_name}\n(Tài liệu nội bộ đã được lưu trữ trong hệ thống lưu trữ tài liệu của công ty)`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HỆ THỐNG VĂN BẢN NỘI BỘ NỆM VIỆT Á 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Văn Bản, Quy Định & Phúc Lợi
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Tra cứu đầy đủ Nội quy công ty, Quy chế phúc lợi, Biểu mẫu nhân sự, Bảng hệ số lương tầng bậc và Hướng dẫn an toàn lao động.
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
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
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
                        <span>File:</span>
                      </span>
                      <span className="text-slate-600 truncate max-w-[180px] font-mono text-[11px]" title={doc.file_name}>
                        {doc.file_name || 'Tài liệu chuẩn hóa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setIsDetailModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>
                  </div>

                  {isAdminOrHR && (
                    <div className="flex items-center gap-1">
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
                    </div>
                  )}
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
                        <div className="font-bold text-slate-900 hover:text-blue-900 cursor-pointer" onClick={() => { setSelectedDoc(doc); setIsDetailModalOpen(true); }}>
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedDoc(doc); setIsDetailModalOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Tải về"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {isAdminOrHR && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(doc)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id, doc.title)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
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

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi tiết văn bản quy định</h3>
                  <p className="text-xs text-slate-500">Mã VB #{selectedDoc.id} • Ban hành năm 2026</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tên văn bản</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedDoc.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Danh mục:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedDoc.category}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Trạng thái:</span>
                  <div className="font-bold text-emerald-600 mt-0.5">{selectedDoc.status || 'Đang hiệu lực'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Đối tượng áp dụng:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedDoc.applicable_to || 'Toàn thể CBNV'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Ngày có hiệu lực:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedDoc.effective_date || '2026'}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Nội dung tóm tắt</span>
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                  {selectedDoc.description || 'Chưa có thông tin mô tả chi tiết cho văn bản này.'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-900 truncate">{selectedDoc.file_name}</div>
                    <div className="text-[11px] text-slate-500">{selectedDoc.file_size || '1.5 MB'} • Định dạng Word/DOCX</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (Admin & HR) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                <label className="font-bold text-slate-700 block mb-1">Tải lên file văn bản (.docx, .pdf, .xlsx)</label>
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
                    <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ DOCX, PDF, XLSX tối đa 20MB</span>
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
