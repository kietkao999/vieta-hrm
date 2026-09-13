import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package,
  Truck,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Building2,
  Trash2,
  Edit,
  Eye,
  FileText,
  XCircle,
  Laptop,
  Layers,
  ArrowRightLeft,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const CATEGORY_CONFIG = {
  'Xe cộ & Vận tải': { icon: Truck, badge: 'bg-blue-50 text-blue-800 border-blue-200', color: 'text-blue-600' },
  'Máy móc sản xuất': { icon: Wrench, badge: 'bg-amber-50 text-amber-800 border-amber-200', color: 'text-amber-600' },
  'Thiết bị kho bãi': { icon: Package, badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', color: 'text-emerald-600' },
  'Thiết bị IT & Văn phòng': { icon: Laptop, badge: 'bg-purple-50 text-purple-800 border-purple-200', color: 'text-purple-600' },
  'Bảo hộ & Đồng phục': { icon: ShieldCheck, badge: 'bg-slate-50 text-slate-800 border-slate-200', color: 'text-slate-600' }
};

const STATUS_CONFIG = {
  'Đang sử dụng': { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  'Sẵn sàng cấp phát': { badge: 'bg-blue-50 text-blue-800 border-blue-200', icon: Clock },
  'Đang bảo trì / Sửa chữa': { badge: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle },
  'Hỏng / Chờ thanh lý': { badge: 'bg-rose-50 text-rose-800 border-rose-200', icon: XCircle },
  'Đã thanh lý': { badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle }
};

const TICKET_STATUS_CONFIG = {
  'Chờ tiếp nhận': { badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Đang xử lý': { badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Đã hoàn thành': { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Không thể sửa': { badge: 'bg-rose-100 text-rose-800 border-rose-200' }
};

const AssetManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'ADMIN';
  const isAdminOrManager = user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER';

  // Tabs: 'inventory' | 'allocations' | 'maintenance' | 'schedule'
  const [activeTab, setActiveTab] = useState('inventory');

  // Data states
  const [assets, setAssets] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal: Add / Edit Asset
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({
    code: '',
    name: '',
    category: 'Máy móc sản xuất',
    department_id: '',
    assigned_to: '',
    serial_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 0,
    status: 'Đang sử dụng',
    specifications: '',
    next_maintenance_date: '',
    location: '',
    notes: ''
  });

  // Modal: Detail View
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);

  // Modal: Handover / Allocation
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [allocAsset, setAllocAsset] = useState(null);
  const [allocForm, setAllocForm] = useState({
    action: 'allocate',
    employee_id: '',
    condition: 'Hoạt động tốt khi bàn giao',
    notes: ''
  });

  // Modal: Create Maintenance Ticket
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    asset_id: '',
    title: '',
    description: '',
    priority: 'Trung bình'
  });

  // Modal: Process Ticket (Admin / Manager)
  const [processTicketModalOpen, setProcessTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketProcessForm, setTicketProcessForm] = useState({
    status: 'Đang xử lý',
    repair_cost: 0,
    repaired_by: '',
    notes: ''
  });

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, statsRes, ticketsRes, deptsRes, empsRes] = await Promise.all([
        api.get('/assets'),
        api.get('/assets/stats'),
        api.get('/assets/maintenance/tickets'),
        api.get('/departments'),
        api.get('/employees')
      ]);

      setAssets(assetsRes.data || []);
      setStats(statsRes.data || null);
      setTickets(ticketsRes.data || []);
      setDepartments(deptsRes.data || []);
      setEmployees(empsRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu tài sản:', err);
      setError('Không thể kết nối máy chủ để tải dữ liệu tài sản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Assets
  const filteredAssets = assets.filter(item => {
    const matchSearch = !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = !filterDept || String(item.department_id) === String(filterDept);
    const matchCategory = !filterCategory || item.category === filterCategory;
    const matchStatus = !filterStatus || item.status === filterStatus;

    return matchSearch && matchDept && matchCategory && matchStatus;
  });

  // Handle Save Asset (Create / Update)
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, assetForm);
        setSuccess(`Đã cập nhật thông tin tài sản ${assetForm.code || editingAsset.code}!`);
      } else {
        await api.post('/assets', assetForm);
        setSuccess('Thêm tài sản / thiết bị mới thành công!');
      }
      setAssetModalOpen(false);
      setEditingAsset(null);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu thông tin tài sản.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingAsset(item);
    setAssetForm({
      code: item.code || '',
      name: item.name || '',
      category: item.category || 'Máy móc sản xuất',
      department_id: item.department_id || '',
      assigned_to: item.assigned_to || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      purchase_price: item.purchase_price || 0,
      status: item.status || 'Đang sử dụng',
      specifications: item.specifications || '',
      next_maintenance_date: item.next_maintenance_date || '',
      location: item.location || '',
      notes: item.notes || ''
    });
    setAssetModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = async (id) => {
    try {
      const res = await api.get(`/assets/${id}`);
      setSelectedAssetDetail(res.data);
      setDetailModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Handover / Allocate Modal
  const handleOpenAlloc = (item, actionType = 'allocate') => {
    setAllocAsset(item);
    setAllocForm({
      action: actionType,
      employee_id: item.assigned_to || '',
      condition: 'Hoạt động tốt khi bàn giao',
      notes: ''
    });
    setAllocModalOpen(true);
  };

  // Submit Handover / Allocation
  const handleSaveAlloc = async (e) => {
    e.preventDefault();
    if (!allocAsset) return;
    try {
      await api.post(`/assets/${allocAsset.id}/allocate`, allocForm);
      setSuccess(allocForm.action === 'revoke' ? 'Đã thu hồi tài sản về kho!' : 'Đã cấp phát tài sản cho nhân viên!');
      setAllocModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cấp phát tài sản.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài sản "${name}"? Thao tác này sẽ xóa toàn bộ lịch sử liên quan!`)) {
      try {
        await api.delete(`/assets/${id}`);
        setSuccess('Đã xóa tài sản thành công.');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi xóa tài sản.');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  // Submit Maintenance Ticket
  const handleSaveTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets/maintenance/tickets', ticketForm);
      setSuccess('Đã gửi phiếu báo hỏng thiết bị thành công!');
      setTicketModalOpen(false);
      setTicketForm({ asset_id: '', title: '', description: '', priority: 'Trung bình' });
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gửi phiếu báo hỏng.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Process Maintenance Ticket
  const handleSaveProcessTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await api.put(`/assets/maintenance/tickets/${selectedTicket.id}`, ticketProcessForm);
      setSuccess('Đã cập nhật tiến độ xử lý sửa chữa!');
      setProcessTicketModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi cập nhật phiếu.');
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full bg-brand-500/20 border border-brand-400/30 px-3 py-0.5 text-xs font-semibold text-brand-300 mb-1.5">
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Hệ Thống Quản Trị Công Cụ Dụng Cụ & Tài Sản Doanh Nghiệp</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <Package className="text-brand-400" size={24} />
            <span>QUẢN LÝ TÀI SẢN & THIẾT BỊ</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Kiểm soát máy móc xưởng nệm/gối, đội xe tải vận tải, thiết bị kho bãi và trang thiết bị văn phòng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTicketForm({ asset_id: '', title: '', description: '', priority: 'Trung bình' });
              setTicketModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <AlertTriangle size={14} />
            <span>Báo Hỏng Thiết Bị</span>
          </button>

          {isAdminOrManager && (
            <button
              onClick={() => {
                setEditingAsset(null);
                setAssetForm({
                  code: '',
                  name: '',
                  category: 'Máy móc sản xuất',
                  department_id: '',
                  assigned_to: '',
                  serial_number: '',
                  purchase_date: new Date().toISOString().split('T')[0],
                  purchase_price: 0,
                  status: 'Đang sử dụng',
                  specifications: '',
                  next_maintenance_date: '',
                  location: '',
                  notes: ''
                });
                setAssetModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm Tài Sản Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 shadow-xs text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 shadow-xs text-xs font-semibold animate-in fade-in">
          <AlertCircle className="text-rose-600 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Package size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Tổng Tài Sản</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {stats?.total_count || assets.length} <span className="text-xs font-normal text-slate-500">thiết bị</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Giá trị: {Number(stats?.total_value || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Đang Sử Dụng</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 leading-tight">
              {stats?.in_use_count || 0} <span className="text-xs font-normal text-slate-500">thiết bị</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Vận hành bình thường</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Wrench size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Bảo Trì & Báo Hỏng</span>
            <span className="text-lg sm:text-xl font-black text-amber-700 leading-tight">
              {tickets.filter(t => t.status === 'Chờ tiếp nhận' || t.status === 'Đang xử lý').length} <span className="text-xs font-normal text-slate-500">phiếu</span>
            </span>
            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Cần kỹ thuật xử lý</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Đăng Kiểm & Bảo Dưỡng</span>
            <span className="text-lg sm:text-xl font-black text-indigo-700 leading-tight">
              {stats?.upcoming_maintenance?.length || 0} <span className="text-xs font-normal text-slate-500">đến hạn</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Trong 45 ngày tới</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl w-fit max-w-full overflow-x-auto custom-scroll-x">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Package size={15} className={activeTab === 'inventory' ? 'text-brand-700' : 'text-slate-400'} />
          <span>Tài Sản & Thiết Bị ({filteredAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
            activeTab === 'maintenance'
              ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Wrench size={15} className={activeTab === 'maintenance' ? 'text-amber-600' : 'text-slate-400'} />
          <span>Báo Hỏng & Sửa Chữa ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
            activeTab === 'schedule'
              ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Calendar size={15} className={activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Lịch Bảo Trì & Xe</span>
        </button>
      </div>

      {/* ================= TAB 1: DANH MỤC TÀI SẢN ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Bộ lọc tài sản */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
            <div className="flex items-center space-x-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm mã, tên máy, biển số, người giữ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none w-full md:w-auto"
              >
                <option value="">Tất cả phòng ban / xưởng / kho</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none w-full md:w-auto"
              >
                <option value="">Tất cả loại tài sản</option>
                {Object.keys(CATEGORY_CONFIG).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none w-full md:w-auto"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.keys(STATUS_CONFIG).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GIAO DIỆN DI ĐỘNG: MOBILE CARDS (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                <RefreshCw className="animate-spin inline mr-2" size={16} /> Đang tải danh mục tài sản...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                Không tìm thấy tài sản nào phù hợp với bộ lọc.
              </div>
            ) : (
              filteredAssets.map(item => {
                const catInfo = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['Máy móc sản xuất'];
                const CatIcon = catInfo.icon;
                const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG['Đang sử dụng'];
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                    {/* Header: Code + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-brand-700 font-mono font-bold bg-brand-50 border border-brand-200/80 px-2 py-0.5 rounded-lg">
                        {item.code}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badge}`}>
                        <StatusIcon size={10} />
                        <span>{item.status}</span>
                      </span>
                    </div>

                    {/* Name & Category */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${catInfo.badge}`}>
                          <CatIcon size={10} />
                          <span>{item.category}</span>
                        </span>
                        {item.serial_number && (
                          <span className="text-[10px] text-slate-700 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Seri/Biển: {item.serial_number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Department & Responsible Person */}
                    <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Phòng ban:</span>
                        <span className="font-bold text-slate-800 flex items-center space-x-1">
                          <Building2 size={12} className="text-slate-400" />
                          <span>{item.department_name || 'Toàn công ty'}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Người phụ trách:</span>
                        <span className="font-bold text-slate-800">
                          {item.assigned_to_name || <em className="text-slate-400 font-normal">Chưa bàn giao</em>}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Price & Actions */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Giá trị</span>
                        <span className="text-xs font-black text-slate-900">
                          {Number(item.purchase_price || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenDetail(item.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Xem</span>
                        </button>

                        {isAdminOrManager && (
                          <>
                            <button
                              onClick={() => handleOpenAlloc(item, item.assigned_to ? 'revoke' : 'allocate')}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <ArrowRightLeft size={13} />
                              <span>{item.assigned_to ? 'Thu hồi' : 'Giao'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer"
                              title="Sửa"
                            >
                              <Edit size={14} />
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAsset(item.id, item.name)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* GIAO DIỆN DESKTOP / TABLET: BẢNG DỮ LIỆU (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scroll-x">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Mã & Tên Tài Sản</th>
                    <th className="px-4 py-3">Loại Tài Sản</th>
                    <th className="px-4 py-3">Phòng Ban / Vị Trí</th>
                    <th className="px-4 py-3">Người Chịu Trách Nhiệm</th>
                    <th className="px-4 py-3">Số Seri / Biển Số</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        <RefreshCw className="animate-spin inline mr-2" size={16} /> Đang tải danh mục tài sản...
                      </td>
                    </tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        Không tìm thấy tài sản nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(item => {
                      const catInfo = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['Máy móc sản xuất'];
                      const CatIcon = catInfo.icon;
                      const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG['Đang sử dụng'];
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                            <div className="text-[10px] text-brand-700 font-mono font-bold mt-0.5">{item.code}</div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catInfo.badge}`}>
                              <CatIcon size={11} />
                              <span>{item.category}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800 flex items-center space-x-1">
                              <Building2 size={12} className="text-slate-400" />
                              <span>{item.department_name || 'Toàn công ty'}</span>
                            </div>
                            {item.location && (
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.location}</div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {item.assigned_to_name ? (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                                  {item.assigned_to_name[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{item.assigned_to_name}</div>
                                  <div className="text-[10px] text-slate-400">{item.assigned_to_position || item.assigned_to_code}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Chưa bàn giao</span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                            {item.serial_number || '---'}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}>
                              <StatusIcon size={10} />
                              <span>{item.status}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenDetail(item.id)}
                              title="Xem chi tiết & lịch sử"
                              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition cursor-pointer"
                            >
                              <Eye size={14} />
                            </button>

                            {isAdminOrManager && (
                              <>
                                <button
                                  onClick={() => handleOpenAlloc(item, item.assigned_to ? 'revoke' : 'allocate')}
                                  title={item.assigned_to ? 'Thu hồi tài sản về kho' : 'Bàn giao cho nhân viên'}
                                  className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                                >
                                  <ArrowRightLeft size={14} />
                                </button>

                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  title="Chỉnh sửa thông tin"
                                  className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-amber-600 transition cursor-pointer"
                                >
                                  <Edit size={14} />
                                </button>
                              </>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteAsset(item.id, item.name)}
                                title="Xóa tài sản"
                                className="p-1 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
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

      {/* ================= TAB 2: PHIẾU BÁO HỎNG & SỬA CHỮA ================= */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Wrench size={16} className="text-brand-600" />
              <span>Danh Sách Phiếu Yêu Cầu Sửa Chữa & Bảo Trì</span>
            </h2>

            <button
              onClick={() => {
                setTicketForm({ asset_id: '', title: '', description: '', priority: 'Trung bình' });
                setTicketModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Gửi Báo Hỏng Mới</span>
            </button>
          </div>

          {/* Giao diện Mobile Cards cho Phiếu báo hỏng (block md:hidden) */}
          <div className="block md:hidden space-y-3">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                Chưa có phiếu báo hỏng thiết bị nào.
              </div>
            ) : (
              tickets.map(t => {
                const st = TICKET_STATUS_CONFIG[t.status] || TICKET_STATUS_CONFIG['Chờ tiếp nhận'];
                return (
                  <div key={t.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        #BH-{t.id} • {t.created_at?.split('T')[0]}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.badge}`}>
                        {t.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">{t.title}</h4>
                      <p className="text-xs text-brand-700 font-semibold mt-0.5">{t.asset_name} ({t.asset_code})</p>
                      {t.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Người báo: <strong>{t.reported_by_name}</strong></span>
                        {t.repair_cost > 0 && (
                          <div className="font-bold text-slate-900 mt-0.5">Chi phí: {Number(t.repair_cost).toLocaleString('vi-VN')} đ</div>
                        )}
                      </div>

                      {isAdminOrManager && (
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setTicketProcessForm({
                              status: t.status || 'Đang xử lý',
                              repair_cost: t.repair_cost || 0,
                              repaired_by: t.repaired_by || '',
                              notes: t.notes || ''
                            });
                            setProcessTicketModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition cursor-pointer"
                        >
                          Cập nhật
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Giao diện Desktop Table cho Phiếu báo hỏng (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scroll-x">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Mã Phiếu & Ngày</th>
                    <th className="px-4 py-3">Tài Sản Sự Cố</th>
                    <th className="px-4 py-3">Người Báo Hỏng</th>
                    <th className="px-4 py-3">Nội Dung Sự Cố</th>
                    <th className="px-4 py-3 text-center">Mức Độ</th>
                    <th className="px-4 py-3 text-center">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Chi Phí Sửa</th>
                    <th className="px-4 py-3 text-right">Xử Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        Chưa có phiếu báo hỏng thiết bị nào.
                      </td>
                    </tr>
                  ) : (
                    tickets.map(t => {
                      const st = TICKET_STATUS_CONFIG[t.status] || TICKET_STATUS_CONFIG['Chờ tiếp nhận'];
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">#BH-{t.id}</div>
                            <div className="text-[10px] text-slate-400">{t.created_at?.split('T')[0]}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{t.asset_name}</div>
                            <div className="text-[10px] text-brand-700 font-mono">{t.asset_code}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{t.reported_by_name}</div>
                            <div className="text-[10px] text-slate-400">{t.reported_by_code}</div>
                          </td>

                          <td className="px-4 py-3 max-w-[220px]">
                            <div className="font-bold text-slate-900">{t.title}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-1">{t.description || 'Không có ghi chú'}</div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'Khẩn cấp' || t.priority === 'Cao'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {t.priority}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.badge}`}>
                              {t.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {t.repair_cost > 0 ? `${Number(t.repair_cost).toLocaleString('vi-VN')} đ` : '---'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {isAdminOrManager ? (
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setTicketProcessForm({
                                    status: t.status || 'Đang xử lý',
                                    repair_cost: t.repair_cost || 0,
                                    repaired_by: t.repaired_by || '',
                                    notes: t.notes || ''
                                  });
                                  setProcessTicketModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                              >
                                Cập nhật
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Xem</span>
                            )}
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

      {/* ================= TAB 3: LỊCH BẢO TRÌ & ĐĂNG KIỂM XE ================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <strong className="block font-bold">Cảnh Báo Định Kỳ Tự Động:</strong>
              Hệ thống theo dõi hạn đăng kiểm xe tải, hạn bảo hiểm xe và chu kỳ bảo dưỡng máy may viền nệm, máy dán keo, máy thổi gòn xưởng.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.filter(a => a.next_maintenance_date).map(asset => {
              const daysLeft = Math.ceil((new Date(asset.next_maintenance_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 30;

              return (
                <div key={asset.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-brand-700">{asset.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isUrgent ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {daysLeft > 0 ? `Còn ${daysLeft} ngày` : `Quá hạn ${Math.abs(daysLeft)} ngày`}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 leading-snug">{asset.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Vị trí: {asset.location || asset.department_name}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Người phụ trách: <strong>{asset.assigned_to_name || 'Chưa gán'}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Hạn bảo dưỡng:</span>
                    <span className="font-bold font-mono text-slate-800">{asset.next_maintenance_date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA TÀI SẢN ================= */}
      {assetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Package size={18} className="text-brand-600" />
                <span>{editingAsset ? 'Chỉnh Sửa Tài Sản & Thiết Bị' : 'Thêm Mới Tài Sản & Thiết Bị'}</span>
              </h3>
              <button onClick={() => setAssetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã tài sản (Tùy chọn tự sinh)</label>
                  <input
                    type="text"
                    placeholder="VD: TS-OTO-03, TS-MAY-05..."
                    value={assetForm.code}
                    onChange={(e) => setAssetForm({ ...assetForm, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên tài sản / Thiết bị *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Xe Tải Isuzu 2.5T, Máy May Viền Juki..."
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại tài sản *</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                  >
                    {Object.keys(CATEGORY_CONFIG).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng ban / Xưởng / Kho</label>
                  <select
                    value={assetForm.department_id}
                    onChange={(e) => setAssetForm({ ...assetForm, department_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Người quản lý trực tiếp</label>
                  <select
                    value={assetForm.assigned_to}
                    onChange={(e) => setAssetForm({ ...assetForm, assigned_to: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                  >
                    <option value="">-- Chưa gán (Kho giữ) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.code} - {emp.fullname}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Seri / Biển Số Xe</label>
                  <input
                    type="text"
                    placeholder="VD: 65C-123.45 hoặc Seri máy"
                    value={assetForm.serial_number}
                    onChange={(e) => setAssetForm({ ...assetForm, serial_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày mua / Đưa vào dùng</label>
                  <input
                    type="date"
                    value={assetForm.purchase_date}
                    onChange={(e) => setAssetForm({ ...assetForm, purchase_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguyên giá (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={assetForm.purchase_price}
                    onChange={(e) => setAssetForm({ ...assetForm, purchase_price: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={assetForm.status}
                    onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                  >
                    {Object.keys(STATUS_CONFIG).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn đăng kiểm / Bảo trì tới</label>
                  <input
                    type="date"
                    value={assetForm.next_maintenance_date}
                    onChange={(e) => setAssetForm({ ...assetForm, next_maintenance_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị trí cụ thể</label>
                  <input
                    type="text"
                    placeholder="VD: Xưởng Nệm chuyền 1, Kho CT..."
                    value={assetForm.location}
                    onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thông số kỹ thuật / Đặc tính</label>
                <textarea
                  rows={2}
                  placeholder="Thông số công suất, tải trọng, model..."
                  value={assetForm.specifications}
                  onChange={(e) => setAssetForm({ ...assetForm, specifications: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingAsset ? 'Lưu Thay Đổi' : 'Thêm Tài Sản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CẤP PHÁT / THU HỒI TÀI SẢN ================= */}
      {allocModalOpen && allocAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ArrowRightLeft size={18} className="text-brand-600" />
                <span>Bàn Giao & Cấp Phát Tài Sản</span>
              </h3>
              <button onClick={() => setAllocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{allocAsset.name}</div>
              <div className="text-slate-500 font-mono">Mã: {allocAsset.code} | Seri: {allocAsset.serial_number || '---'}</div>
              <div className="text-slate-600">
                Hiện tại: <strong>{allocAsset.assigned_to_name ? `Bàn giao cho ${allocAsset.assigned_to_name}` : 'Đang ở kho (Chưa cấp phát)'}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveAlloc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thao tác *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocForm({ ...allocForm, action: 'allocate' })}
                    className={`py-2 rounded-xl border font-bold text-center transition cursor-pointer ${
                      allocForm.action === 'allocate'
                        ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Bàn Giao Nhân Viên
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllocForm({ ...allocForm, action: 'revoke' })}
                    className={`py-2 rounded-xl border font-bold text-center transition cursor-pointer ${
                      allocForm.action === 'revoke'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Thu Hồi Về Kho
                  </button>
                </div>
              </div>

              {allocForm.action === 'allocate' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn nhân viên tiếp nhận *</label>
                  <select
                    required
                    value={allocForm.employee_id}
                    onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.code} - {emp.fullname} ({emp.department_name || 'NV'})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tình trạng khi bàn giao / thu hồi</label>
                <input
                  type="text"
                  value={allocForm.condition}
                  onChange={(e) => setAllocForm({ ...allocForm, condition: e.target.value })}
                  placeholder="VD: Máy mới 100%, hoạt động tốt, xe sạch sẽ..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  value={allocForm.notes}
                  onChange={(e) => setAllocForm({ ...allocForm, notes: e.target.value })}
                  placeholder="Ghi chú điều chuyển..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAllocModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GỬI PHIẾU BÁO HỎNG ================= */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <span>Gửi Phiếu Báo Hỏng Thiết Bị</span>
              </h3>
              <button onClick={() => setTicketModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn tài sản / Thiết bị gặp sự cố *</label>
                <select
                  required
                  value={ticketForm.asset_id}
                  onChange={(e) => setTicketForm({ ...ticketForm, asset_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="">-- Chọn thiết bị / máy móc / xe --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.department_name || a.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề sự cố *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Máy may bị đứt chỉ liên tục, Xe tải bị xì lốp..."
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức độ khẩn cấp</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="Thấp">Thấp (Có thể chờ)</option>
                  <option value="Trung bình">Trung bình (Trong ca làm)</option>
                  <option value="Cao">Cao (Ảnh hưởng tiến độ sản xuất/giao hàng)</option>
                  <option value="Khẩn cấp">Khẩn cấp (Dừng dây chuyền/xe gặp sự cố dọc đường)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết sự cố</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả cụ thể hiện trạng hỏng hóc, vị trí xảy ra sự cố..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer shadow-xs"
                >
                  Gửi Báo Hỏng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XỬ LÝ PHIẾU BẢO TRÌ ================= */}
      {processTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Wrench size={18} className="text-brand-600" />
                <span>Cập Nhật Xử Lý Sự Cố #{selectedTicket.id}</span>
              </h3>
              <button onClick={() => setProcessTicketModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedTicket.asset_name}</div>
              <div className="text-slate-600">Sự cố: <strong>{selectedTicket.title}</strong></div>
              <div className="text-slate-500">Người báo: {selectedTicket.reported_by_name} ({selectedTicket.created_at?.split('T')[0]})</div>
            </div>

            <form onSubmit={handleSaveProcessTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng thái xử lý *</label>
                <select
                  value={ticketProcessForm.status}
                  onChange={(e) => setTicketProcessForm({ ...ticketProcessForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                  <option value="Đang xử lý">Đang xử lý (Đang sửa chữa)</option>
                  <option value="Đã hoàn thành">Đã hoàn thành (Thiết bị hoạt động lại)</option>
                  <option value="Không thể sửa">Không thể sửa (Hỏng nặng / Chờ thanh lý)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chi phí sửa chữa / Thay phụ tùng (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={ticketProcessForm.repair_cost}
                  onChange={(e) => setTicketProcessForm({ ...ticketProcessForm, repair_cost: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn vị / Thợ kỹ thuật sửa chữa</label>
                <input
                  type="text"
                  placeholder="VD: Kỹ thuật xưởng, Gara ô tô Tiền Giang..."
                  value={ticketProcessForm.repaired_by}
                  onChange={(e) => setTicketProcessForm({ ...ticketProcessForm, repaired_by: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú kết quả sửa chữa</label>
                <textarea
                  rows={2}
                  value={ticketProcessForm.notes}
                  onChange={(e) => setTicketProcessForm({ ...ticketProcessForm, notes: e.target.value })}
                  placeholder="Ghi chú linh kiện đã thay, bảo hành..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setProcessTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Lưu Tiến Độ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XEM CHI TIẾT TÀI SẢN & LỊCH SỬ ================= */}
      {detailModalOpen && selectedAssetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-700">{selectedAssetDetail.code}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedAssetDetail.name}</h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Loại tài sản:</span>
                <strong className="text-slate-800">{selectedAssetDetail.category}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phòng ban / Xưởng:</span>
                <strong className="text-slate-800">{selectedAssetDetail.department_name || 'Chung'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Số seri / Biển số:</span>
                <strong className="font-mono text-slate-800">{selectedAssetDetail.serial_number || '---'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Người chịu trách nhiệm:</span>
                <strong className="text-slate-800">{selectedAssetDetail.assigned_to_name || 'Chưa bàn giao'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ngày đưa vào dùng:</span>
                <strong className="text-slate-800">{selectedAssetDetail.purchase_date || '---'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nguyên giá:</span>
                <strong className="text-slate-800">{Number(selectedAssetDetail.purchase_price || 0).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>

            {selectedAssetDetail.specifications && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Thông số kỹ thuật:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedAssetDetail.specifications}
                </p>
              </div>
            )}

            {/* Lịch sử cấp phát */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <ArrowRightLeft size={14} className="text-brand-600" />
                <span>Lịch Sử Bàn Giao & Cấp Phát</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {selectedAssetDetail.allocations?.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">Chưa có lịch sử bàn giao.</p>
                ) : (
                  selectedAssetDetail.allocations?.map(al => (
                    <div key={al.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex justify-between items-center">
                      <div>
                        <strong>{al.fullname}</strong> ({al.employee_code})
                        <span className="text-slate-400 block text-[10px]">
                          Từ ngày: {al.allocated_date} {al.returned_date ? `➔ Đã trả: ${al.returned_date}` : '➔ Đang giữ'}
                        </span>
                      </div>
                      <span className="text-slate-500 italic text-[10px]">{al.condition_on_alloc}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lịch sử sửa chữa */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Wrench size={14} className="text-amber-600" />
                <span>Lịch Sử Sửa Chữa & Bảo Trì</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {selectedAssetDetail.maintenance_tickets?.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">Chưa có phiếu sửa chữa nào.</p>
                ) : (
                  selectedAssetDetail.maintenance_tickets?.map(tk => (
                    <div key={tk.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex justify-between items-center">
                      <div>
                        <strong>{tk.title}</strong>
                        <span className="text-slate-400 block text-[10px]">
                          Báo ngày: {tk.created_at?.split('T')[0]} | Trạng thái: {tk.status}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {tk.repair_cost > 0 ? `${Number(tk.repair_cost).toLocaleString('vi-VN')} đ` : '---'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagementPage;
