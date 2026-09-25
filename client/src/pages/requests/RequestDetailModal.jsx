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
  Banknote
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';

const RequestDetailModal = ({
  request,
  isOpen,
  onClose,
  onOpenPrint,
  onStatusChange
}) => {
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const [dialogError, setDialogError] = useState('');

  if (!isOpen || !request) return null;

  const isService = request.type === 'SERVICE_PURCHASE';
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

  // Xác định quyền duyệt của user hiện tại
  const canApproveHOD =
    request.status === 'PENDING_HOD' &&
    (user?.roleName === 'ADMIN' || (user?.roleName === 'MANAGER' && user?.departmentName === request.department));

  const canApproveAccountant =
    request.status === 'PENDING_ACCOUNTANT' &&
    (user?.roleName === 'ADMIN' || user?.departmentName === 'Khối văn phòng' || user?.roleName === 'HR');

  const canApproveDirector =
    request.status === 'PENDING_DIRECTOR' && user?.roleName === 'ADMIN';

  const canPay =
    request.status === 'APPROVED' &&
    (user?.roleName === 'ADMIN' || user?.departmentName === 'Khối văn phòng' || user?.roleName === 'HR');

  const canReject =
    ['PENDING_HOD', 'PENDING_ACCOUNTANT', 'PENDING_DIRECTOR'].includes(request.status) &&
    (user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER' || user?.roleName === 'HR');

  // Xử lý Phê duyệt
  const handleApprove = async () => {
    setIsProcessing(true);
    setDialogError('');
    try {
      const res = await api.post(`/requests/${request.id}/approve`, {
        comment: comment.trim()
      });
      setShowApproveDialog(false);
      setComment('');
      if (onStatusChange) onStatusChange(res.data?.data);
    } catch (err) {
      console.error('Lỗi phê duyệt:', err);
      setDialogError(err.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Chi tiền
  const handlePay = async () => {
    setIsProcessing(true);
    setDialogError('');
    try {
      const res = await api.post(`/requests/${request.id}/approve`, {
        isPayment: true,
        paymentProof: paymentProof.trim()
      });
      setShowPaymentDialog(false);
      setPaymentProof('');
      if (onStatusChange) onStatusChange(res.data?.data);
    } catch (err) {
      console.error('Lỗi xác nhận chi tiền:', err);
      setDialogError(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận chi tiền.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Từ chối
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setDialogError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setIsProcessing(true);
    setDialogError('');
    try {
      const res = await api.post(`/requests/${request.id}/reject`, {
        reason: rejectionReason.trim()
      });
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

  // Timeline trạng thái
  const steps = [
    {
      title: '1. Người đề nghị',
      subtitle: request.creator_name || request.creator_username,
      time: formatDateTime(request.created_at),
      status: 'DONE',
      note: 'Đã lập phiếu đề xuất'
    },
    {
      title: '2. Trưởng bộ phận',
      subtitle: request.hod_fullname || 'Chờ duyệt',
      time: request.hod_approved_at ? formatDateTime(request.hod_approved_at) : '',
      status: request.hod_approved_by ? 'DONE' : request.status === 'PENDING_HOD' ? 'CURRENT' : request.status === 'REJECTED' ? 'REJECTED' : 'DONE',
      note: request.hod_comment || (request.status === 'PENDING_HOD' ? 'Đang chờ thẩm tra' : '')
    },
    {
      title: '3. Kế toán trưởng',
      subtitle: request.acc_fullname || 'Chờ thẩm định',
      time: request.acc_approved_at ? formatDateTime(request.acc_approved_at) : '',
      status: request.acc_approved_by ? 'DONE' : request.status === 'PENDING_ACCOUNTANT' ? 'CURRENT' : ['PENDING_HOD'].includes(request.status) ? 'WAITING' : request.status === 'REJECTED' ? 'REJECTED' : 'DONE',
      note: request.acc_comment || (request.status === 'PENDING_ACCOUNTANT' ? 'Đang thẩm định tài chính' : '')
    },
    {
      title: '4. Ban Giám Đốc',
      subtitle: request.dir_fullname || 'Chờ phê duyệt',
      time: request.dir_approved_at ? formatDateTime(request.dir_approved_at) : '',
      status: ['APPROVED', 'PAID'].includes(request.status) ? 'DONE' : request.status === 'PENDING_DIRECTOR' ? 'CURRENT' : ['PENDING_HOD', 'PENDING_ACCOUNTANT'].includes(request.status) ? 'WAITING' : 'REJECTED',
      note: request.dir_comment || (request.status === 'PENDING_DIRECTOR' ? 'Đang chờ Ban Giám Đốc ký' : '')
    },
    {
      title: '5. Giải ngân / Chi tiền',
      subtitle: request.paid_fullname || (request.status === 'PAID' ? 'Đã chi' : 'Chưa chi tiền'),
      time: request.paid_at ? formatDateTime(request.paid_at) : '',
      status: request.status === 'PAID' ? 'DONE' : request.status === 'APPROVED' ? 'CURRENT' : 'WAITING',
      note: request.payment_proof || (request.status === 'PAID' ? 'Đã xuất quỹ thành công' : '')
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-wide font-mono">{request.code}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isService ? 'bg-brand-900/80 text-brand-200 border border-brand-700' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                  }`}
                >
                  {isService ? '01/ĐN-DV: Mua dịch vụ' : '02/ĐNTT-VA: Đề nghị thanh toán'}
                </span>
                {request.priority === 'KHANCAP' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-700 animate-pulse">
                    🔥 Khẩn cấp
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Người tạo: <span className="text-slate-200 font-semibold">{request.creator_name || request.creator_username}</span> • {formatDateTime(request.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenPrint(request)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scroll-x text-xs">
          {/* 1. Approval Step Flow (Tiến trình duyệt 5 bước) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Tiến trình phê duyệt & Giải ngân</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {steps.map((step, idx) => {
                let badgeBg = 'bg-slate-200 text-slate-500 border-slate-300';
                let Icon = Clock;

                if (step.status === 'DONE') {
                  badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20';
                  Icon = CheckCircle2;
                } else if (step.status === 'CURRENT') {
                  badgeBg = 'bg-amber-50 text-amber-900 border-amber-400 ring-2 ring-amber-400/30 font-bold';
                  Icon = Clock;
                } else if (step.status === 'REJECTED') {
                  badgeBg = 'bg-rose-50 text-rose-800 border-rose-300';
                  Icon = XCircle;
                }

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between space-y-1 transition-all ${badgeBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">{step.title}</span>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <div className="truncate font-semibold text-[11px]">{step.subtitle}</div>
                    {step.time && <div className="text-[10px] text-slate-500">{step.time}</div>}
                    {step.note && <div className="text-[10px] italic text-slate-600 mt-1">{step.note}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cảnh báo nếu bị từ chối */}
          {request.status === 'REJECTED' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800">
              <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Phiếu đề xuất đã bị TỪ CHỐI</p>
                <p className="text-xs mt-0.5">
                  <span className="font-semibold">Người từ chối:</span> {request.rej_fullname || request.rej_username} ({formatDateTime(request.rejected_at)})
                </p>
                <p className="text-xs mt-0.5">
                  <span className="font-semibold">Lý do từ chối:</span> <span className="italic">{request.rejection_reason}</span>
                </p>
              </div>
            </div>
          )}

          {/* 2. Thông tin chính của phiếu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-500 font-medium">Phòng ban đề xuất:</span>
              <p className="font-bold text-slate-800 text-sm">{request.department}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Hình thức chi trả:</span>
              <p className="font-bold text-slate-800 text-sm">
                {request.payment_method === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản ngân hàng'}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Mức độ ưu tiên:</span>
              <p className="font-bold text-slate-800 text-sm">
                {request.priority === 'KHANCAP' ? '🔥 Khẩn cấp' : request.priority === 'DUPHONG' ? 'Dự phòng' : 'Bình thường'}
              </p>
            </div>

            <div className="md:col-span-3 border-t border-slate-200 pt-3">
              <span className="text-slate-500 font-medium">Lý do & Nội dung đề xuất:</span>
              <p className="font-medium text-slate-900 mt-1 text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {request.reason}
              </p>
            </div>
          </div>

          {/* 3. Chi tiết dịch vụ hoặc Thông tin tài khoản */}
          {isService ? (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                Danh sách hạng mục / dịch vụ cần mua:
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5 w-8 text-center">STT</th>
                      <th className="p-2.5">Tên dịch vụ / Công việc</th>
                      <th className="p-2.5">Đơn vị cung cấp</th>
                      <th className="p-2.5 w-24">Thời gian</th>
                      <th className="p-2.5 text-right w-28">Chi phí</th>
                      <th className="p-2.5">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {request.items && request.items.length > 0 ? (
                      request.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-medium text-slate-900">{it.item_name}</td>
                          <td className="p-2 text-slate-700">{it.provider || '---'}</td>
                          <td className="p-2 text-slate-600">{it.expected_date || '---'}</td>
                          <td className="p-2 text-right font-mono font-bold text-brand-900">
                            {formatMoney(it.amount)}
                          </td>
                          <td className="p-2 italic text-slate-600">{it.purpose || it.note || '---'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-3 text-center italic text-slate-500">
                          Chi tiết theo nội dung đề xuất
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            request.payment_method === 'BANK_TRANSFER' && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 uppercase text-xs">Thông tin tài khoản thụ hưởng:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500">Tên chủ tài khoản:</span>
                    <p className="font-bold uppercase text-slate-900">{request.bank_account_name || '---'}</p>
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
            )
          )}

          {/* 4. Tổng tiền & Số tiền bằng chữ */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Tổng số tiền đề xuất:</span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                {formatMoney(request.total_amount)}
              </div>
            </div>
            <div className="md:max-w-md text-right">
              <span className="text-[11px] text-slate-400 italic">Bằng chữ:</span>
              <p className="text-xs font-semibold text-slate-200 italic mt-0.5">
                {request.amount_in_words || numberToVietnameseWords(request.total_amount)}
              </p>
            </div>
          </div>

          {/* 5. Chứng từ tích chọn & File đính kèm */}
          <div className="space-y-2">
            <span className="text-slate-500 font-semibold">Chứng từ kèm theo:</span>
            {request.attached_documents && request.attached_documents.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {request.attached_documents.map((doc, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-medium text-[11px]"
                  >
                    ✔ {doc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="italic text-slate-400">Không có danh mục chứng từ đính kèm</p>
            )}

            {request.attachments && request.attachments.length > 0 && (
              <div className="mt-3">
                <span className="text-slate-500 font-semibold block mb-1.5">Ảnh hóa đơn & Báo giá đính kèm:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {request.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col p-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/30 transition-all text-xs"
                    >
                      <div className="flex items-center space-x-1.5 truncate text-slate-800 font-medium group-hover:text-brand-700">
                        <Paperclip className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span className="truncate">{file.name || `Tài liệu đính kèm ${idx + 1}`}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{file.size || ''}</span>
                        <ExternalLink className="w-3 h-3 text-brand-500" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng lại
          </button>

          <div className="flex items-center space-x-2">
            {/* Nút từ chối */}
            {canReject && (
              <button
                type="button"
                onClick={() => setShowRejectDialog(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Từ Chối Phiếu</span>
              </button>
            )}

            {/* Nút Phê duyệt theo cấp */}
            {(canApproveHOD || canApproveAccountant || canApproveDirector) && (
              <button
                type="button"
                onClick={() => setShowApproveDialog(true)}
                className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {canApproveHOD
                    ? 'Trưởng Bộ Phận Duyệt'
                    : canApproveAccountant
                    ? 'Kế Toán Thẩm Định'
                    : 'Ban Giám Đốc Phê Duyệt'}
                </span>
              </button>
            )}

            {/* Nút Chi tiền */}
            {canPay && (
              <button
                type="button"
                onClick={() => setShowPaymentDialog(true)}
                className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                <span>Xác Nhận Đã Chi Tiền</span>
              </button>
            )}
          </div>
        </div>

        {/* Dialog Phê duyệt */}
        {showApproveDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="font-bold text-sm">Xác nhận Phê duyệt Phiếu Đề Xuất</h4>
              </div>
              <p className="text-xs text-slate-600">
                Bạn đang thực hiện phê duyệt cho phiếu <span className="font-bold text-slate-800">{request.code}</span> với tổng số tiền <span className="font-bold text-emerald-800">{formatMoney(request.total_amount)}</span>.
              </p>

              {dialogError && <p className="text-xs text-rose-600">{dialogError}</p>}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú / Ý kiến phê duyệt (Tùy chọn):</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Đồng ý đề xuất, chuyển bước tiếp theo..."
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
                  {isProcessing ? 'Đang duyệt...' : 'Đồng Ý Duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog Từ chối */}
        {showRejectDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-rose-700">
                <XCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Từ chối Phiếu Đề Xuất</h4>
              </div>
              <p className="text-xs text-slate-600">
                Vui lòng cung cấp lý do từ chối để người đề nghị được biết và điều chỉnh:
              </p>

              {dialogError && <p className="text-xs text-rose-600">{dialogError}</p>}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Lý do từ chối *:</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Báo giá quá cao so với định mức, thiếu hóa đơn GTGT hợp lệ..."
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

        {/* Dialog Xác nhận chi tiền */}
        {showPaymentDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Banknote className="w-5 h-5" />
                <h4 className="font-bold text-sm">Xác nhận Đã Xuất Quỹ / Chi Tiền</h4>
              </div>
              <p className="text-xs text-slate-600">
                Xác nhận đã giải ngân số tiền <span className="font-bold text-blue-800">{formatMoney(request.total_amount)}</span> cho người đề nghị:
              </p>

              {dialogError && <p className="text-xs text-rose-600">{dialogError}</p>}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã ủy nhiệm chi / Ghi chú chứng từ chi:</label>
                <input
                  type="text"
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  placeholder="Ví dụ: UNC-2026-9812, Chi tiền mặt phiếu thu số 88..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentDialog(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePay}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-xs"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Đã Chi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailModal;
