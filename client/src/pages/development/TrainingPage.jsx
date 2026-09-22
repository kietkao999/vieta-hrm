import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Download,
  Eye,
  FileText,
  Bookmark,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ExternalLink,
  Maximize2,
  X,
  Award,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const getFullFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return `${backendBase}${url}`;
};

const ONBOARDING_MATERIALS = [
  {
    id: 'book-ptk-01',
    title: 'Sách: Tư Duy Phương Pháp Quản Lý Đúng',
    subtitle: 'Tài liệu đào tạo quản trị nòng cốt & phương pháp làm việc chuẩn xác',
    badge: 'Sách Quản Trị Đặc Biệt',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    coverGradient: 'from-rose-600 to-amber-700',
    type: 'pdf',
    size: '245.6 MB',
    author: 'Nệm Việt Á (Lưu hành nội bộ)',
    target: 'Cấp Quản lý, Trưởng bộ phận & Nhân sự nòng cốt',
    description: 'Cẩm nang toàn diện về tư duy lãnh đạo, tối ưu hiệu suất làm việc, phương pháp phân tích giải quyết vấn đề, kiểm soát KPI và chuẩn hóa quy trình điều hành.',
    fileUrl: '/uploads/documents/tu_duy_phuong_phap_quan_ly_dung.pdf',
    highlights: [
      'Tư duy quản trị thực chiến và điều hành đội ngũ',
      'Kỹ năng lập kế hoạch, kiểm soát công việc theo mục tiêu',
      'Đo lường hiệu quả (KPI) & Phương pháp giải quyết xung đột',
      'Xây dựng văn hóa trách nhiệm, gương mẫu và gắn kết'
    ]
  },
  {
    id: 'doc-onboarding-02',
    title: 'Bộ Đào Tạo Hội Nhập Công Ty Việt Á',
    subtitle: 'Cẩm nang văn hóa, lịch sử và quy chuẩn dành cho nhân sự mới',
    badge: 'Đào Tạo Hội Nhập',
    badgeColor: 'bg-brand-100 text-brand-800 border-brand-200',
    coverGradient: 'from-brand-700 to-indigo-800',
    type: 'docx',
    size: '16.1 MB',
    author: 'Phòng Hành chính Nhân sự',
    target: 'Toàn thể Cán bộ Nhân viên mới',
    description: 'Giới thiệu lịch sử hình thành 2015-2026, 6 giá trị cốt lõi, hệ thống truyền thông, sơ đồ tổ chức toàn công ty và các quy định phúc lợi cơ bản.',
    fileUrl: '/uploads/documents/bo_dao_tao_hoi_nhap_viet_a.docx',
    highlights: [
      'Lịch sử hình thành & Các giải thưởng Top 10, Top 20 Quốc Gia',
      '6 Giá trị cốt lõi: Chất lượng - Trách nhiệm - Sáng tạo...',
      'Sơ đồ tổ chức hơn 50+ nhân sự và các chi nhánh kho xưởng',
      'Chính sách phúc lợi, thưởng Lễ Tết & Quy chế làm việc'
    ]
  },
  {
    id: 'doc-safety-03',
    title: 'Quy Định An Toàn Lao Động & 5S',
    subtitle: 'Tiêu chuẩn vận hành an toàn xưởng sản xuất và kho bãi',
    badge: 'Quy Chuẩn An Toàn',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    coverGradient: 'from-emerald-600 to-teal-800',
    type: 'docx',
    size: '56 KB',
    author: 'Khối Sản Xuất & Kho',
    target: 'Khối Nhà máy sản xuất & Hệ thống Kho',
    description: 'Quy định trang bị bảo hộ lao động, quy trình phòng chống cháy nổ (PCCC), nguyên tắc 5S nơi làm việc và ứng phó sự cố khẩn cấp.',
    fileUrl: '/uploads/documents/quy_dinh_an_toan_lao_dong.docx',
    highlights: [
      'Trang bị bảo hộ lao động đầy đủ trong ca làm',
      'Nguyên tắc 5S: Sàng lọc - Sắp xếp - Sạch sẽ...',
      'An toàn phòng chống cháy nổ khu vực kho xưởng',
      'Quy trình xử lý sự cố an toàn lao động'
    ]
  }
];

const TrainingPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'courses'
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // PDF / Document Viewer Modal State
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    title: '',
    fileUrl: '',
    type: 'pdf'
  });

  // Course Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [formData, setFormData] = useState({
    course_name: '',
    provider: '',
    start_date: '',
    end_date: '',
    cost: 0,
    status: 'Lên kế hoạch',
    notes: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/training');
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu khóa đào tạo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedCourse(null);
    setFormData({
      course_name: '',
      provider: '',
      start_date: '',
      end_date: '',
      cost: 0,
      status: 'Lên kế hoạch',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setModalType('edit');
    setSelectedCourse(course);
    setFormData({
      course_name: course.course_name,
      provider: course.provider || '',
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      cost: course.cost || 0,
      status: course.status || 'Lên kế hoạch',
      notes: course.notes || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        await api.post('/training', formData);
        setSuccess('Tạo khóa đào tạo thành công');
      } else {
        await api.put(`/training/${selectedCourse.id}`, formData);
        setSuccess('Cập nhật khóa đào tạo thành công');
      }
      setModalOpen(false);
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khóa đào tạo này?')) {
      try {
        await api.delete(`/training/${id}`);
        setSuccess('Đã xóa khóa học');
        fetchCourses();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa');
      }
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleReadMaterial = (item) => {
    const fullUrl = getFullFileUrl(item.fileUrl);
    setViewerModal({
      isOpen: true,
      title: item.title,
      fileUrl: fullUrl,
      type: item.type
    });
  };

  const handleDownloadMaterial = (item) => {
    const fullUrl = getFullFileUrl(item.fileUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = item.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 border border-white/10">
              <GraduationCap size={15} />
              <span>Học Viện Đào Tạo & Phát Triển Nhân Tài Nệm Việt Á</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Đào Tạo & Hội Nhập
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              Cung cấp sách quản trị thực chiến, cẩm nang hội nhập doanh nghiệp và các chương trình bồi dưỡng nâng cao năng lực cho toàn thể cán bộ nhân viên.
            </p>
          </div>

          {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-900 shadow-lg hover:bg-brand-50 transition transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus size={18} className="text-brand-800" />
              <span>Thêm Khóa Đào Tạo</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'materials'
                ? 'bg-white text-brand-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BookOpen size={16} />
            <span>Sách & Cẩm Nang Hội Nhập ({ONBOARDING_MATERIALS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'courses'
                ? 'bg-white text-brand-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <GraduationCap size={16} />
            <span>Khóa Học & Lộ Trình ({courses.length})</span>
          </button>
        </div>
      </div>

      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 shadow-sm">{success}</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-800 shadow-sm">{error}</div>}

      {/* TAB 1: SÁCH & CẨM NANG HỘI NHẬP */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ONBOARDING_MATERIALS.map((item, idx) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Header Card với dải Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${item.coverGradient}`}></div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {item.type.toUpperCase()} • {item.size}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 mb-3">
                    {item.subtitle}
                  </p>

                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <UserCheck size={14} className="text-brand-600 shrink-0" />
                      <span>Đối tượng: <strong className="text-slate-800">{item.target}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      <span>Biên soạn: <strong className="text-slate-800">{item.author}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Điểm nổi bật */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nội dung cốt lõi:</span>
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={13} className="text-brand-600 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleReadMaterial(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-800 transition"
                  >
                    <Eye size={15} />
                    <span>Đọc Trực Tiếp</span>
                  </button>
                  <button
                    onClick={() => handleDownloadMaterial(item)}
                    title="Tải tài liệu về máy"
                    className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: KHÓA HỌC & CHƯƠNG TRÌNH ĐÀO TẠO */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <GraduationCap size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Chưa có khóa học nào được lên kế hoạch</p>
              <p className="text-xs text-slate-400 mt-1">Bấm "Thêm Khóa Đào Tạo" để tạo chương trình bồi dưỡng nhân sự mới.</p>
            </div>
          ) : (
            courses.map(course => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 w-2 h-full ${
                    course.status === 'Đang diễn ra'
                      ? 'bg-emerald-500'
                      : course.status === 'Đã hoàn thành'
                      ? 'bg-brand-500'
                      : 'bg-amber-400'
                  }`}
                ></div>

                <div>
                  <h3 className="font-bold text-lg text-slate-800 pr-4 mb-2 leading-tight">
                    {course.course_name}
                  </h3>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-start space-x-2 text-sm text-slate-600">
                      <BookOpen size={16} className="mt-0.5 text-slate-400 shrink-0" />
                      <span>
                        Đơn vị tổ chức: <span className="font-semibold text-slate-800">{course.provider || 'Nội bộ Việt Á'}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400 shrink-0" />
                      <span>
                        {course.start_date || 'Chưa xác định'}{' '}
                        <span className="text-slate-400">đến</span> {course.end_date || 'Chưa xác định'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <DollarSign size={16} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-brand-700">{formatVND(course.cost)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      course.status === 'Đang diễn ra'
                        ? 'bg-emerald-100 text-emerald-800'
                        : course.status === 'Đã hoàn thành'
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {course.status}
                  </span>
                  {(user?.roleName === 'ADMIN' || user?.roleName === 'HR') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL VIEW TÀI LIỆU / SÁCH PDF */}
      {viewerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="flex flex-col h-[90vh] w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg">{viewerModal.title}</h3>
                  <p className="text-xs text-slate-500">Đọc tài liệu trực tuyến • Hệ thống HRM Nệm Việt Á</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewerModal.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-600 hover:text-brand-700 hover:bg-white rounded-lg transition"
                  title="Mở tab mới toàn màn hình"
                >
                  <ExternalLink size={18} />
                </a>
                <a
                  href={viewerModal.fileUrl}
                  download
                  className="p-2 text-slate-600 hover:text-brand-700 hover:bg-white rounded-lg transition"
                  title="Tải về máy"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => setViewerModal({ isOpen: false, title: '', fileUrl: '', type: 'pdf' })}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content: Nhúng Viewer */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
              {viewerModal.type === 'pdf' ? (
                <iframe
                  src={viewerModal.fileUrl}
                  title={viewerModal.title}
                  className="w-full h-full rounded-xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-xl">
                  <FileText size={64} className="text-brand-600 mb-4" />
                  <h4 className="text-lg font-bold text-slate-800 mb-2">{viewerModal.title}</h4>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    Tài liệu định dạng Word (.docx). Bạn có thể tải về để xem đầy đủ nội dung hoặc xem trong mục Văn bản & Quy định.
                  </p>
                  <a
                    href={viewerModal.fileUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 font-bold text-white shadow-lg hover:bg-brand-800 transition"
                  >
                    <Download size={18} />
                    <span>Tải Tài Liệu DOCX Về Máy</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA KHÓA ĐÀO TẠO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-4">
              {modalType === 'create' ? 'Thêm Khóa Đào Tạo' : 'Cập nhật Khóa Đào Tạo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Tên khóa học (*)</label>
                  <input
                    required
                    type="text"
                    value={formData.course_name}
                    onChange={e => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Ví dụ: Kỹ năng quản lý kho hiện đại..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Đơn vị tổ chức / Giảng viên</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Nội bộ Việt Á hoặc tên đối tác..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Chi phí (VND)</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="Lên kế hoạch">Lên kế hoạch</option>
                    <option value="Đang diễn ra">Đang diễn ra</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Ghi chú</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-700 text-white rounded-xl text-sm font-bold hover:bg-brand-800 transition shadow-md"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
