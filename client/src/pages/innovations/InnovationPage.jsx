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
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// DANH SÁCH NGƯỜI NHẬN / CẤP TIẾP NHẬN
const RECIPIENT_GROUPS = [
  {
    groupLabel: '👑 BAN GIÁM ĐỐC',
    options: [
      { id: 'Ban Giám Đốc', label: 'Ban Tổng Giám Đốc (Chỉ đạo & Xem xét toàn diện)' }
    ]
  },
  {
    groupLabel: '👔 CẤP TRƯỞNG PHÒNG & QUẢN LÝ ĐƠN VỊ',
    options: [
      { id: 'Trưởng Phòng Hành Chính Nhân Sự', label: 'Trưởng Phòng Hành Chính Nhân Sự' },
      { id: 'Trưởng Phòng Kế Toán', label: 'Trưởng Phòng Kế Toán' },
      { id: 'Trưởng Phòng Kinh Doanh & Marketing', label: 'Trưởng Phòng Kinh Doanh & Marketing' },
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
  'Đang thẩm định': { label: 'Đang thẩm định', badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: HelpCircle },
  'Thử nghiệm': { label: 'Thử nghiệm', badge: 'bg-purple-100 text-purple-800 border-purple-200', icon: Sparkles },
  'Đã áp dụng thành công': { label: 'Đã áp dụng', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Đã triển khai': { label: 'Đã áp dụng', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
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

  // Simple Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Ý kiến đóng góp khác',
    target_unit: 'Ban Giám Đốc',
    is_anonymous: false
  });

  // Submit ý kiến
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề ý kiến!');
      return;
    }
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung ý kiến đóng góp!');
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
        is_anonymous: formData.is_anonymous
      });

      const recipientText = formData.target_unit.includes('Ban Giám Đốc') ? 'Ban Giám Đốc' : formData.target_unit;
      const privacyText = formData.is_anonymous ? '(Chế độ Nặc Danh 🔒)' : '(Chế độ Công Khai 👤)';
      setSuccess(`Cảm ơn bạn! Ý kiến đóng góp đã được gửi đến ${recipientText} thành công ${privacyText}!`);

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
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-3 py-0.5 text-xs font-semibold text-brand-300">
            <Lightbulb size={13} className="text-amber-400" />
            <span>Hòm Thư Góp Ý & Sáng Kiến Nội Bộ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            HÒM THƯ GÓP Ý & SÁNG KIẾN CẢI TIẾN
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Gửi ý kiến trực tiếp cho <strong>Ban Giám Đốc</strong> hoặc <strong>Trưởng Phòng Ban</strong> với tùy chọn <strong>Công Khai</strong> hoặc <strong>Nặc Danh</strong> bảo mật 100%!
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

      {/* ================= TAB 1: FORM GÓP Ý ĐƠN GIẢN ================= */}
      {activeTab === 'box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột trái: Form Góp Ý */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black flex items-center space-x-2">
                  <Send size={16} className="text-amber-400" />
                  <span>HÒM THƯ GÓP Ý & ĐÓNG GÓP Ý KIẾN</span>
                </span>
              </div>

              {/* Form nhập đơn giản */}
              <form onSubmit={handleSubmitIdea} className="p-5 space-y-4">
                {/* 1. CHỌN NGƯỜI NHẬN: BAN GIÁM ĐỐC HOẶC TRƯỞNG PHÒNG BAN */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    1. Gửi Cho Ai? (Ban Giám Đốc Hoặc Trưởng Phòng Ban) *
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

                {/* 2. TÙY CHỌN BẢO MẬT: CÔNG KHAI HOẶC NẶC DANH */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Hình Thức Gửi (Công Khai Hoặc Nặc Danh) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nặc danh */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_anonymous: true })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                        formData.is_anonymous
                          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${formData.is_anonymous ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <EyeOff size={18} />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${formData.is_anonymous ? 'text-amber-950' : 'text-slate-800'}`}>
                          🔒 Gửi Nặc Danh
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          Giấu hoàn toàn tên, mã nhân viên. Người nhận chỉ thấy nội dung góp ý.
                        </p>
                      </div>
                    </button>

                    {/* Công khai */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_anonymous: false })}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
                        !formData.is_anonymous
                          ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20 shadow-xs'
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
                          Hiển thị tên để trao đổi trực tiếp, ghi nhận công sức & nhận thưởng.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Tiêu đề */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    3. Tiêu Đề Ý Kiến / Sáng Kiến *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề ngắn gọn..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* 4. Nội dung */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                    4. Nội Dung Đóng Góp Ý Kiến *
                  </label>
                  <textarea
                    rows={7}
                    required
                    placeholder="Nhập chi tiết ý kiến đóng góp hoặc đề xuất cải tiến của bạn..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed focus:border-brand-500 focus:outline-none"
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
                        GỬI Ý KIẾN ĐẾN {formData.target_unit.toUpperCase()} {formData.is_anonymous ? '(NẶC DANH 🔒)' : '(CÔNG KHAI 👤)'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Cột phải: Ý kiến của tôi & Bảng vinh danh */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box 1: Ý kiến của tôi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2.5">
                <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <Lightbulb size={16} className="text-brand-600" />
                  <span>Ý Kiến Của Bạn ({myInnovations.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Theo dõi kết quả</span>
              </div>

              {myInnovations.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Bạn chưa gửi ý kiến nào. Hãy chọn mẫu bên cạnh để gửi nhé!
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
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

            {/* Box 2: Ý kiến đã áp dụng & Khen thưởng */}
            <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-4 space-y-3">
              <div className="flex items-center space-x-1.5 text-amber-900">
                <Award size={16} className="text-amber-600" />
                <span className="font-black text-xs sm:text-sm uppercase">Ý Kiến Đã Áp Dụng Thực Tế</span>
              </div>

              <div className="space-y-2.5">
                {allInnovations.filter(i => i.status === 'Đã áp dụng thành công' || i.status === 'Đã triển khai' || i.status === 'Khen thưởng').slice(0, 3).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">Chưa có sáng kiến nào trong danh sách vinh danh.</p>
                ) : (
                  allInnovations
                    .filter(i => i.status === 'Đã áp dụng thành công' || i.status === 'Đã triển khai' || i.status === 'Khen thưởng')
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.id} className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            {item.target_unit}
                          </span>
                          <button
                            onClick={() => handleLike(item.id)}
                            className="flex items-center space-x-1 text-[11px] text-rose-600 font-bold hover:scale-105 transition cursor-pointer"
                          >
                            <ThumbsUp size={12} />
                            <span>{item.likes_count || 0}</span>
                          </button>
                        </div>
                        <p className="font-bold text-xs text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-500">Tác giả: <strong className="text-slate-700">{item.fullname}</strong></p>
                      </div>
                    ))
                )}
              </div>
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
                placeholder="Tìm kiếm ý kiến, người gửi..."
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
                    <th className="px-4 py-3">Gửi đến</th>
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
                        Không có ý kiến nào trong danh sách.
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
                            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                              {item.target_unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 whitespace-pre-line">{item.content}</p>
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
                  <option value="Đang thẩm định">Đang thẩm định (Đang xem xét)</option>
                  <option value="Thử nghiệm">Thử nghiệm (Áp dụng thử tại xưởng/kho)</option>
                  <option value="Đã áp dụng thành công">Đã áp dụng thành công</option>
                  <option value="Khen thưởng">Khen thưởng xuất sắc</option>
                  <option value="Từ chối / Lưu trữ">Lưu trữ / Chưa áp dụng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ý kiến phản hồi gửi nhân viên:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Viết phản hồi hoặc lý do tiếp nhận / khen thưởng..."
                  value={evalData.response_notes}
                  onChange={(e) => setEvalData({ ...evalData, response_notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiền thưởng nếu có (VNĐ):</label>
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
