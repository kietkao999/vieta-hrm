import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Lightbulb,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Send,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Gift,
  XCircle,
  FileText,
  UserCheck,
  UserX,
  Crown,
  ShieldAlert,
  Paperclip,
  ExternalLink,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// MÔ HÌNH 2: 3 MỤC ĐÍCH GÓP Ý CHÍNH (CHUẨN THẾ GIỚI DI ĐỘNG / FPT)
const FEEDBACK_PURPOSES = [
  {
    id: 'Ý tưởng sáng tạo & Cải tiến',
    title: '💡 Ý Tưởng Cải Tiến & Sáng Tạo',
    desc: 'Đề xuất tăng doanh số, cải tiến sản xuất nệm/gối, tối ưu lộ trình giao hàng, tiết kiệm chi phí...',
    icon: Lightbulb,
    color: 'border-amber-400 bg-amber-50/70 text-amber-900',
    badge: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'Góp ý xây dựng môi trường & phúc lợi',
    title: '💬 Góp Ý Môi Trường & Phúc Lợi',
    desc: 'Đóng góp ý kiến về bữa ăn ca, điều kiện làm việc tại xưởng/kho, văn hóa công ty, chế độ phúc lợi...',
    icon: MessageSquare,
    color: 'border-blue-400 bg-blue-50/70 text-blue-900',
    badge: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'Phản ánh bất cập & Khiếu nại bảo mật',
    title: '🛡️ Phản Ánh Bất Cập & Khiếu Nại',
    desc: 'Phản ánh khúc mắc công việc, bất công phân ca/tuyến, vi phạm quy chế hoặc thái độ quản lý (bảo mật tuyệt đối)...',
    icon: ShieldAlert,
    color: 'border-rose-400 bg-rose-50/70 text-rose-900',
    badge: 'bg-rose-100 text-rose-800'
  }
];

// DANH SÁCH CẤP TIẾP NHẬN
const RECIPIENT_GROUPS = [
  {
    groupLabel: '👑 CẤP LÃNH ĐẠO CAO NHẤT (CEO LETTERBOX)',
    options: [
      { id: 'Ban Giám Đốc', label: '👑 Hòm Thư Ban Tổng Giám Đốc (Xem xét & chỉ đạo toàn diện)' }
    ]
  },
  {
    groupLabel: '👔 PHÒNG HÀNH CHÍNH NHÂN SỰ (HR)',
    options: [
      { id: 'Trưởng Phòng Hành Chính Nhân Sự', label: '👔 Trưởng Phòng HCNS (Giải quyết chế độ, quyền lợi & hỗ trợ nhân sự)' }
    ]
  },
  {
    groupLabel: '🏬 TRƯỞNG PHÒNG BAN & QUẢN LÝ ĐƠN VỊ',
    options: [
      { id: 'Trưởng Phòng Kinh Doanh & Marketing', label: 'Trưởng Phòng Kinh Doanh & Marketing' },
      { id: 'Trưởng Phòng Kế Toán', label: 'Trưởng Phòng Kế Toán' },
      { id: 'Trưởng Phòng R&D', label: 'Trưởng Phòng R&D' },
      { id: 'Quản Lý Kho Cần Thơ', label: 'Quản Lý Kho Cần Thơ' },
      { id: 'Quản Lý Kho Mỹ Tho', label: 'Quản Lý Kho Mỹ Tho' },
      { id: 'Quản Lý Xưởng Sản Xuất Nệm', label: 'Quản Lý Xưởng Sản Xuất Nệm' },
      { id: 'Quản Lý Xưởng Gối', label: 'Quản Lý Xưởng Gối' }
    ]
  }
];

