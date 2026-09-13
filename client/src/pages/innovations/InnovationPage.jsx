import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Lightbulb,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Award,
  DollarSign,
  Send,
  Eye,
  EyeOff,
  ThumbsUp,
  MessageSquare,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Paperclip,
  ExternalLink,
  Flame,
  Zap,
  Tag,
  Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { id: 'Cải tiến sản xuất nệm/gối', label: 'Cải tiến sản xuất nệm / gối', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Tiết kiệm nguyên vật liệu', label: 'Tiết kiệm nguyên vật liệu', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Tối ưu kho vận & giao hàng', label: 'Tối ưu kho vận & giao hàng', icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Văn hóa & Môi trường làm việc', label: 'Văn hóa & Môi trường làm việc', icon: Award, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Quy trình & Chuyển đổi số', label: 'Quy trình & Chuyển đổi số', icon: Building2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { id: 'Ý kiến đóng góp khác', label: 'Ý kiến đóng góp khác', icon: MessageSquare, color: 'text-slate-600 bg-slate-50 border-slate-200' }
];

const TARGET_UNITS = [
  'Toàn công ty',
  'Xưởng Sản Xuất Nệm',
  'Xưởng Gối',
  'Kho Cần Thơ',
  'Kho Mỹ Tho',
  'Khối Văn Phòng',
  'Phòng Kinh Doanh',
  'Phòng Kế Toán',
  'Phòng Hành Chính Nhân Sự',
  'Phòng R&D',
  'Ban Giám Đốc'
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

  // Active Tab
  const [activeTab, setActiveTab] = useState('box'); // 'box' (hòm thư) | 'management' (quản lý thẩm định)

  // Data states
  const [allInnovations, setAllInnovations] = useState([]);
  const [myInnovations, setMyInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters for management tab
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // New Suggestion Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Cải tiến sản xuất nệm/gối',
    target_unit: 'Toàn công ty',
    is_anonymous: false,
    attachment_url: '',
    efficiency: '',
    cost_savings: ''
  });

  // Evaluate / Management Modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [evalData, setEvalData] = useState({
    status: 'Đang thẩm định',
    response_notes: '',
    reward_amount: 0,
    efficiency: '',
    cost_savings: 0
  });

  // Fetch all needed data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterYear) params.append('year', filterYear);
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);
      if (filterUnit) params.append('target_unit', filterUnit);
      if (searchTerm) params.append('search', searchTerm);

      const [allRes, myRes] = await Promise.all([
        api.get(`/innovations?${params.toString()}`),
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
  }, [filterYear, filterStatus, filterCategory, filterUnit]);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Handle employee submit idea
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề ý kiến / sáng kiến!');
      return;
    }
    if (!formData.content.trim()) {
      setError('Vui lòng mô tả chi tiết giải pháp cải tiến!');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.post('/innovations', {
        ...formData,
        cost_savings: Number(formData.cost_savings) || 0
      });
      setSuccess('Cảm ơn bạn! Ý kiến / Sáng kiến đã được gửi thành công đến Ban Giám Đốc!');
      setFormData({
        title: '',
        content: '',
        category: 'Cải tiến sản xuất nệm/gối',
        target_unit: 'Toàn công ty',
        is_anonymous: false,
        attachment_url: '',
        efficiency: '',
        cost_savings: ''
      });
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
      reward_amount: item.reward_amount || 0,
      efficiency: item.efficiency || '',
      cost_savings: item.cost_savings || 0
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
        reward_amount: Number(evalData.reward_amount) || 0,
        efficiency: evalData.efficiency,
        cost_savings: Number(evalData.cost_savings) || 0
      });

      setSuccess(`Đã lưu thẩm định & phản hồi cho sáng kiến #${selectedItem.id}`);
      setEvalModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu thẩm định.');
    }
  };

  // Handle Like idea
  const handleLike = async (id) => {
    try {
      const res = await api.post(`/innovations/${id}/like`);
      // Update UI optimistic
      setAllInnovations(prev => prev.map(item => item.id === id ? { ...item, likes_count: res.data.likes_count } : item));
      setMyInnovations(prev => prev.map(item => item.id === id ? { ...item, likes_count: res.data.likes_count } : item));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Idea
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sáng kiến này?')) {
      try {
        await api.delete(`/innovations/${id}`);
        setSuccess('Đã xóa sáng kiến thành công.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa sáng kiến.');
      }
    }
  };

  // Stats for Management
  const totalCount = allInnovations.length;
  const evaluatingCount = allInnovations.filter(i => i.status === 'Đang thẩm định' || i.status === 'Thử nghiệm' || i.status === 'Chờ tiếp nhận').length;
  const appliedCount = allInnovations.filter(i => i.status === 'Đã áp dụng thành công' || i.status === 'Đã triển khai' || i.status === 'Khen thưởng').length;
  const totalRewards = allInnovations.reduce((acc, curr) => acc + (Number(curr.reward_amount) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-3 py-1 text-xs font-semibold text-brand-300">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Hòm Thư Nội Bộ & Sáng Kiến Cải Tiến</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              HÒM THƯ GÓP Ý & SÁNG KIẾN VIỆT Á
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Lắng nghe mọi đóng góp, giải pháp cải tiến sản xuất, tiết kiệm vật liệu và tối ưu kho vận. 
              Mọi ý kiến đều được Ban Giám Đốc trực tiếp xem xét, bảo mật tuyệt đối và khen thưởng xứng đáng!
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isAdminOrManager && (
              <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setActiveTab('box')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                    activeTab === 'box'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Send size={14} />
                  <span>Gửi Ý Kiến</span>
                </button>
                <button
                  onClick={() => setActiveTab('management')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                    activeTab === 'management'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Quản Lý & Thẩm Định ({evaluatingCount})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-3 shadow-xs animate-in fade-in">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-3 shadow-xs animate-in fade-in">
          <AlertCircle className="text-rose-600 shrink-0" size={20} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* ================= TAB 1: HÒM THƯ & GỬI Ý KIẾN ================= */}
      {activeTab === 'box' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Form gửi sáng kiến */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Gửi Ý Kiến & Giải Pháp Cải Tiến</h3>
                    <p className="text-xs text-slate-300">Đóng góp ý tưởng giúp nâng cao hiệu quả công việc</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitIdea} className="p-6 space-y-5">
                {/* Chọn chủ đề */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    1. Chọn Chủ Đề Ý Kiến / Sáng Kiến *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = formData.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition ${
                            isSelected
                              ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <div className={`p-2 rounded-lg border shrink-0 ${cat.color}`}>
                            <Icon size={16} />
                          </div>
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-brand-900 font-extrabold' : 'text-slate-700'}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Đơn vị tiếp nhận */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Bộ Phận / Đơn Vị Đề Xuất Áp Dụng *
                  </label>
                  <select
                    value={formData.target_unit}
                    onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {TARGET_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Tiêu đề */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Tiêu Đề Ý Kiến / Sáng Kiến *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đề xuất cách xếp cuộn mút tiết kiệm 15% diện tích sàn kho..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Nội dung chi tiết */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    4. Chi Tiết Thực Trạng & Giải Pháp Đề Xuất *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nêu rõ: 1) Khó khăn hoặc lãng phí hiện tại đang gặp phải là gì? 2) Cách thức hoặc quy trình mới đề xuất giải quyết ra sao? 3) Các bước thực hiện..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Ước tính hiệu quả & Chi phí tiết kiệm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      5. Ước Tính Hiệu Quả Đạt Được
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Rút ngắn 20 phút may mỗi nệm..."
                      value={formData.efficiency}
                      onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Chi Phí Tiết Kiệm (VNĐ/tháng nếu có)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.cost_savings}
                      onChange={(e) => setFormData({ ...formData, cost_savings: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                {/* Đính kèm đường dẫn ảnh / minh chứng */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1.5">
                    <Paperclip size={14} />
                    <span>Đường Dẫn Hình Ảnh / Minh Chứng Hiện Trạng (Nếu có)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... hoặc link ảnh minh họa"
                    value={formData.attachment_url}
                    onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Tùy chọn Ẩn Danh / Công Khai */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl border ${formData.is_anonymous ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                      {formData.is_anonymous ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {formData.is_anonymous ? 'Chế độ Ẩn Danh (Bảo mật 100%)' : 'Chế độ Công Khai Danh Tính'}
                      </div>
                      <p className="text-xs text-slate-500">
                        {formData.is_anonymous
                          ? 'Tên và mã nhân viên của bạn sẽ được ẩn hoàn toàn với mọi người.'
                          : 'Tên của bạn sẽ được hiển thị để vinh danh và nhận khen thưởng khi áp dụng.'}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_anonymous}
                      onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 text-white font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>GỬI ĐỀ XUẤT ĐẾN BAN GIÁM ĐỐC</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right / Bottom: Ý kiến của bạn & Bảng vàng vinh danh */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box 1: Ý kiến của bạn */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
                    <Lightbulb size={18} />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">Ý Kiến Của Bạn ({myInnovations.length})</h3>
                </div>
                <span className="text-xs text-slate-400">Cập nhật thời gian thực</span>
              </div>

              {myInnovations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <MessageSquare size={32} className="mx-auto text-slate-300" />
                  <p className="text-xs">Bạn chưa gửi ý kiến hoặc sáng kiến nào.</p>
                  <p className="text-[11px] text-slate-400 italic">Hãy đóng góp ý tưởng đầu tiên của bạn ở form bên cạnh nhé!</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {myInnovations.map((item) => {
                    const statusInfo = STATUS_CONFIGS[item.status] || STATUS_CONFIGS['Chờ tiếp nhận'];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusInfo.badge}`}>
                            <StatusIcon size={12} />
                            <span>{statusInfo.label}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">{item.date}</span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{item.content}</p>

                        {/* If feedback from Management */}
                        {item.response_notes && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                            <div className="flex items-center space-x-1 font-bold text-emerald-800">
                              <CheckCircle2 size={13} />
                              <span>Phản hồi từ {item.response_by || 'Ban Giám Đốc'}:</span>
                            </div>
                            <p className="text-slate-700 italic">"{item.response_notes}"</p>
                            {item.reward_amount > 0 && (
                              <div className="pt-1 font-black text-amber-700 flex items-center space-x-1">
                                <Award size={13} />
                                <span>Khen thưởng: {Number(item.reward_amount).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Box 2: Bảng Vàng Sáng Kiến Nổi Bật (Community Wall) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-orange-500/10 rounded-2xl border border-amber-300/80 p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Flame size={20} className="text-amber-600" />
                <h3 className="font-black text-amber-950 text-sm uppercase tracking-wide">
                  Bảng Vàng Sáng Kiến Đã Áp Dụng
                </h3>
              </div>

              <div className="space-y-3">
                {allInnovations.filter(i => i.status === 'Đã áp dụng thành công' || i.status === 'Đã triển khai' || i.status === 'Khen thưởng').slice(0, 4).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Chưa có sáng kiến nào được vinh danh trong đợt này.</p>
                ) : (
                  allInnovations
                    .filter(i => i.status === 'Đã áp dụng thành công' || i.status === 'Đã triển khai' || i.status === 'Khen thưởng')
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {item.category || 'Cải tiến'}
                          </span>
                          <button
                            onClick={() => handleLike(item.id)}
                            className="flex items-center space-x-1 text-xs text-rose-600 font-bold hover:scale-105 transition cursor-pointer"
                          >
                            <ThumbsUp size={13} />
                            <span>{item.likes_count || 0}</span>
                          </button>
                        </div>
                        <div className="font-bold text-xs text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                          <span>Tác giả: <strong className="text-slate-700">{item.fullname}</strong></span>
                          <span>Đơn vị: {item.target_unit}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: QUẢN LÝ & THẨM ĐỊNH (ADMIN & MANAGER) ================= */}
      {activeTab === 'management' && isAdminOrManager && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Lightbulb size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Số Đề Xuất</p>
                <p className="text-2xl font-black text-slate-900">{totalCount}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang Thẩm Định</p>
                <p className="text-2xl font-black text-amber-700">{evaluatingCount}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã Áp Dụng</p>
                <p className="text-2xl font-black text-emerald-700">{appliedCount}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiền Thưởng Đã Trao</p>
                <p className="text-xl font-black text-yellow-800">{totalRewards.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full lg:max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tiêu đề, người gửi, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none"
                />
              </form>

              {/* Filters Dropdown */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">Tất cả chủ đề</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">Tất cả đơn vị</option>
                  {TARGET_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.keys(STATUS_CONFIGS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="2026">Năm 2026</option>
                  <option value="2025">Năm 2025</option>
                  <option value="2024">Năm 2024</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table List of Ideas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b">
                  <tr>
                    <th className="px-5 py-3.5">ID / Ngày</th>
                    <th className="px-5 py-3.5">Người đề xuất</th>
                    <th className="px-5 py-3.5">Chủ đề & Đơn vị</th>
                    <th className="px-5 py-3.5">Tiêu đề & Nội dung</th>
                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Tiền thưởng</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700 mx-auto" />
                      </td>
                    </tr>
                  ) : allInnovations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                        Không tìm thấy ý kiến / sáng kiến nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    allInnovations.map((item) => {
                      const statusInfo = STATUS_CONFIGS[item.status] || STATUS_CONFIGS['Chờ tiếp nhận'];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <tr key={item.id} className="hover:bg-brand-50/30 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-black text-brand-700">#{item.id}</span>
                            <p className="text-[11px] text-slate-400">{item.date}</p>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {item.is_anonymous === 1 ? (
                                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800" title="Đề xuất Ẩn danh">
                                  <EyeOff size={14} />
                                </div>
                              ) : (
                                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                                  <Eye size={14} />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-xs text-slate-900">{item.fullname}</p>
                                <p className="text-[10px] text-slate-400">{item.department_name || item.target_unit}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-xs font-semibold text-slate-800 block">{item.category}</span>
                            <span className="text-[11px] text-brand-700 font-medium bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {item.target_unit}
                            </span>
                          </td>

                          <td className="px-5 py-4 max-w-xs">
                            <p className="font-bold text-xs text-slate-900 line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.content}</p>
                            {item.attachment_url && (
                              <a
                                href={item.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:underline mt-1"
                              >
                                <ExternalLink size={10} />
                                <span>Xem tệp đính kèm</span>
                              </a>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badge}`}>
                              <StatusIcon size={13} />
                              <span>{statusInfo.label}</span>
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            {item.reward_amount > 0 ? (
                              <span className="font-black text-amber-700 text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                                +{Number(item.reward_amount).toLocaleString('vi-VN')} đ
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEval(item)}
                                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                              >
                                <ShieldCheck size={13} />
                                <span>Thẩm Định</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 size={15} />
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

      {/* ================= MODAL: THẨM ĐỊNH & PHẢN HỒI (DÀNH CHO QUẢN LÝ / ADMIN) ================= */}
      {evalModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-brand-500/20 text-brand-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base">Thẩm Định Sáng Kiến #{selectedItem.id}</h3>
                  <p className="text-xs text-slate-300">Gửi phản hồi & quyết định khen thưởng cho người đề xuất</p>
                </div>
              </div>
              <button
                onClick={() => setEvalModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveEval} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Thông tin bài gửi */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Tác giả: <strong className="text-slate-900">{selectedItem.fullname}</strong></span>
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{selectedItem.target_unit}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{selectedItem.title}</h4>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{selectedItem.content}</p>
                {selectedItem.efficiency && (
                  <p className="text-xs text-slate-600"><strong>Hiệu quả ước tính:</strong> {selectedItem.efficiency}</p>
                )}
              </div>

              {/* Cập nhật trạng thái */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Quyết Định Trạng Thái Thẩm Định *
                </label>
                <select
                  value={evalData.status}
                  onChange={(e) => setEvalData({ ...evalData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                  <option value="Đang thẩm định">Đang thẩm định (Ban QL đang đánh giá)</option>
                  <option value="Thử nghiệm">Thử nghiệm (Đang áp dụng thử ở xưởng/kho)</option>
                  <option value="Đã áp dụng thành công">Đã áp dụng thành công (Chính thức)</option>
                  <option value="Khen thưởng">Khen thưởng (Áp dụng xuất sắc & Trao thưởng)</option>
                  <option value="Từ chối / Lưu trữ">Lưu trữ / Chưa áp dụng</option>
                </select>
              </div>

              {/* Viết phản hồi cho nhân viên */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Ý Kiến Phản Hồi Từ Ban Giám Đốc / Quản Lý *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nhận xét, hướng dẫn triển khai hoặc lý do khen thưởng để gửi trực tiếp cho nhân viên..."
                  value={evalData.response_notes}
                  onChange={(e) => setEvalData({ ...evalData, response_notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Mức tiền thưởng khen thưởng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    3. Mức Tiền Khen Thưởng (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="0"
                    value={evalData.reward_amount}
                    onChange={(e) => setEvalData({ ...evalData, reward_amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-bold text-amber-700 focus:border-brand-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Ví dụ: 500,000 hoặc 1,000,000 VNĐ</span>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Chi Phí Tiết Kiệm Thực Tế (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    placeholder="0"
                    value={evalData.cost_savings}
                    onChange={(e) => setEvalData({ ...evalData, cost_savings: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle size={15} />
                  <span>LƯU THẨM ĐỊNH & GỬI PHẢN HỒI</span>
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
