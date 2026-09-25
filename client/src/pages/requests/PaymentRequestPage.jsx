import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  DollarSign,
  TrendingUp,
  Printer,
  Eye,
  Trash2,
  Building2,
  CreditCard,
  Layers,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Receipt,
  Paperclip,
  ArrowRight,
  ShieldCheck,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import WorkflowCreateModal from './WorkflowCreateModal';
import WorkflowDetailModal from './WorkflowDetailModal';
import PrintWorkflowModal from './PrintWorkflowModal';
import AttachmentLightbox from './AttachmentLightbox';

const PaymentRequestPage = () => {
  const { user } = useAuth();

  // Active Main Tab: 'PURCHASE' | 'PAYMENT' | 'ATTACHMENTS'
  const [activeMainTab, setActiveMainTab] = useState('PURCHASE');

  // Stats & List Data
  const [stats, setStats] = useState({
    purchase: { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 },
    payment: { total: 0, pending: 0, paid: 0, rejected: 0, totalPaidAmount: 0, totalAmount: 0 }
  });

  const [purchaseList, setPurchaseList] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [userTabScope, setUserTabScope] = useState('all'); // 'all' | 'my_requests' | 'to_approve'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('PURCHASE');
  const [sourcePurchaseForPayment, setSourcePurchaseForPayment] = useState(null);

  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
  const [detailType, setDetailType] = useState('PURCHASE');
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [printRequest, setPrintRequest] = useState(null);
  const [printType, setPrintType] = useState('PURCHASE');
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const [activeLightboxFile, setActiveLightboxFile] = useState(null);

  // Departments list
  const departments = [
    'Khối văn phòng',
    'Phòng kinh doanh',
    'Phòng Marketing',
    'Kho Cần Thơ',
    'Kho Mỹ Tho',
    'Xưởng sản xuất nệm',
    'Xưởng sản xuất gối',
    'Ban giám đốc'
  ];

  // Fetch dữ liệu
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Stats
      const statsRes = await api.get('/requests/stats');
      if (statsRes.data) setStats(statsRes.data);

      const params = {
        tab: userTabScope,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        priority: filterPriority !== 'ALL' ? filterPriority : undefined,
        department: filterDept !== 'ALL' ? filterDept : undefined,
        search: searchTerm.trim() || undefined
      };

      // 2. Lists
      const [purRes, payRes] = await Promise.all([
        api.get('/requests/purchase', { params }),
        api.get('/requests/payment', { params })
      ]);

      setPurchaseList(purRes.data?.data || []);
      setPaymentList(payRes.data?.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu đề xuất:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userTabScope, filterStatus, filterPriority, filterDept, searchTerm]);

  // Format currency
  const formatMoney = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Mở modal tạo mới
  const handleOpenCreate = (mode = 'PURCHASE', sourcePur = null) => {
    setCreateInitialMode(mode);
    setSourcePurchaseForPayment(sourcePur);
    setIsCreateOpen(true);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = (req, type) => {
    setSelectedDetailRequest(req);
    setDetailType(type);
    setIsDetailOpen(true);
  };

  // Mở modal in ấn
  const handleOpenPrint = async (req, type) => {
    try {
      let fullData = req;
      if (!req.items || req.items.length === 0 || !req.attachments) {
        const endpoint = type === 'PURCHASE' ? `/requests/purchase/${req.id}` : `/requests/payment/${req.id}`;
        const res = await api.get(endpoint);
        if (res.data?.data) {
          fullData = res.data.data;
        }
      }
      setPrintRequest(fullData);
      setPrintType(type);
      setIsPrintOpen(true);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu in:', err);
      setPrintRequest(req);
      setPrintType(type);
      setIsPrintOpen(true);
    }
  };

  // Xóa phiếu
  const handleDelete = async (e, req, type) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc muốn xóa phiếu ${req.code}?`)) return;

    try {
      const endpoint = type === 'PURCHASE' ? `/requests/purchase/${req.id}` : `/requests/payment/${req.id}`;
      await api.delete(endpoint);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa phiếu này.');
    }
  };

  // Render badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_HOD':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Chờ TP duyệt</span>
          </span>
        );
      case 'PENDING_ACC':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-300">
            <Clock className="w-3 h-3 text-orange-600 animate-pulse" />
            <span>Chờ Kế toán</span>
          </span>
        );
      case 'PENDING_BOD':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
            <Clock className="w-3 h-3 text-indigo-600 animate-pulse" />
            <span>Chờ BGĐ duyệt</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã duyệt chủ trương</span>
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-xs">
            <Banknote className="w-3 h-3 text-blue-600" />
            <span>Đã chi tiền</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Từ chối</span>
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100">{status}</span>;
    }
  };

  // Tổng hợp tất cả file chứng từ đã đính kèm
  const allAttachments = useMemo(() => {
    const list = [];
    purchaseList.forEach(p => {
      if (p.attachments) {
        p.attachments.forEach(a => list.push({ ...a, sourceCode: p.code, sourceDept: p.department }));
      }
    });
    paymentList.forEach(p => {
      if (p.attachments) {
        p.attachments.forEach(a => list.push({ ...a, sourceCode: p.code, sourceDept: p.department }));
      }
    });
    return list;
  }, [purchaseList, paymentList]);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white rounded-2xl shadow-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide">QUY TRÌNH ĐỀ XUẤT & THANH TOÁN (3 PHẦN)</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              1. Mua dịch vụ (Mẫu 01) ➔ 2. Hóa đơn & Chứng từ gốc ➔ 3. Đề nghị thanh toán (Mẫu 02)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenCreate('PURCHASE')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Tạo Đề Nghị Mua Dịch Vụ</span>
          </button>

          <button
            onClick={() => handleOpenCreate('PAYMENT')}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>3. Tạo Đề Nghị Thanh Toán</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Mua dịch vụ chờ duyệt */}
        <div
          onClick={() => setActiveMainTab('PURCHASE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            activeMainTab === 'PURCHASE' ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-brand-300 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Mua Dịch Vụ Chờ Duyệt</span>
            <div className="text-2xl font-black text-brand-700 mt-1">{stats.purchase.pending}</div>
            <span className="text-[11px] text-slate-400">Đã duyệt: {stats.purchase.approved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Thanh toán chờ duyệt */}
        <div
          onClick={() => setActiveMainTab('PAYMENT')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            activeMainTab === 'PAYMENT' ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Thanh Toán Chờ Duyệt</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.payment.pending}</div>
            <span className="text-[11px] text-slate-400">Đã chi: {stats.payment.paid} phiếu</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Tổng chi phí đã giải ngân */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Đã Giải Ngân / Chi</span>
            <div className="text-lg font-black text-blue-700 font-mono mt-1">
              {formatMoney(stats.payment.totalPaidAmount)}
            </div>
            <span className="text-[11px] text-slate-400">Xuất quỹ thành công</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Tổng dự toán kinh phí */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng Dự Toán Mua Sắm</span>
            <div className="text-lg font-black text-purple-700 font-mono mt-1">
              {formatMoney(stats.purchase.totalAmount)}
            </div>
            <span className="text-[11px] text-slate-400">Toàn công ty</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2 TABS ĐIỀU HƯỚNG CHÍNH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveMainTab('PURCHASE')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'PURCHASE'
                  ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>PHẦN 1: Giấy đề nghị mua dịch vụ</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeMainTab === 'PURCHASE' ? 'bg-white text-brand-700' : 'bg-slate-200 text-slate-800'
              }`}>
                {purchaseList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('PAYMENT')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'PAYMENT'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>PHẦN 3: Giấy đề nghị thanh toán</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeMainTab === 'PAYMENT' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800 font-bold'
              }`}>
                {paymentList.length}
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUserTabScope('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                userTabScope === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setUserTabScope('my_requests')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                userTabScope === 'my_requests' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Của tôi
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Làm mới"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã phiếu, nội dung, người tạo, ngân hàng..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="ALL">Tất cả mức ưu tiên</option>
              <option value="KHANCAP">🔥 Khẩn cấp</option>
              <option value="BINHTHUONG">Bình thường</option>
              <option value="DUPHONG">Dự phòng</option>
            </select>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU PHẦN 1: MUA DỊCH VỤ */}
      {activeMainTab === 'PURCHASE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scroll-x">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-36">Mã Phiếu</th>
                  <th className="p-3.5 w-48">Người Lập & Bộ Phận</th>
                  <th className="p-3.5">Lý Do / Mục Đích Mua Dịch Vụ</th>
                  <th className="p-3.5 w-32 text-right">Dự Toán Chi Phí</th>
                  <th className="p-3.5 w-24 text-center">Ưu Tiên</th>
                  <th className="p-3.5 w-36 text-center">Trạng Thái</th>
                  <th className="p-3.5 w-44 text-center">Liên Kết Thanh Toán</th>
                  <th className="p-3.5 w-28 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : purchaseList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-slate-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Chưa có đề nghị mua dịch vụ nào</p>
                    </td>
                  </tr>
                ) : (
                  purchaseList.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => handleOpenDetail(req, 'PURCHASE')}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900">{req.code}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(req.created_at)}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{req.creator_name || req.creator_username}</div>
                        <div className="text-[11px] text-slate-500">{req.department}</div>
                        {req.approver_department && req.approver_department !== req.department && (
                          <div className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded mt-1 inline-block font-semibold">
                            ➜ Gửi duyệt: {req.approver_department}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <p className="text-slate-800 line-clamp-2">{req.purpose}</p>
                        {req.item_count > 0 && (
                          <span className="text-[10px] text-brand-600 font-semibold mt-0.5 inline-block">
                            ({req.item_count} dịch vụ chi tiết)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        {formatMoney(req.total_estimated_amount)}
                      </td>

                      <td className="p-3.5 text-center">
                        {req.priority === 'KHANCAP' ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            🔥 Khẩn cấp
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">
                            Bình thường
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">{renderStatusBadge(req.status)}</td>

                      {/* Nút hoặc Badge liên kết sang Phần 3 */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {req.linked_payment_id ? (
                          <button
                            onClick={() => {
                              const payReq = paymentList.find(p => p.id === req.linked_payment_id);
                              if (payReq) handleOpenDetail(payReq, 'PAYMENT');
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{req.linked_payment_code}</span>
                          </button>
                        ) : req.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleOpenCreate('PAYMENT', req)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs hover:shadow-md transition-all cursor-pointer animate-pulse"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>⚡ Tạo Thanh Toán</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Chờ duyệt chủ trương</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(req, 'PURCHASE')}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="In Mẫu 01/ĐN-DV"
                            onClick={() => handleOpenPrint(req, 'PURCHASE')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {(user?.roleName === 'ADMIN' || (req.user_id === user?.userId && req.status === 'PENDING_HOD')) && (
                            <button
                              title="Xóa phiếu"
                              onClick={(e) => handleDelete(e, req, 'PURCHASE')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BẢNG DỮ LIỆU PHẦN 3: ĐỀ NGHỊ THANH TOÁN */}
      {activeMainTab === 'PAYMENT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scroll-x">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-36">Mã Phiếu</th>
                  <th className="p-3.5 w-44">Người Lập & Đơn Vị</th>
                  <th className="p-3.5">Nội Dung Đề Nghị Thanh Toán</th>
                  <th className="p-3.5 w-36 text-right">Số Tiền (VNĐ)</th>
                  <th className="p-3.5 w-32">Hình Thức Chi</th>
                  <th className="p-3.5 w-36 text-center">Trạng Thái</th>
                  <th className="p-3.5 w-28 text-center">Chứng Từ</th>
                  <th className="p-3.5 w-28 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : paymentList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-slate-400">
                      <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Chưa có đề nghị thanh toán nào</p>
                    </td>
                  </tr>
                ) : (
                  paymentList.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => handleOpenDetail(req, 'PAYMENT')}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900">{req.code}</span>
                        {req.purchase_code && (
                          <div className="text-[10px] text-brand-600 font-semibold mt-0.5">
                            Kế thừa: {req.purchase_code}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{req.creator_name || req.creator_username}</div>
                        <div className="text-[11px] text-slate-500">{req.department}</div>
                        {req.approver_department && req.approver_department !== req.department && (
                          <div className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded mt-1 inline-block font-semibold">
                            ➜ Gửi duyệt: {req.approver_department}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <p className="text-slate-800 line-clamp-2">{req.payment_content}</p>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-xs">
                        {formatMoney(req.total_amount)}
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700">
                          {req.payment_method === 'TIEN_MAT' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                        </span>
                        {req.bank_account_holder && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {req.bank_account_holder}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">{renderStatusBadge(req.status)}</td>

                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700">
                          <Paperclip className="w-3 h-3 text-slate-500" />
                          <span>{req.attachment_count || 0} tệp</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            title="Xem chi tiết"
                            onClick={() => handleOpenDetail(req, 'PAYMENT')}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="In Mẫu 02/ĐNTT-VA"
                            onClick={() => handleOpenPrint(req, 'PAYMENT')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {(user?.roleName === 'ADMIN' || (req.user_id === user?.userId && req.status === 'PENDING_HOD')) && (
                            <button
                              title="Xóa phiếu"
                              onClick={(e) => handleDelete(e, req, 'PAYMENT')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkflowCreateModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setSourcePurchaseForPayment(null);
        }}
        onSuccess={(createdData, submittedMode) => {
          fetchData();
          const targetTab = submittedMode === 'PURCHASE' ? 'PURCHASE' : 'PAYMENT';
          setActiveMainTab(targetTab);
          if (createdData) {
            setTimeout(() => {
              handleOpenPrint(createdData, submittedMode);
            }, 100);
          }
        }}
        initialMode={createInitialMode}
        sourcePurchaseRequest={sourcePurchaseForPayment}
      />

      <WorkflowDetailModal
        request={selectedDetailRequest}
        type={detailType}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedDetailRequest(null);
        }}
        onOpenPrint={handleOpenPrint}
        onStatusChange={() => fetchData()}
        onCreatePaymentFromPurchase={(purReq) => handleOpenCreate('PAYMENT', purReq)}
      />

      <PrintWorkflowModal
        request={printRequest}
        type={printType}
        isOpen={isPrintOpen}
        onClose={() => {
          setIsPrintOpen(false);
          setPrintRequest(null);
        }}
      />
    </div>
  );
};

export default PaymentRequestPage;