const STATUS_CONFIGS = {
  'Chờ tiếp nhận': { label: 'Chờ tiếp nhận', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  'Đề xuất': { label: 'Chờ tiếp nhận', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  'Đang thẩm định': { label: 'Đang xem xét', badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: HelpCircle },
  'Thử nghiệm': { label: 'Thử nghiệm', badge: 'bg-purple-100 text-purple-800 border-purple-200', icon: Sparkles },
  'Đã áp dụng thành công': { label: 'Đã giải quyết / Áp dụng', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Đã triển khai': { label: 'Đã giải quyết', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Khen thưởng': { label: 'Được Khen Thưởng', badge: 'bg-yellow-100 text-yellow-900 border-yellow-300 font-black', icon: Award },
  'Từ chối / Lưu trữ': { label: 'Lưu trữ', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle }
};

const InnovationPage = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER';

  // Active Tab: 'box' (hòm thư góp ý) | 'management' (quản lý thẩm định)
  const [activeTab, setActiveTab] = useState('box');

  // Data states
  const [allInnovations, setAllInnovations] = useState([]);
  const [myInnovations, setMyInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state theo Mô hình 2
  const [formData, setFormData] = useState({
    category: FEEDBACK_PURPOSES[0].id,
    target_unit: 'Ban Giám Đốc',
    is_anonymous: false,
    title: '',
    content: '',
    attachment_url: ''
  });

  // Evaluate / Management Modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [evalData, setEvalData] = useState({
    status: 'Đang thẩm định',
    response_notes: '',
    reward_amount: 0
  });

  // Management Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get('/innovations'),
        api.get('/innovations?scope=my')
      ]);
      setAllInnovations(allRes.data || []);
      setMyInnovations(myRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Không thể tải danh sách ý kiến đóng góp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit ý kiến
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề ý kiến / phản ánh!');
      return;
    }
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung chi tiết!');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/innovations', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        target_unit: formData.target_unit,
        is_anonymous: formData.is_anonymous,
        attachment_url: formData.attachment_url
      });

      const recipientText = formData.target_unit.includes('Ban Giám Đốc') ? 'Ban Giám Đốc' : formData.target_unit;
      const privacyText = formData.is_anonymous ? '(Chế độ Nặc Danh 🔒)' : '(Chế độ Công Khai 👤)';
      setSuccess(`Cảm ơn bạn! Ý kiến đóng góp đã được gửi đến ${recipientText} thành công ${privacyText}!`);

      // Reset form title and content
      setFormData(prev => ({
        ...prev,
        title: '',
        content: '',
        attachment_url: ''
      }));

      fetchData();
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gửi đề xuất.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Evaluation Modal
  const handleOpenEval = (item) => {
    setSelectedItem(item);
    setEvalData({
      status: item.status || 'Đang thẩm định',
      response_notes: item.response_notes || '',
      reward_amount: item.reward_amount || 0
    });
    setEvalModalOpen(true);
  };

  // Save Evaluation & Response
  const handleSaveEval = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.put(`/innovations/${selectedItem.id}`, {
        status: evalData.status,
        response_notes: evalData.response_notes,
        reward_amount: Number(evalData.reward_amount) || 0
      });

      setSuccess(`Đã lưu phản hồi cho ý kiến #${selectedItem.id}`);
      setEvalModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu phản hồi.');
    }
  };

  // Like idea
  const handleLike = async (id) => {
    try {
      const res = await api.post(`/innovations/${id}/like`);
      setAllInnovations(prev => prev.map(item => item.id === id ? { ...item, likes_count: res.data.likes_count } : item));
      setMyInnovations(prev => prev.map(item => item.id === id ? { ...item, likes_count: res.data.likes_count } : item));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete idea
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ý kiến này?')) {
      try {
        await api.delete(`/innovations/${id}`);
        setSuccess('Đã xóa thành công.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa.');
      }
    }
  };

  // Filtered list for management
  const filteredInnovations = allInnovations.filter(item => {
    const matchSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const waitingCount = allInnovations.filter(i => i.status === 'Chờ tiếp nhận' || i.status === 'Đề xuất' || i.status === 'Đang thẩm định').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Mô hình 2 Voice of Employee */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-3 py-0.5 text-xs font-semibold text-brand-300">
            <HeartHandshake size={13} className="text-amber-400" />
            <span>Kênh Tiếng Nói & Lắng Nghe Nhân Viên (Voice of Employee)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            HÒM THƯ GÓP Ý & LẮNG NGHE NỘI BỘ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Nơi tiếp nhận mọi sáng kiến, đóng góp xây dựng và phản ánh bất cập. Cam kết bảo mật danh tính tuyệt đối & phản hồi trong vòng 24h - 48h!
          </p>
        </div>

        {isAdminOrManager && (
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('box')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'box' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Send size={13} />
              <span>Gửi Góp Ý</span>
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'management' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Quản Lý ({waitingCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2.5 shadow-xs animate-in fade-in">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <span className="text-xs sm:text-sm font-bold">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="text-rose-600 shrink-0" size={18} />
          <span className="text-xs sm:text-sm font-bold">{error}</span>
        </div>
      )}

      {/* ================= TAB 1: FORM GÓP Ý CHUẨN MÔ HÌNH 2 ================= */}
      {activeTab === 'box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Form Góp Ý & Phản Ánh */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black flex items-center space-x-2">
                  <Send size={16} className="text-amber-400" />
                  <span>PHIẾU GÓP Ý & PHẢN ÁNH NỘI BỘ</span>
                </span>
                <span className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Phản hồi trong 48h
                </span>
              </div>

              <form onSubmit={handleSubmitIdea} className="p-5 space-y-5">
                {/* 1. MỤC ĐÍCH GỬI (3 LOẠI CHÍNH) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    1. Bạn Muốn Gửi Về Mục Đích Gì? *
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {FEEDBACK_PURPOSES.map(item => {
                      const Icon = item.icon;
                      const isSelected = formData.category === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: item.id })}
                          className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                            isSelected
                              ? `${item.color} ring-2 ring-brand-500/30 shadow-xs`
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-white shadow-2xs' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <span className="font-black text-xs block text-slate-900">{item.title}</span>
                            <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. GỬI ĐẾN AI */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Gửi Trực Tiếp Đến Ai? *
                  </label>
                  <select
                    value={formData.target_unit}
                    onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    {RECIPIENT_GROUPS.map((grp, idx) => (
                      <optgroup key={idx} label={grp.groupLabel}>
                        {grp.options.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* 3. TÙY CHỌN BẢO MẬT: CÔNG KHAI HOẶC NẶC DANH */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Mức Độ Bảo Mật Danh Tính *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nặc danh */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_anonymous: true })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                        formData.is_anonymous
                          ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-400/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${formData.is_anonymous ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <EyeOff size={18} />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${formData.is_anonymous ? 'text-amber-950' : 'text-slate-800'}`}>
                          🔒 Gửi Nặc Danh 100%
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Giấu hoàn toàn tên, mã NV. Người nhận chỉ thấy nội dung để giải quyết công tâm.
                        </p>
                      </div>
                    </button>

                    {/* Công khai */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_anonymous: false })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                        !formData.is_anonymous
                          ? 'border-brand-600 bg-brand-50/90 ring-2 ring-brand-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${!formData.is_anonymous ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Eye size={18} />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${!formData.is_anonymous ? 'text-brand-950' : 'text-slate-800'}`}>
                          👤 Gửi Công Khai
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Hiển thị tên để BGĐ/HR hỗ trợ riêng 1-1 và khen thưởng khi sáng kiến được áp dụng.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Tiêu đề */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    4. Tiêu Đề Ý Kiến / Phản Ánh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tóm tắt ngắn gọn vấn đề (Ví dụ: Đề xuất cải tiến thao tác dán nệm / Góp ý bữa ăn ca xưởng...)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* 5. Nội dung chi tiết */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    5. Chi Tiết Thực Trạng & Nội Dung Đóng Góp / Đề Xuất *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Mô tả cụ thể: 1) Hiện trạng hoặc vấn đề đang xảy ra? 2) Nguyên nhân / Bất cập ở đâu? 3) Đề xuất phương án cải thiện hoặc mong muốn Ban Giám Đốc / Quản lý hỗ trợ..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* 6. Đính kèm liên kết bằng chứng / hình ảnh (tùy chọn) */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1.5">
                    <Paperclip size={14} />
                    <span>6. Liên Kết Hình Ảnh / Bằng Chứng Hiện Trạng (Nếu Có)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... hoặc link ảnh minh chứng hiện trường xưởng/kho"
                    value={formData.attachment_url}
                    onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Nút gửi */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>
                        GỬI ĐẾN {formData.target_unit.toUpperCase()} {formData.is_anonymous ? '(NẶC DANH 🔒)' : '(CÔNG KHAI 👤)'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Cột phải: Ý kiến đã gửi & Cam kết bảo mật */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box 1: Ý kiến của bạn */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <Lightbulb size={16} className="text-brand-600" />
                  <span>Ý Kiến & Phản Ánh Của Bạn ({myInnovations.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Theo dõi trực tiếp</span>
              </div>

              {myInnovations.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Bạn chưa gửi ý kiến nào. Mọi đóng góp của bạn đều giúp Nệm Việt Á ngày một phát triển hơn!
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {myInnovations.map((item) => {
                    const statusInfo = STATUS_CONFIGS[item.status] || STATUS_CONFIGS['Chờ tiếp nhận'];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badge}`}>
                            <StatusIcon size={11} />
                            <span>{statusInfo.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                            Gửi đến: {item.target_unit}
                          </span>
                          <span className="text-slate-400">
                            {item.is_anonymous === 1 ? '🔒 Nặc danh' : '👤 Công khai'}
                          </span>
                        </div>

                        <p className="font-bold text-xs text-slate-900 leading-snug">{item.title}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 whitespace-pre-line">{item.content}</p>

                        {/* Phản hồi từ Quản lý */}
                        {item.response_notes && (
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                            <span className="font-bold block text-emerald-800">
                              💬 Phản hồi từ {item.response_by || 'Ban Quản Lý'}:
                            </span>
                            <p className="italic text-slate-700">"{item.response_notes}"</p>
                            {item.reward_amount > 0 && (
                              <p className="font-black text-amber-700 pt-0.5">
                                🎁 Khen thưởng: {Number(item.reward_amount).toLocaleString('vi-VN')} đ
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Box 2: Cam kết Lắng nghe & Bảo mật (Chuẩn Mô hình 2) */}
            <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 rounded-2xl border border-indigo-200 p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-indigo-950 font-black text-xs sm:text-sm">
                <Lock size={16} className="text-indigo-600" />
                <span>CHÍNH SÁCH BẢO MẬT & LẮNG NGHE</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong>Bảo vệ người gửi nặc danh:</strong> Hệ thống mã hóa thông tin, không một ai có thể truy xuất danh tính người gửi nặc danh.</li>
                <li><strong>Thời gian xử lý:</strong> Ban Giám Đốc và Quản lý phòng ban cam kết phản hồi trong vòng <strong>24h - 48h làm việc</strong>.</li>
                <li><strong>Khen thưởng sáng kiến:</strong> Mọi ý kiến cải tiến mang lại giá trị thiết thực đều được Ban Giám Đốc xét duyệt khen thưởng xứng đáng.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: QUẢN LÝ & THẨM ĐỊNH (ADMIN / MANAGER) ================= */}
      {activeTab === 'management' && isAdminOrManager && (
        <div className="space-y-4">
          {/* Bộ lọc đơn giản */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center space-x-2 w-full sm:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm ý kiến, người gửi, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.keys(STATUS_CONFIGS).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bảng danh sách ý kiến */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Người gửi</th>
                    <th className="px-4 py-3">Mục đích & Gửi đến</th>
                    <th className="px-4 py-3">Tiêu đề & Nội dung</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Khen thưởng</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-700 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredInnovations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                        Không có ý kiến / phản ánh nào trong danh sách.
                      </td>
                    </tr>
                  ) : (
                    filteredInnovations.map((item) => {
                      const statusInfo = STATUS_CONFIGS[item.status] || STATUS_CONFIGS['Chờ tiếp nhận'];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={item.id} className="hover:bg-brand-50/30 transition">
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                            {item.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              {item.is_anonymous === 1 ? (
                                <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">
                                  <EyeOff size={13} />
                                  <span>Nặc danh</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs font-bold">
                                  <Eye size={13} />
                                  <span>{item.fullname}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs font-semibold text-slate-800 block">
                              {item.category || 'Góp ý chung'}
                            </span>
                            <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-medium inline-block mt-0.5">
                              {item.target_unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 whitespace-pre-line">{item.content}</p>
                            {item.attachment_url && (
                              <a
                                href={item.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:underline mt-0.5"
                              >
                                <ExternalLink size={10} />
                                <span>Xem ảnh / tài liệu đính kèm</span>
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badge}`}>
                              <StatusIcon size={12} />
                              <span>{statusInfo.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {item.reward_amount > 0 ? (
                              <span className="font-bold text-amber-700 text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                +{Number(item.reward_amount).toLocaleString('vi-VN')} đ
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenEval(item)}
                                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                              >
                                Phản hồi
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thẩm định / Phản hồi nhanh */}
      {evalModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <span className="font-black text-sm">Phản Hồi & Thẩm Định Ý Kiến #{selectedItem.id}</span>
              <button onClick={() => setEvalModalOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEval} className="p-5 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Gửi đến: <strong className="text-slate-900">{selectedItem.target_unit}</strong></span>
                  <span>{selectedItem.is_anonymous === 1 ? '🔒 Nặc danh' : `👤 ${selectedItem.fullname}`}</span>
                </div>
                <p className="font-bold text-slate-900">{selectedItem.title}</p>
                <p className="text-slate-600 whitespace-pre-wrap">{selectedItem.content}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cập nhật trạng thái:</label>
                <select
                  value={evalData.status}
                  onChange={(e) => setEvalData({ ...evalData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                  <option value="Đang thẩm định">Đang xem xét (Đang thẩm định)</option>
                  <option value="Thử nghiệm">Thử nghiệm (Áp dụng thử tại xưởng/kho)</option>
                  <option value="Đã áp dụng thành công">Đã giải quyết / Áp dụng thành công</option>
                  <option value="Khen thưởng">Khen thưởng xuất sắc</option>
                  <option value="Từ chối / Lưu trữ">Lưu trữ / Đã tiếp nhận</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ý kiến phản hồi gửi nhân viên:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Viết phản hồi hoặc giải pháp xử lý gửi lại cho nhân viên..."
                  value={evalData.response_notes}
                  onChange={(e) => setEvalData({ ...evalData, response_notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiền thưởng nếu là sáng kiến xuất sắc (VNĐ):</label>
                <input
                  type="number"
                  step="50000"
                  placeholder="0"
                  value={evalData.reward_amount}
                  onChange={(e) => setEvalData({ ...evalData, reward_amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs sm:text-sm font-bold text-amber-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setEvalModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-xs"
                >
                  Lưu & Gửi Phản Hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InnovationPage;
