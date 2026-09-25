import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  UploadCloud,
  FileText,
  CreditCard,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';

const ATTACHED_DOC_OPTIONS = [
  'Hóa đơn Giá trị gia tăng (GTGT)',
  'Báo giá của nhà cung cấp',
  'Biên bản nghiệm thu / Bàn giao',
  'Hợp đồng kinh tế / Đơn đặt hàng',
  'Giấy đề nghị tạm ứng trước đó',
  'Chứng từ thanh toán khác'
];

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

const CreateRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('SERVICE_PURCHASE'); // 'SERVICE_PURCHASE' | 'PAYMENT_REQUEST'
  const [priority, setPriority] = useState('BINHTHUONG');
  const [department, setDepartment] = useState(user?.departmentName || 'Khối văn phòng');
  const [reason, setReason] = useState('');

  // Cho SERVICE_PURCHASE: Bảng các hạng mục
  const [items, setItems] = useState([
    { item_name: '', provider: '', expected_date: '', amount: '', purpose: '', note: '' }
  ]);

  // Cho PAYMENT_REQUEST
  const [directAmount, setDirectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [attachedDocs, setAttachedDocs] = useState(['Hóa đơn Giá trị gia tăng (GTGT)']);

  // File đính kèm
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Tính tổng số tiền theo tab
  const totalAmount =
    activeTab === 'SERVICE_PURCHASE'
      ? items.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
      : parseFloat(directAmount) || 0;

  const amountInWords = numberToVietnameseWords(totalAmount);

  // Thêm dòng dịch vụ
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { item_name: '', provider: '', expected_date: '', amount: '', purpose: '', note: '' }
    ]);
  };

  // Xóa dòng dịch vụ
  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Cập nhật giá trị dòng
  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Toggle checkbox chứng từ đính kèm
  const handleToggleDoc = (doc) => {
    setAttachedDocs(prev =>
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  // Upload file đính kèm
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/requests/upload-attachment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.file_url) {
          setAttachments(prev => [
            ...prev,
            {
              url: res.data.file_url,
              name: res.data.file_name,
              size: res.data.file_size,
              type: res.data.file_type
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Lỗi tải file:', err);
      setErrorMsg('Không thể tải lên file đính kèm. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do / nội dung đề xuất.');
      return;
    }

    if (totalAmount <= 0) {
      setErrorMsg('Tổng số tiền đề xuất phải lớn hơn 0 VNĐ.');
      return;
    }

    if (activeTab === 'SERVICE_PURCHASE') {
      const validItems = items.filter(it => it.item_name.trim());
      if (validItems.length === 0) {
        setErrorMsg('Vui lòng nhập ít nhất 1 hạng mục dịch vụ cần mua.');
        return;
      }
    }

    if (activeTab === 'PAYMENT_REQUEST' && paymentMethod === 'BANK_TRANSFER') {
      if (!bankAccountNumber.trim() || !bankAccountName.trim()) {
        setErrorMsg('Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản thụ hưởng.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: activeTab,
        department,
        reason: reason.trim(),
        priority,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        bank_name: bankName.trim(),
        bank_account_number: bankAccountNumber.trim(),
        bank_account_name: bankAccountName.trim(),
        attachments,
        attached_documents: attachedDocs,
        items: activeTab === 'SERVICE_PURCHASE' ? items : []
      };

      const res = await api.post('/requests', payload);
      if (onSuccess) {
        onSuccess(res.data?.data);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi gửi phiếu:', err);
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu đề xuất.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Tạo Phiếu Đề Xuất & Phê Duyệt</h3>
              <p className="text-xs text-slate-400">Số hóa quy trình duyệt chi & mua sắm Việt Á</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-3 bg-slate-100 border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SERVICE_PURCHASE')}
            className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'SERVICE_PURCHASE'
                ? 'bg-white text-brand-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${activeTab === 'SERVICE_PURCHASE' ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>Mẫu 01/ĐN-DV: Mua dịch vụ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PAYMENT_REQUEST')}
            className={`flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'PAYMENT_REQUEST'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Receipt className={`w-4 h-4 ${activeTab === 'PAYMENT_REQUEST' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Mẫu 02/ĐNTT-VA: Đề nghị thanh toán</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scroll-x">
          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Thông tin người đề nghị & Phòng ban & Ưu tiên */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Người đề nghị:</label>
              <div className="font-semibold text-slate-800 text-sm">{user?.fullname || user?.username}</div>
              <div className="text-slate-500 text-[11px] font-mono">Mã NV: {user?.employeeCode || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Phòng ban / Đơn vị:</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Ví dụ: Kho Cần Thơ, Khối văn phòng..."
              />
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
          </div>

          {/* Section 2: Lý do / Mục đích */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {activeTab === 'SERVICE_PURCHASE' ? '1. Lý do & Mục đích mua dịch vụ *' : '1. Nội dung đề nghị thanh toán *'}
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                activeTab === 'SERVICE_PURCHASE'
                  ? 'Ví dụ: Đề nghị bảo dưỡng hệ thống máy tính xưởng nệm và thuê xe tải giao hàng gấp cho đại lý Miền Tây...'
                  : 'Ví dụ: Thanh toán tiền thuê văn phòng quý 3/2026, thanh toán tiền in ấn bao bì nệm cao su Việt Á...'
              }
              className="w-full bg-slate-50/50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Section 3: Bảng Hạng Mục (NẾU LÀ SERVICE_PURCHASE) */}
          {activeTab === 'SERVICE_PURCHASE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  2. Chi tiết các hạng mục / dịch vụ cần mua
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center space-x-1 px-3 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm dòng</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5">Tên dịch vụ / Nội dung *</th>
                      <th className="p-2.5 w-36">Đơn vị cung cấp</th>
                      <th className="p-2.5 w-28">Thời gian</th>
                      <th className="p-2.5 w-32 text-right">Chi phí (VNĐ) *</th>
                      <th className="p-2.5">Mục đích / Ghi chú</th>
                      <th className="p-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-2 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={item.item_name}
                            onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                            placeholder="Tên dịch vụ..."
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.provider}
                            onChange={(e) => handleItemChange(idx, 'provider', e.target.value)}
                            placeholder="Nhà cung cấp..."
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={item.expected_date}
                            onChange={(e) => handleItemChange(idx, 'expected_date', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            value={item.amount}
                            onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                            placeholder="0"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-semibold text-right focus:ring-1 focus:ring-brand-500 focus:outline-none text-brand-900"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.purpose || item.note}
                            onChange={(e) => handleItemChange(idx, 'purpose', e.target.value)}
                            placeholder="Ghi chú thêm..."
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
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
          )}

          {/* Section 3b: Chi tiết Thanh toán (NẾU LÀ PAYMENT_REQUEST) */}
          {activeTab === 'PAYMENT_REQUEST' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                2. Thông tin số tiền & Hình thức thanh toán
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Số tiền đề nghị thanh toán (VNĐ) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      required
                      value={directAmount}
                      onChange={(e) => setDirectAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-10 py-2.5 text-sm font-bold font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hình thức chi trả:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BANK_TRANSFER')}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === 'BANK_TRANSFER'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-400/20 font-bold'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Chuyển khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        paymentMethod === 'CASH'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-400/20 font-bold'
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
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-emerald-900 uppercase">Thông tin tài khoản thụ hưởng:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Tên chủ tài khoản *</label>
                      <input
                        type="text"
                        required
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                        placeholder="NGUYEN VAN A"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Ngân hàng:</label>
                      <input
                        type="text"
                        list="bank-suggestions"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Chọn hoặc nhập tên NH..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <datalist id="bank-suggestions">
                        {BANK_SUGGESTIONS.map((b, i) => (
                          <option key={i} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              )}

              {/* Tích chọn chứng từ kèm theo */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Các chứng từ gốc đính kèm:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ATTACHED_DOC_OPTIONS.map((doc, idx) => (
                    <label
                      key={idx}
                      className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 text-xs transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={attachedDocs.includes(doc)}
                        onChange={() => handleToggleDoc(doc)}
                        className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 text-[11px] font-medium">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tổng tiền & Bằng chữ (Tự động hiển thị) */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Tổng số tiền đề xuất:
              </span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
              </div>
            </div>

            <div className="md:max-w-md text-right md:text-right">
              <span className="text-[11px] text-slate-400 italic">Số tiền viết bằng chữ:</span>
              <p className="text-xs font-semibold text-slate-200 italic mt-0.5">
                {amountInWords || '...........................................'}
              </p>
            </div>
          </div>

          {/* Upload hóa đơn / file chứng từ */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Tải lên ảnh hóa đơn / Báo giá / Chứng từ đính kèm
            </label>

            <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/20 transition-all cursor-pointer">
              <label className="flex flex-col items-center cursor-pointer w-full text-center">
                <UploadCloud className="w-8 h-8 text-brand-500 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  {isUploading ? 'Đang tải file lên máy chủ...' : 'Nhấp để chọn ảnh hóa đơn hoặc kéo thả vào đây'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ ảnh PNG, JPG, JPEG, file PDF (Tối đa 20MB)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.docx,.xlsx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danh sách file đã upload */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span className="truncate font-medium text-slate-800">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tạo phiếu...' : 'Gửi Phiếu Đề Xuất'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
