import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  ShoppingBag,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';
import AttachmentManager from './AttachmentManager';

const BANK_SUGGESTIONS = [
  'Vietcombank (VCB)',
  'BIDV',
  'VietinBank',
  'Techcombank (TCB)',
  'MB Bank (Quân Đội)',
  'ACB (Á Châu)',
  'VPBank',
  'Sacombank',
  'TPBank',
  'HDBank',
  'VIB',
  'Agribank'
];

export const APPROVER_DEPARTMENTS = [
  { id: 'Phòng Hành chính Nhân sự', label: '👔 Phòng Hành chính Nhân sự (Trưởng phòng: Huỳnh Thị Trúc Xinh)' },
  { id: 'Phòng Kế toán', label: '💰 Phòng Kế toán - Tài chính (Trưởng phòng: Nguyễn Quốc Hùng)' },
  { id: 'Khối văn phòng', label: '🏢 Khối Văn phòng (Ban Điều Hành)' },
  { id: 'Phòng kinh doanh', label: '🏬 Phòng Kinh doanh (Trưởng phòng: Phạm Tấn Hưng)' },
  { id: 'Phòng Marketing', label: '📢 Phòng Marketing' },
  { id: 'Xưởng sản xuất nệm', label: '🏭 Xưởng sản xuất nệm (Quản lý: Trần Minh Lý)' },
  { id: 'Xưởng sản xuất gối', label: '🏭 Xưởng sản xuất gối (Quản lý: Nguyễn Thái Cần)' },
  { id: 'Kho Cần Thơ', label: '📦 Kho Cần Thơ (Quản lý: Nguyễn Thị Thu Tâm)' },
  { id: 'Kho Mỹ Tho', label: '📦 Kho Mỹ Tho (Quản lý: Dương Thị Tuyết Hường)' },
  { id: 'Phòng R&D', label: '🔬 Phòng R&D (Trưởng phòng: Lê Huy Hoàng)' },
  { id: 'Ban giám đốc', label: '👑 Ban Giám Đốc (Phó Giám đốc: Võ Minh Cường)' }
];

const WorkflowCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'PURCHASE', // 'PURCHASE' | 'PAYMENT'
  sourcePurchaseRequest = null // Nếu tạo thanh toán từ Đề nghị mua dịch vụ đã duyệt
}) => {
  const { user } = useAuth();

  // Mode: 'PURCHASE' (Phần 1) hoặc 'PAYMENT' (Phần 3)
  const [mode, setMode] = useState(initialMode);
  const [activeStepTab, setActiveStepTab] = useState(initialMode === 'PURCHASE' ? 1 : 2); // 1: Đề nghị mua, 2: Chứng từ, 3: Đề nghị thanh toán

  // Common fields
  const [department, setDepartment] = useState(user?.departmentName || 'Khối văn phòng');
  const [approverDepartment, setApproverDepartment] = useState(user?.departmentName || 'Khối văn phòng');
  const [priority, setPriority] = useState('BINHTHUONG');

  // Fields for PHẦN 1: Mua dịch vụ
  const [purpose, setPurpose] = useState('');
  const [items, setItems] = useState([
    { service_name: '', supplier_name: '', due_date: '', amount: '', note: '' }
  ]);

  // Fields for PHẦN 3: Thanh toán
  const [paymentContent, setPaymentContent] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CHUYEN_KHOAN');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // PHẦN 2: Hóa đơn & Chứng từ đính kèm
  const [attachments, setAttachments] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Khi có sourcePurchaseRequest được truyền vào (Kế thừa từ Phần 1)
  useEffect(() => {
    if (sourcePurchaseRequest) {
      setMode('PAYMENT');
      setActiveStepTab(2); // Mở ngay Phần 2 (Chứng từ) để đính kèm hóa đơn
      setDepartment(sourcePurchaseRequest.department || user?.departmentName || 'Khối văn phòng');
      setPaymentContent(
        `Thanh toán chi phí theo Giấy đề nghị mua dịch vụ ${sourcePurchaseRequest.code}: ${sourcePurchaseRequest.purpose}`
      );
      setTotalAmount(sourcePurchaseRequest.total_estimated_amount || '');

      // Kế thừa nhà cung cấp từ các items nếu có
      if (sourcePurchaseRequest.items && sourcePurchaseRequest.items.length > 0) {
        const firstSupplier = sourcePurchaseRequest.items.find(it => it.supplier_name)?.supplier_name;
        if (firstSupplier) {
          setBankAccountHolder(firstSupplier.toUpperCase());
        }
      }

      // Kế thừa các báo giá từ Phần 1 sang nếu có
      if (sourcePurchaseRequest.attachments) {
        setAttachments(sourcePurchaseRequest.attachments);
      }
    } else {
      setMode(initialMode);
      setActiveStepTab(initialMode === 'PURCHASE' ? 1 : 2);
    }
  }, [sourcePurchaseRequest, initialMode, isOpen, user]);

  if (!isOpen) return null;

  // Tính tổng chi phí cho Phần 1
  const calculatedEstimatedTotal = items.reduce(
    (sum, it) => sum + (parseFloat(it.amount) || 0),
    0
  );

  // Số tiền thanh toán thực tế cho Phần 3
  const finalPaymentAmount = parseFloat(totalAmount) || 0;
  const amountInWords = numberToVietnameseWords(
    mode === 'PURCHASE' ? calculatedEstimatedTotal : finalPaymentAmount
  );

  // Thao tác bảng items Phần 1 & Tự động đồng bộ sang Phần 3
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { service_name: '', supplier_name: '', due_date: '', amount: '', note: '' }
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });

    if (field === 'service_name' && idx === 0 && val) {
      if (!purpose || purpose === items[0]?.service_name) {
        setPurpose(val);
      }
      if (!paymentContent || paymentContent === items[0]?.service_name) {
        setPaymentContent(val);
      }
    }
    if (field === 'supplier_name' && idx === 0 && val) {
      if (!bankAccountHolder) {
        setBankAccountHolder(val.toUpperCase());
      }
    }
    if (field === 'amount') {
      const newTotal = items.reduce((sum, it, i) => sum + (parseFloat(i === idx ? val : it.amount) || 0), 0);
      if (newTotal > 0 && (!totalAmount || parseFloat(totalAmount) === 0 || parseFloat(totalAmount) === calculatedEstimatedTotal)) {
        setTotalAmount(String(newTotal));
      }
    }
  };

  const handlePurposeChange = (val) => {
    setPurpose(val);
    if (!paymentContent || paymentContent === purpose) {
      setPaymentContent(val);
    }
  };

  const handlePaymentContentChange = (val) => {
    setPaymentContent(val);
    if (!purpose || purpose === paymentContent) {
      setPurpose(val);
    }
  };

  const handleSwitchTab = (tabNum) => {
    if (tabNum === 3) {
      setMode('PAYMENT');
      setActiveStepTab(3);
      if (!paymentContent.trim()) {
        const autoContent = purpose.trim() || (items[0]?.service_name ? `Thanh toán: ${items[0].service_name}` : '');
        if (autoContent) setPaymentContent(autoContent);
      }
      if (!totalAmount || parseFloat(totalAmount) === 0) {
        if (calculatedEstimatedTotal > 0) {
          setTotalAmount(String(calculatedEstimatedTotal));
        }
      }
      if (!bankAccountHolder && items[0]?.supplier_name) {
        setBankAccountHolder(items[0].supplier_name.toUpperCase());
      }
    } else if (tabNum === 1) {
      setMode('PURCHASE');
      setActiveStepTab(1);
      if (!purpose.trim() && paymentContent.trim()) {
        setPurpose(paymentContent.trim());
      }
      if (!items[0]?.service_name && paymentContent.trim()) {
        setItems(prev => {
          const copy = [...prev];
          copy[0] = { ...copy[0], service_name: paymentContent.trim() };
          return copy;
        });
      }
      if ((!items[0]?.amount || parseFloat(items[0].amount) === 0) && finalPaymentAmount > 0) {
        setItems(prev => {
          const copy = [...prev];
          copy[0] = { ...copy[0], amount: String(finalPaymentAmount) };
          return copy;
        });
      }
    } else {
      setActiveStepTab(2);
    }
  };

  // Gửi biểu mẫu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    setIsSubmitting(true);
    try {
      if (mode === 'PURCHASE') {
        // Submit Phần 1: Giấy đề nghị mua dịch vụ
        if (!purpose.trim()) {
          setErrorMsg('Vui lòng nhập lý do / mục đích mua dịch vụ.');
          setIsSubmitting(false);
          return;
        }

        const validItems = items.filter(it => it.service_name.trim());
        if (validItems.length === 0) {
          setErrorMsg('Vui lòng nhập ít nhất 1 hạng mục dịch vụ cần mua.');
          setIsSubmitting(false);
          return;
        }

        if (calculatedEstimatedTotal <= 0) {
          setErrorMsg('Tổng dự toán chi phí phải lớn hơn 0 VNĐ.');
          setIsSubmitting(false);
          return;
        }

        const payload = {
          department,
          approver_department: approverDepartment,
          purpose: purpose.trim(),
          priority,
          items: validItems,
          attachments
        };

        const res = await api.post('/requests/purchase', payload);
        if (onSuccess) onSuccess(res.data?.data, 'PURCHASE');
        onClose();
      } else {
        // Submit Phần 3: Giấy đề nghị thanh toán
        if (!paymentContent.trim()) {
          setErrorMsg('Vui lòng nhập nội dung đề nghị thanh toán.');
          setIsSubmitting(false);
          return;
        }

        if (finalPaymentAmount <= 0) {
          setErrorMsg('Số tiền thanh toán phải lớn hơn 0 VNĐ.');
          setIsSubmitting(false);
          return;
        }

        if (paymentMethod === 'CHUYEN_KHOAN') {
          if (!bankAccountNumber.trim() || !bankAccountHolder.trim()) {
            setErrorMsg('Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản thụ hưởng.');
            setIsSubmitting(false);
            return;
          }
        }

        const payload = {
          purchase_request_id: sourcePurchaseRequest ? sourcePurchaseRequest.id : null,
          department,
          approver_department: approverDepartment,
          payment_content: paymentContent.trim(),
          total_amount: finalPaymentAmount,
          payment_method: paymentMethod,
          bank_name: bankName.trim(),
          bank_account_number: bankAccountNumber.trim(),
          bank_account_holder: bankAccountHolder.trim(),
          attachments
        };

        const res = await api.post('/requests/payment', payload);
        if (onSuccess) onSuccess(res.data?.data, 'PAYMENT');
        onClose();
      }
    } catch (err) {
      console.error('Lỗi khi gửi phiếu:', err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300">
              {mode === 'PURCHASE' ? <ShoppingBag className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                {mode === 'PURCHASE'
                  ? 'PHẦN 1: GIẤY ĐỀ NGHỊ MUA DỊCH VỤ (Mẫu 01/ĐN-DV)'
                  : 'PHẦN 3: GIẤY ĐỀ NGHỊ THANH TOÁN (Mẫu 02/ĐNTT-VA)'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'PURCHASE'
                  ? 'Xin phê duyệt chủ trương & dự toán kinh phí'
                  : 'Duyệt chi ngân sách & xuất quỹ thanh toán'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Kế thừa nếu tạo từ Phần 1 */}
        {sourcePurchaseRequest && (
          <div className="flex items-center space-x-3 px-6 py-2.5 bg-brand-50 border-b border-brand-200 text-brand-900 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div>
              <span>Kế thừa tự động từ <strong>{sourcePurchaseRequest.code}</strong> (Đã được Trưởng bộ phận phê duyệt chủ trương)</span>
            </div>
          </div>
        )}

        {/* Tab 3 Bước thực hiện */}
        <div className="grid grid-cols-3 p-2 bg-slate-100 border-b border-slate-200 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleSwitchTab(1)}
            disabled={Boolean(sourcePurchaseRequest)}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'PURCHASE' && activeStepTab === 1
                ? 'bg-white text-brand-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60 disabled:opacity-50'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">1</span>
            <span className="truncate">1. Đề nghị mua dịch vụ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab(2)}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeStepTab === 2
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">2</span>
            <span className="truncate">2. Hóa đơn & Chứng từ ({attachments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab(3)}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              mode === 'PAYMENT' && activeStepTab === 3
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">3</span>
            <span className="truncate">3. Đề nghị thanh toán</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto custom-scroll-x text-xs">
          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: PHẦN 1 - GIẤY ĐỀ NGHỊ MUA DỊCH VỤ (01/ĐN-DV) */}
          {/* ========================================================================= */}
          {mode === 'PURCHASE' && activeStepTab === 1 && (
            <div className="space-y-4">
              {/* Thông tin chung */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Người đề nghị:</label>
                  <p className="font-bold text-slate-800 text-sm">{user?.fullname || user?.username}</p>
                  <span className="text-[11px] text-slate-500 font-mono">Mã NV: {user?.employeeCode || 'N/A'} • Bộ phận: {department}</span>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Mức độ ưu tiên:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'KHANCAP', label: '🔥 Khẩn cấp', color: 'text-rose-700 border-rose-300 bg-rose-50' },
                      { id: 'BINHTHUONG', label: 'Bình thường', color: 'text-blue-700 border-blue-300 bg-blue-50' },
                      { id: 'DUPHONG', label: 'Dự phòng', color: 'text-slate-700 border-slate-300 bg-slate-100' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`py-1 text-[11px] font-semibold rounded-md border text-center transition-all cursor-pointer ${
                          priority === p.id ? `${p.color} ring-2 ring-brand-500/20 shadow-xs font-bold` : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-slate-200 pt-3">
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Gửi về Trưởng phòng ban tiếp nhận duyệt:</span>
                    <span className="text-[10px] text-brand-600 font-normal">Có thể chuyển tiếp cho Trưởng bộ phận khác duyệt</span>
                  </label>
                  <select
                    value={approverDepartment}
                    onChange={(e) => setApproverDepartment(e.target.value)}
                    className="w-full bg-white border border-brand-300 rounded-lg px-3 py-2 text-xs text-brand-950 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
                  >
                    <option value={department}>★ Trưởng bộ phận của tôi ({department})</option>
                    {APPROVER_DEPARTMENTS.filter(d => d.id !== department).map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                  {approverDepartment !== department && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                      ℹ️ Phiếu này sẽ được gửi trực tiếp đến <strong>{approverDepartment}</strong> để Trưởng phòng tiếp nhận thẩm tra và phê duyệt.
                    </p>
                  )}
                </div>
              </div>

              {/* Lý do đề nghị */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lý do & Mục đích đề nghị mua dịch vụ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => handlePurposeChange(e.target.value)}
                  placeholder="Ví dụ: Bảo dưỡng định kỳ hệ thống máy móc xưởng nệm, thuê xe tải giao hàng đại lý..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Bảng chi tiết các dịch vụ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Danh mục dịch vụ cần mua & Dự toán chi phí
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm dòng</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2.5 w-8 text-center">#</th>
                        <th className="p-2.5">Tên dịch vụ / Công việc *</th>
                        <th className="p-2.5 w-36">Nhà cung cấp (NCC)</th>
                        <th className="p-2.5 w-28">Thời gian</th>
                        <th className="p-2.5 w-32 text-right">Chi phí dự kiến *</th>
                        <th className="p-2.5">Ghi chú</th>
                        <th className="p-2.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400 font-medium">{idx + 1}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={it.service_name}
                              onChange={(e) => handleItemChange(idx, 'service_name', e.target.value)}
                              placeholder="Nhập tên dịch vụ..."
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={it.supplier_name}
                              onChange={(e) => handleItemChange(idx, 'supplier_name', e.target.value)}
                              placeholder="Tên NCC..."
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="date"
                              value={it.due_date}
                              onChange={(e) => handleItemChange(idx, 'due_date', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              required
                              value={it.amount}
                              onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold text-right text-brand-900 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={it.note}
                              onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                              placeholder="Ghi chú..."
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tổng tiền Phần 1 */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Tổng dự toán kinh phí:</span>
                  <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculatedEstimatedTotal)}
                  </div>
                </div>
                <div className="text-right max-w-sm">
                  <span className="text-[11px] text-slate-400 italic">Bằng chữ:</span>
                  <p className="text-xs font-semibold text-slate-200 italic mt-0.5">{amountInWords || '...'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PHẦN 2 - HÓA ĐƠN & CHỨNG TỪ GỐC (ATTACHMENTS) */}
          {/* ========================================================================= */}
          {activeStepTab === 2 && (
            <div className="space-y-4">
              <AttachmentManager
                attachments={attachments}
                onChange={(updated) => setAttachments(updated)}
                title="PHẦN 2: HÓA ĐƠN & CHỨNG TỪ GỐC (ATTACHMENTS & INVOICES)"
                subtitle="Đính kèm Hóa đơn GTGT, Báo giá, Biên bản bàn giao và Ảnh nghiệm thu thực tế"
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PHẦN 3 - GIẤY ĐỀ NGHỊ THANH TOÁN (02/ĐNTT-VA) */}
          {/* ========================================================================= */}
          {mode === 'PAYMENT' && activeStepTab === 3 && (
            <div className="space-y-4">
              {/* Thông tin người đề nghị & Phòng ban duyệt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Người đề nghị thanh toán:</label>
                  <p className="font-bold text-slate-800 text-sm">{user?.fullname || user?.username}</p>
                  <span className="text-[11px] text-slate-500 font-mono">Mã NV: {user?.employeeCode || 'N/A'} • Bộ phận: {department}</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                    <span>Gửi về Trưởng phòng ban tiếp nhận duyệt:</span>
                  </label>
                  <select
                    value={approverDepartment}
                    onChange={(e) => setApproverDepartment(e.target.value)}
                    className="w-full bg-white border border-brand-300 rounded-lg px-3 py-2 text-xs text-brand-950 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
                  >
                    <option value={department}>★ Trưởng bộ phận của tôi ({department})</option>
                    {APPROVER_DEPARTMENTS.filter(d => d.id !== department).map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {approverDepartment !== department && (
                  <div className="md:col-span-2">
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ℹ️ Phiếu thanh toán này sẽ được gửi trực tiếp đến <strong>{approverDepartment}</strong> để Trưởng phòng tiếp nhận kiểm tra và ký duyệt cấp 1.
                    </p>
                  </div>
                )}
              </div>

              {/* Nội dung thanh toán */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội dung đề nghị thanh toán *
                </label>
                <textarea
                  required
                  rows={2}
                  value={paymentContent}
                  onChange={(e) => handlePaymentContentChange(e.target.value)}
                  placeholder="Ví dụ: Thanh toán đợt 1 tiền bảo dưỡng máy cắt mút xốp theo Hóa đơn GTGT số 001..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Số tiền & Phương thức thanh toán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Số tiền đề nghị thanh toán (VNĐ) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      required
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-base font-black font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hình thức chi trả *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CHUYEN_KHOAN')}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'CHUYEN_KHOAN'
                          ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-400/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Chuyển khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('TIEN_MAT')}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'TIEN_MAT'
                          ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-400/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Tiền mặt</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Thông tin tài khoản nếu là chuyển khoản */}
              {paymentMethod === 'CHUYEN_KHOAN' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-800 uppercase">Thông tin tài khoản thụ hưởng:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Tên chủ tài khoản / NCC *</label>
                      <input
                        type="text"
                        required
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value.toUpperCase())}
                        placeholder="CONG TY CO KHI TAN PHAT"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 uppercase focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Số tài khoản *</label>
                      <input
                        type="text"
                        required
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\s+/g, ''))}
                        placeholder="0123456789..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Ngân hàng:</label>
                      <input
                        type="text"
                        list="bank-modal-list"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Vietcombank (VCB)..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <datalist id="bank-modal-list">
                        {BANK_SUGGESTIONS.map((b, i) => (
                          <option key={i} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              )}

              {/* Tóm tắt chứng từ đính kèm */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4 text-brand-600" />
                  <span className="font-semibold text-slate-700">Chứng từ gốc đính kèm:</span>
                  <span className="text-slate-500">{attachments.length} tệp đã tải lên</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStepTab(2)}
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  Quản lý / Đính kèm thêm chứng từ →
                </button>
              </div>

              {/* Tổng tiền & Chữ Tiếng Việt */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Tổng số tiền thanh toán:</span>
                  <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPaymentAmount)}
                  </div>
                </div>
                <div className="text-right max-w-sm">
                  <span className="text-[11px] text-slate-400 italic">Bằng chữ:</span>
                  <p className="text-xs font-semibold text-slate-200 italic mt-0.5">{amountInWords || '...'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>

              {activeStepTab === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'PURCHASE') setActiveStepTab(1);
                    else setActiveStepTab(1);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors text-xs"
                >
                  ← Quay lại Bước 1
                </button>
              )}

              {activeStepTab === 3 && (
                <button
                  type="button"
                  onClick={() => setActiveStepTab(2)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors text-xs"
                >
                  ← Quay lại Bước 2 (Chứng từ)
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {activeStepTab === 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStepTab(2)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
                >
                  <span>Đính kèm chứng từ (Bước 2)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {activeStepTab === 2 && mode === 'PAYMENT' && (
                <button
                  type="button"
                  onClick={() => setActiveStepTab(3)}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
                >
                  <span>Chuyển sang Bước 3: Đề nghị thanh toán</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {(activeStepTab === 1 || activeStepTab === 3 || (activeStepTab === 2 && mode === 'PURCHASE')) && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Đang xử lý...'
                      : mode === 'PURCHASE'
                      ? 'Trình Ký Giấy Đề Nghị Mua Dịch Vụ'
                      : 'Trình Ký Giấy Đề Nghị Thanh Toán'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowCreateModal;
