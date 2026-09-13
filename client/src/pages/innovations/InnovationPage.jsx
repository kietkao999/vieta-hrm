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

// 3 MỤC ĐÍCH GÓP Ý CHÍNH
const FEEDBACK_PURPOSES = [
  {
    id: 'Ý tưởng sáng tạo & Cải tiến',
    title: 'Cải Tiến & Sáng Tạo',
    icon: Lightbulb,
    activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/20 shadow-xs',
    inactiveClass: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
  },
  {
    id: 'Góp ý xây dựng môi trường & phúc lợi',
    title: 'Môi Trường & Phúc Lợi',
    icon: MessageSquare,
    activeClass: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400/20 shadow-xs',
    inactiveClass: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
  },
  {
    id: 'Phản ánh bất cập & Khiếu nại bảo mật',
    title: 'Phản Ánh & Kiến Nghị',
    icon: ShieldAlert,
    activeClass: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400/20 shadow-xs',
    inactiveClass: 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
  }
];

// DANH SÁCH CẤP TIẾP NHẬN
const RECIPIENT_GROUPS = [
  {
    groupLabel: 'Cấp Lãnh Đạo',
    options: [
      { id: 'Ban Giám Đốc', label: '👑 Ban Tổng Giám Đốc' }
    ]
  },
  {
    groupLabel: 'Phòng Hành Chính Nhân Sự',
    options: [
      { id: 'Trưởng Phòng Hành Chính Nhân Sự', label: '👔 Phòng Hành Chính Nhân Sự' }
    ]
  },
  {
    groupLabel: 'Trưởng Phòng Ban & Đơn Vị',
    options: [
      { id: 'Trưởng Phòng Kinh Doanh & Marketing', label: '🏬 Phòng Kinh Doanh & Marketing' },
      { id: 'Trưởng Phòng Kế Toán', label: '🏬 Phòng Kế Toán' },
      { id: 'Trưởng Phòng R&D', label: '🏬 Phòng R&D' },
      { id: 'Quản Lý Kho Cần Thơ', label: '🏬 Quản Lý Kho Cần Thơ' },
      { id: 'Quản Lý Kho Mỹ Tho', label: '🏬 Quản Lý Kho Mỹ Tho' },
      { id: 'Quản Lý Xưởng Sản Xuất Nệm', label: '🏬 Quản Lý Xưởng Sản Xuất Nệm' },
      { id: 'Quản Lý Xưởng Gối', label: '🏬 Quản Lý Xưởng Gối' }
    ]
  }
];

