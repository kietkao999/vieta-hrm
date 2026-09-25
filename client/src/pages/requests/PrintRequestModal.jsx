import React, { useRef } from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';

const PrintRequestModal = ({ request, isOpen, onClose }) => {
  const printRef = useRef(null);

  if (!isOpen || !request) return null;

  const isService = request.type === 'SERVICE_PURCHASE';
  const formCode = isService ? 'Mẫu 01/ĐN-DV' : 'Mẫu 02/ĐNTT-VA';
  const formTitle = isService ? 'GIẤY ĐỀ NGHỊ MUA DỊCH VỤ' : 'GIẤY ĐỀ NGHỊ THANH TOÁN';

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '.../.../20...';
    try {
      const d = new Date(dateString);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ngày ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const createdDate = new Date(request.created_at || Date.now());
  const dayStr = String(createdDate.getDate()).padStart(2, '0');
  const monthStr = String(createdDate.getMonth() + 1).padStart(2, '0');
  const yearStr = createdDate.getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Header Toolbar (Ẩn khi in) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white no-print">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-base">Xem trước & In Phiếu chuẩn A4</h3>
            <span className="text-xs bg-brand-900/80 text-brand-200 border border-brand-700/60 px-2 py-0.5 rounded-md font-mono">
              {request.code}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung trang A4 chuẩn */}
        <div
          ref={printRef}
          className="print-container p-10 print:p-8 bg-white text-slate-900 font-serif leading-relaxed text-[13px] print:text-[11pt]"
          style={{ minHeight: '297mm' }}
        >
          {/* Header 2 cột: Đơn vị & Tiêu ngữ */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
            <div>
              <p className="font-bold uppercase tracking-wide text-xs text-slate-900">
                CÔNG TY TNHH TM SX VIỆT Á
              </p>
              <p className="text-[11px] text-slate-600">
                Bộ phận / Phòng ban: <span className="font-semibold text-slate-800">{request.department || 'Ban Giám Đốc'}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Mã phiếu: <span className="font-mono font-bold text-brand-800">{request.code}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xs uppercase tracking-wide">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="font-semibold text-xs italic">
                Độc lập - Tự do - Hạnh phúc
              </p>
              <div className="w-24 h-0.5 bg-slate-800 mx-auto my-1"></div>
              <p className="text-[11px] italic text-slate-600 mt-1">
                TP. Hồ Chí Minh, ngày {dayStr} tháng {monthStr} năm {yearStr}
              </p>
            </div>
          </div>

          {/* Tiêu đề biểu mẫu */}
          <div className="text-center my-6">
            <span className="text-[10px] font-sans font-semibold uppercase px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600">
              {formCode}
            </span>
            <h1 className="text-xl font-bold uppercase mt-2 tracking-wide text-slate-900 font-sans">
              {formTitle}
            </h1>
            {request.priority === 'KHANCAP' && (
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 rounded-full font-sans font-bold text-[11px]">
                ★ MỨC ĐỘ: KHẨN CẤP
              </span>
            )}
          </div>

          {/* Kính gửi */}
          <div className="mb-4 text-center italic text-slate-700">
            <span className="font-semibold">Kính gửi:</span> Ban Giám Đốc Công ty TNHH TM SX Việt Á
            <br />
            <span className="ml-14">Phòng Tài chính - Kế toán</span>
            <br />
            <span className="ml-14">Trưởng bộ phận {request.department}</span>
          </div>

          {/* Thông tin người đề nghị */}
          <div className="space-y-2 mb-4 text-slate-800">
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-semibold">Họ và tên người đề nghị:</span> {request.creator_name || request.creator_username}
              </p>
              <p>
                <span className="font-semibold">Mã nhân viên:</span> {request.creator_emp_code || '---'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-semibold">Chức vụ:</span> {request.creator_position || 'Nhân viên'}
              </p>
              <p>
                <span className="font-semibold">Đơn vị / Phòng ban:</span> {request.department}
              </p>
            </div>
            <p>
              <span className="font-semibold">{isService ? 'Lý do / Mục đích mua dịch vụ:' : 'Nội dung đề nghị thanh toán:'}</span>{' '}
              <span className="italic">{request.reason}</span>
            </p>
          </div>

          {/* Trường hợp 1: Biểu mẫu Mua dịch vụ (Bảng chi tiết các dịch vụ) */}
          {isService && (
            <div className="mb-4">
              <p className="font-semibold mb-2">Chi tiết các hạng mục / dịch vụ cần mua:</p>
              <table className="w-full border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-sans font-bold text-center">
                    <th className="border border-slate-400 p-2 w-10">STT</th>
                    <th className="border border-slate-400 p-2 text-left">Tên dịch vụ / Nội dung công việc</th>
                    <th className="border border-slate-400 p-2 text-left">Đơn vị cung cấp</th>
                    <th className="border border-slate-400 p-2 w-24">Thời gian</th>
                    <th className="border border-slate-400 p-2 text-right w-28">Chi phí dự kiến</th>
                    <th className="border border-slate-400 p-2 text-left">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items && request.items.length > 0 ? (
                    request.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-400 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 p-2 font-medium">{item.item_name}</td>
                        <td className="border border-slate-400 p-2">{item.provider || '---'}</td>
                        <td className="border border-slate-400 p-2 text-center">{formatDate(item.expected_date)}</td>
                        <td className="border border-slate-400 p-2 text-right font-mono font-semibold">
                          {formatMoney(item.amount)}
                        </td>
                        <td className="border border-slate-400 p-2 italic text-slate-600">{item.note || item.purpose || '---'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="border border-slate-400 p-3 text-center italic text-slate-500">
                        (Chi tiết dịch vụ theo nội dung đề nghị nêu trên)
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold font-sans">
                    <td colSpan="4" className="border border-slate-400 p-2 text-right uppercase">
                      Tổng cộng chi phí:
                    </td>
                    <td className="border border-slate-400 p-2 text-right font-mono text-brand-900 text-sm">
                      {formatMoney(request.total_amount)}
                    </td>
                    <td className="border border-slate-400 p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Trường hợp 2: Biểu mẫu Đề nghị thanh toán */}
          {!isService && (
            <div className="mb-4 space-y-2.5">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-semibold">Số tiền đề nghị thanh toán:</span>{' '}
                    <span className="font-bold text-base text-brand-900 font-mono">
                      {formatMoney(request.total_amount)}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Hình thức thanh toán:</span>{' '}
                    <span className="font-medium">
                      {request.payment_method === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản ngân hàng'}
                    </span>
                  </p>
                </div>
              </div>

              {request.payment_method === 'BANK_TRANSFER' && (
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-md space-y-1 text-xs">
                  <p className="font-semibold font-sans uppercase text-slate-700">Thông tin tài khoản thụ hưởng:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <p>
                      <span className="text-slate-600">Chủ tài khoản:</span>{' '}
                      <span className="font-bold uppercase">{request.bank_account_name || '---'}</span>
                    </p>
                    <p>
                      <span className="text-slate-600">Số tài khoản:</span>{' '}
                      <span className="font-mono font-bold text-sm text-slate-900">{request.bank_account_number || '---'}</span>
                    </p>
                    <p>
                      <span className="text-slate-600">Ngân hàng:</span>{' '}
                      <span className="font-medium">{request.bank_name || '---'}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Số tiền bằng chữ */}
          <div className="mb-4 p-2.5 border-l-4 border-brand-600 bg-slate-50 text-slate-900">
            <p className="italic">
              <span className="font-semibold not-italic">Bằng chữ:</span>{' '}
              <span className="font-semibold text-slate-800">
                {request.amount_in_words || numberToVietnameseWords(request.total_amount)}
              </span>
            </p>
          </div>

          {/* Chứng từ đính kèm */}
          <div className="mb-6 text-xs text-slate-700">
            <span className="font-semibold">Chứng từ gốc kèm theo: </span>
            {request.attached_documents && request.attached_documents.length > 0 ? (
              <span className="italic">{request.attached_documents.join(', ')}</span>
            ) : (
              <span className="italic">Hóa đơn, bảng kê chi tiết kèm theo phiếu</span>
            )}
          </div>

          {/* Khu vực 4 Ô Ký Tên Chuẩn A4 */}
          <div className="mt-8 pt-4 border-t border-slate-300">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* 1. Người đề nghị */}
              <div className="flex flex-col justify-between min-h-[140px]">
                <div>
                  <p className="font-bold uppercase font-sans text-[11px]">NGƯỜI ĐỀ NGHỊ</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="my-auto py-2">
                  <span className="text-slate-400 italic text-[11px] font-sans font-medium">Đã lập phiếu</span>
                </div>
                <p className="font-semibold font-sans text-[12px]">{request.creator_name || request.creator_username}</p>
              </div>

              {/* 2. Trưởng bộ phận */}
              <div className="flex flex-col justify-between min-h-[140px]">
                <div>
                  <p className="font-bold uppercase font-sans text-[11px]">TRƯỞNG BỘ PHẬN</p>
                  <p className="italic text-[10px] text-slate-500">(Ký, duyệt)</p>
                </div>
                <div className="my-auto py-2">
                  {request.hod_approved_by ? (
                    <div className="inline-block p-1.5 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 font-sans text-[10px]">
                      <div className="flex items-center justify-center space-x-1 font-bold">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>ĐÃ DUYỆT</span>
                      </div>
                      <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(request.hod_approved_at)}</p>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic text-[10px]">(Chưa ký)</span>
                  )}
                </div>
                <p className="font-semibold font-sans text-[12px]">{request.hod_fullname || '.........................'}</p>
              </div>

              {/* 3. Kế toán trưởng */}
              <div className="flex flex-col justify-between min-h-[140px]">
                <div>
                  <p className="font-bold uppercase font-sans text-[11px]">KẾ TOÁN TRƯỞNG</p>
                  <p className="italic text-[10px] text-slate-500">(Kiểm tra & xác nhận)</p>
                </div>
                <div className="my-auto py-2">
                  {request.acc_approved_by ? (
                    <div className="inline-block p-1.5 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 font-sans text-[10px]">
                      <div className="flex items-center justify-center space-x-1 font-bold">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>ĐÃ DUYỆT</span>
                      </div>
                      <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(request.acc_approved_at)}</p>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic text-[10px]">(Chưa ký)</span>
                  )}
                </div>
                <p className="font-semibold font-sans text-[12px]">{request.acc_fullname || '.........................'}</p>
              </div>

              {/* 4. Ban Giám Đốc */}
              <div className="flex flex-col justify-between min-h-[140px]">
                <div>
                  <p className="font-bold uppercase font-sans text-[11px] text-brand-900">BAN GIÁM ĐỐC</p>
                  <p className="italic text-[10px] text-slate-500">(Phê duyệt chi)</p>
                </div>
                <div className="my-auto py-2">
                  {request.dir_approved_by || request.status === 'APPROVED' || request.status === 'PAID' ? (
                    <div className="inline-block p-1.5 bg-brand-50 border border-brand-400 rounded text-brand-900 font-sans text-[10px] shadow-xs">
                      <div className="flex items-center justify-center space-x-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>ĐÃ PHÊ DUYỆT</span>
                      </div>
                      <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(request.dir_approved_at || request.updated_at)}</p>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic text-[10px]">(Chờ phê duyệt)</span>
                  )}
                </div>
                <p className="font-semibold font-sans text-[12px]">{request.dir_fullname || '.........................'}</p>
              </div>
            </div>
          </div>

          {/* Dấu mộc trạng thái đã thanh toán */}
          {request.status === 'PAID' && (
            <div className="mt-6 p-2.5 border-2 border-dashed border-blue-400 bg-blue-50/60 rounded text-center text-xs font-sans text-blue-900">
              <span className="font-bold uppercase">✔ ĐÃ HOÀN TẤT CHI TIỀN / GIẢI NGÂN</span>
              {request.paid_fullname && <span className="ml-2 italic text-slate-600">Thực hiện bởi: {request.paid_fullname} ({formatDateTime(request.paid_at)})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintRequestModal;
