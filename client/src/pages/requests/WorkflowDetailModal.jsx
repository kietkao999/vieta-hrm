import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  ShieldCheck,
  Building2,
  DollarSign,
  CreditCard,
  Paperclip,
  Calendar,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Banknote,
  ShoppingBag,
  Receipt,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';
import AttachmentManager from './AttachmentManager';

const WorkflowDetailModal = ({
  request,
  type = 'PURCHASE', // 'PURCHASE' | 'PAYMENT'
  isOpen,
  onClose,
  onOpenPrint,
  onStatusChange,
  onCreatePaymentFromPurchase
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(type === 'PURCHASE' ? 'PURCHASE_INFO' : 'PAYMENT_INFO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [dialogError, setDialogError] = useState('');

  if (!isOpen || !request) return null;

  const isPurchase = type === 'PURCHASE';
  const formatMoney = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} - ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Xác định quyền duyệt
  const canApproveHOD =
    request.status === 'PENDING_HOD' &&
    (user?.roleName === 'ADMIN' ||
      (user?.roleName === 'MANAGER' &&
        ((request.approver_department && user?.departmentName === request.approver_department) ||
          user?.departmentName === request.department)));

  const canApproveAccountant =
    !isPurchase &&
    request.status === 'PENDING_ACC' &&
    (user?.roleName === 'ADMIN' || user?.departmentName === 'Khối văn phòng' || user?.roleName === 'HR');

  const canApproveDirector =
    !isPurchase &&
    request.status === 'PENDING_BOD' &&
    user?.roleName === 'ADMIN';

  const canReject =
    ['PENDING_HOD', 'PENDING_ACC', 'PENDING_BOD'].includes(request.status) &&
    (user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER' || user?.roleName === 'HR');

  // Phê duyệt
  const handleApprove = async () => {
    setIsProcessing(true);
    setDialogError('');
    try {
      const endpoint = isPurchase
        ? `/requests/purchase/${request.id}/approve`
        : `/requests/payment/${request.id}/approve`;

      const res = await api.post(endpoint, { comment: comment.trim() });
      setShowApproveDialog(false);
      setComment('');
      if (onStatusChange) onStatusChange(res.data?.data);
    } catch (err) {
      console.error('Lỗi duyệt:', err);
      setDialogError(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Từ chối
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setDialogError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setIsProcessing(true);
    setDialogError('');
    try {
      const endpoint = isPurchase
        ? `/requests/purchase/${request.id}/reject`
        : `/requests/payment/${request.id}/reject`;

      const res = await api.post(endpoint, { reason: rejectionReason.trim() });
      setShowRejectDialog(false);
      setRejectionReason('');
      if (onStatusChange) onStatusChange(res.data?.data);
    } catch (err) {
      console.error('Lỗi từ chối:', err);
      setDialogError(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
              {isPurchase ? <ShoppingBag className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-wide font-mono">{request.code}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isPurchase
                      ? 'bg-brand-900/80 text-brand-200 border border-brand-700'
                      : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                  }`}
                >
                  {isPurchase ? 'Mẫu 01/ĐN-DV: Mua dịch vụ' : 'Mẫu 02/ĐNTT-VA: Thanh toán'}
                </span>
                {request.priority === 'KHANCAP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700 animate-pulse">
                    🔥 Khẩn cấp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Người lập: <strong className="text-slate-200">{request.creator_name || request.creator_username}</strong> • {request.department} • {formatDateTime(request.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenPrint(request, type)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-brand-300" />
              <span>In Phiếu A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation in Detail */}
        <div className="flex items-center space-x-2 px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab(isPurchase ? 'PURCHASE_INFO' : 'PAYMENT_INFO')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'PURCHASE_INFO' || activeTab === 'PAYMENT_INFO'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            {isPurchase ? '1. Chi tiết đề nghị mua dịch vụ' : '1. Nội dung đề nghị thanh toán'}
          </button>

          <button
            onClick={() => setActiveTab('ATTACHMENTS')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ATTACHMENTS'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5 text-brand-600" />
            <span>2. Hóa đơn & Chứng từ ({request.attachments?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto custom-scroll-x text-xs">
          {/* Cảnh báo từ chối nếu có */}
          {request.status === 'REJECTED' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800">
              <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Phiếu đã bị TỪ CHỐI</p>
                <p className="text-xs mt-0.5">
                  <span className="font-semibold">Người từ chối:</span> {request.rej_fullname || request.rej_username} ({formatDateTime(request.rejected_at)})
                </p>
                <p className="text-xs mt-0.5">
                  <span className="font-semibold">Lý do:</span> <span className="italic">{request.rejection_reason}</span>
                </p>
              </div>
            </div>
          )}

          {/* TAB: THÔNG TIN CHI TIẾT */}
          {(activeTab === 'PURCHASE_INFO' || activeTab === 'PAYMENT_INFO') && (
            <div className="space-y-4">
              {/* Thông tin đầu phiếu */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-500 font-medium">Bộ phận đề xuất:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{request.department}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Bộ phận tiếp nhận duyệt:</span>
                  <p className="font-bold text-brand-900 text-sm mt-0.5">
                    {request.approver_department || request.department}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Mức độ ưu tiên:</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {request.priority === 'KHANCAP' ? '🔥 Khẩn cấp' : request.priority === 'DUPHONG' ? 'Dự phòng' : 'Bình thường'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Trạng thái phê duyệt:</span>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>{request.status}</span>
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4 border-t border-slate-200 pt-3">
                  <span className="text-slate-500 font-medium">Lý do / Nội dung chi tiết:</span>
                  <p className="font-medium text-slate-900 mt-1 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {isPurchase ? request.purpose : request.payment_content}
                  </p>
                </div>
              </div>

              {/* Bảng chi tiết dịch vụ nếu là Purchase Request */}
              {isPurchase && request.items && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase text-xs">Danh mục các hạng mục / dịch vụ:</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 w-8 text-center">STT</th>
                          <th className="p-2.5">Tên dịch vụ / Nội dung</th>
                          <th className="p-2.5">Đơn vị cung cấp</th>
                          <th className="p-2.5 w-24">Thời gian</th>
                          <th className="p-2.5 text-right w-28">Chi phí</th>
                          <th className="p-2.5">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {request.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-2 font-semibold text-slate-900">{it.service_name}</td>
                            <td className="p-2 text-slate-700">{it.supplier_name || '---'}</td>
                            <td className="p-2 text-slate-600">{it.due_date || '---'}</td>
                            <td className="p-2 text-right font-mono font-bold text-brand-900">
                              {formatMoney(it.amount)}
                            </td>
                            <td className="p-2 italic text-slate-500">{it.note || '---'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Thông tin tài khoản thụ hưởng nếu là Payment Request */}
              {!isPurchase && request.payment_method === 'CHUYEN_KHOAN' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-emerald-900 uppercase text-xs">Thông tin tài khoản thụ hưởng:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500">Tên chủ tài khoản:</span>
                      <p className="font-bold uppercase text-slate-900">{request.bank_account_holder || '---'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Số tài khoản:</span>
                      <p className="font-mono font-bold text-slate-900 text-sm">{request.bank_account_number || '---'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Ngân hàng:</span>
                      <p className="font-medium text-slate-900">{request.bank_name || '---'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tổng tiền & Chữ Tiếng Việt */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    {isPurchase ? 'Tổng chi phí ước tính:' : 'Tổng số tiền thanh toán:'}
                  </span>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                    {formatMoney(isPurchase ? request.total_estimated_amount : request.total_amount)}
                  </div>
                </div>
                <div className="text-right max-w-sm">
                  <span className="text-[11px] text-slate-400 italic">Bằng chữ:</span>
                  <p className="text-xs font-semibold text-slate-200 italic mt-0.5">
                    {request.amount_in_words || numberToVietnameseWords(isPurchase ? request.total_estimated_amount : request.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DANH MỤC HÓA ĐƠN & CHỨNG TỪ (PHẦN 2) */}
          {activeTab === 'ATTACHMENTS' && (
            <AttachmentManager
              attachments={request.attachments || []}
              readOnly={true}
              title="PHẦN 2: HÓA ĐƠN & CHỨNG TỪ GỐC KÈM THEO"
              subtitle="Nhấp vào từng tệp tin để xem phóng to (Lightbox Preview)"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 gap-3">
          {/* Nút Tạo Thanh Toán khi Phần 1 đã duyệt */}
          {isPurchase && request.status === 'APPROVED' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onCreatePaymentFromPurchase) onCreatePaymentFromPurchase(request);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer animate-bounce"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ Tạo Đề Nghị Thanh Toán (Phần 3)</span>
            </button>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            {canReject && (
              <button
                type="button"
                onClick={() => setShowRejectDialog(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Từ Chối</span>
              </button>
            )}

            {(canApproveHOD || canApproveAccountant || canApproveDirector) && (
              <button
                type="button"
                onClick={() => setShowApproveDialog(true)}
                className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {canApproveHOD
                    ? 'Trưởng Phòng Phê Duyệt'
                    : canApproveAccountant
                    ? 'Kế Toán Thẩm Định'
                    : 'Ban Giám Đốc Duyệt Chi'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Đóng lại
            </button>
          </div>
        </div>

        {/* Modal Phê Duyệt */}
        {showApproveDialog && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Xác nhận phê duyệt phiếu {request.code}</span>
              </div>
              {dialogError && <p className="text-xs text-rose-600">{dialogError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ý kiến phê duyệt (Tùy chọn):</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Đồng ý duyệt đề xuất..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveDialog(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs"
                >
                  {isProcessing ? 'Đang duyệt...' : 'Đồng Ý Phê Duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Từ Chối */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Từ chối phiếu {request.code}</span>
              </div>
              {dialogError && <p className="text-xs text-rose-600">{dialogError}</p>}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lý do từ chối *:</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối cụ thể..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-xs"
                >
                  {isProcessing ? 'Đang gửi...' : 'Xác Nhận Từ Chối'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailModal;