const STATUS_CONFIGS = {
  'Chờ tiếp nhận': { label: 'Chờ tiếp nhận', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  'Đề xuất': { label: 'Chờ tiếp nhận', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  'Đang thẩm định': { label: 'Đang xem xét', badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: HelpCircle },
  'Thử nghiệm': { label: 'Thử nghiệm', badge: 'bg-purple-100 text-purple-800 border-purple-200', icon: Sparkles },
  'Đã áp dụng thành công': { label: 'Đã giải quyết', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Đã triển khai': { label: 'Đã giải quyết', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Khen thưởng': { label: 'Khen Thưởng', badge: 'bg-yellow-100 text-yellow-900 border-yellow-300 font-bold', icon: Award },
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

  // Form state
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
      setError('Vui lòng nhập tiêu đề ý kiến / đề xuất!');
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

      const privacyText = formData.is_anonymous ? '(Ẩn danh 🔒)' : '(Công khai 👤)';
      setSuccess(`Đã gửi ý kiến đến ${formData.target_unit} thành công ${privacyText}!`);

      // Reset form
      setFormData(prev => ({
        ...prev,
        title: '',
        content: '',
        attachment_url: ''
      }));

      fetchData();
      setTimeout(() => setSuccess(''), 5000);
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
    <div className="space-y-5 pb-10">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <HeartHandshake className="text-amber-400" size={22} />
            <span>Hòm Thư Góp Ý & Sáng Kiến</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Kênh tiếp nhận ý kiến đóng góp, đề xuất cải tiến và phản ánh nội bộ Nệm Việt Á.
          </p>
        </div>

        {isAdminOrManager && (
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
            <button
              onClick={() => setActiveTab('box')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'box' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Send size={13} />
              <span>Gửi Ý Kiến</span>
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'management' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
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
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 shadow-xs text-xs font-semibold animate-in fade-in">
          <CheckCircle className="text-emerald-600 shrink-0" size={16} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 shadow-xs text-xs font-semibold animate-in fade-in">
          <AlertCircle className="text-rose-600 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ================= TAB 1: FORM GÓP Ý ================= */}
      {activeTab === 'box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cột trái: Form Góp Ý */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <Send size={14} className="text-brand-600" />
                  <span>Phiếu Gửi Ý Kiến & Đề Xuất</span>
                </span>
                <span className="text-[11px] text-slate-400">Phản hồi trong 24h - 48h</span>
              </div>

              <form onSubmit={handleSubmitIdea} className="p-5 space-y-4">
                {/* 1. MỤC ĐÍCH */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Mục đích gửi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {FEEDBACK_PURPOSES.map(item => {
                      const Icon = item.icon;
                      const isSelected = formData.category === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: item.id })}
                          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition cursor-pointer ${
                            isSelected ? item.activeClass : item.inactiveClass
                          }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span className="font-bold text-xs">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. GỬI ĐẾN & DANH TÍNH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gửi trực tiếp đến
                    </label>
                    <select
                      value={formData.target_unit}
                      onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-none"
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chế độ danh tính
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_anonymous: false })}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          !formData.is_anonymous
                            ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Eye size={14} />
                        <span>Công khai</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_anonymous: true })}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          formData.is_anonymous
                            ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <EyeOff size={14} />
                        <span>Ẩn danh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. TIÊU ĐỀ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề ý kiến / đề xuất *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tóm tắt ngắn gọn vấn đề..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* 4. NỘI DUNG */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội dung chi tiết *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Mô tả cụ thể hiện trạng, nguyên nhân hoặc đề xuất giải pháp..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 leading-relaxed focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* 5. LIÊN KẾT ĐÍNH KÈM */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Paperclip size={13} />
                    <span>Link hình ảnh / tài liệu (nếu có)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.attachment_url}
                    onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Nút gửi */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Gửi Ý Kiến Đến {formData.target_unit}</span>
                    </>
                  )}
                </button>

                {/* Cam kết bảo mật 1 dòng */}
                <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center pt-1">
                  <Lock size={12} className="text-slate-400 shrink-0" />
                  <span>Bảo mật danh tính tuyệt đối • Tiếp nhận & phản hồi trong 24h - 48h</span>
                </div>
              </form>
            </div>
          </div>

          {/* Cột phải: Ý kiến đã gửi */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
                <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                  <Lightbulb size={15} className="text-brand-600" />
                  <span>Lịch Sử Ý Kiến Của Bạn ({myInnovations.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Trạng thái</span>
              </div>

              {myInnovations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Bạn chưa gửi ý kiến nào.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {myInnovations.map((item) => {
                    const statusInfo = STATUS_CONFIGS[item.status] || STATUS_CONFIGS['Chờ tiếp nhận'];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                        <div className="flex items-start justify-between gap-1">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}>
                            <StatusIcon size={11} />
                            <span>{statusInfo.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-brand-800 bg-brand-50 px-1.5 py-0.5 rounded text-[10px]">
                            Đến: {item.target_unit}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {item.is_anonymous === 1 ? '🔒 Ẩn danh' : '👤 Công khai'}
                          </span>
                        </div>

                        <p className="font-bold text-xs text-slate-900 leading-snug">{item.title}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{item.content}</p>

                        {/* Phản hồi từ Quản lý */}
                        {item.response_notes && (
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-0.5">
                            <span className="font-bold block text-emerald-800">
                              💬 Phản hồi ({item.response_by || 'Ban Quản Lý'}):
                            </span>
                            <p className="italic text-slate-700">"{item.response_notes}"</p>
                            {item.reward_amount > 0 && (
                              <p className="font-bold text-amber-700 pt-0.5">
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
          </div>
        </div>
      )}

      {/* ================= TAB 2: QUẢN LÝ & THẨM ĐỊNH (ADMIN / MANAGER) ================= */}
      {activeTab === 'management' && isAdminOrManager && (
        <div className="space-y-4">
          {/* Banner quyền hạn thẩm định */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-400/30 shrink-0">
                {user?.roleName === 'ADMIN' ? <Crown size={20} className="text-amber-400" /> : <ShieldCheck size={20} className="text-blue-400" />}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-white flex items-center space-x-2">
                  <span>{user?.roleName === 'ADMIN' ? '👑 CẤP 1 - BAN TỔNG GIÁM ĐỐC (TOÀN QUYỀN HỆ THỐNG)' : `👔 CẤP 2 - QUẢN LÝ ĐƠN VỊ: ${user?.positionName || user?.departmentName || 'QUẢN LÝ'}`}</span>
                </h2>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {user?.roleName === 'ADMIN'
                    ? 'Bạn có quyền xem và phản hồi toàn bộ mọi góp ý, sáng kiến & khiếu nại gửi đến Ban Giám Đốc hoặc tất cả phòng ban.'
                    : 'Hệ thống tự động lọc các ý kiến gửi đích danh đến đơn vị bạn quản lý. Các phản ánh gửi Ban Giám Đốc được bảo mật tuyệt đối.'}
                </p>
              </div>
            </div>
          </div>

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
