import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';

// Chuẩn hóa Unicode NFC để tránh lỗi tách rời dấu tiếng Việt
const nfc = (str) => (str ? String(str).normalize('NFC') : '');

const PrintWorkflowModal = ({ request, type = 'PURCHASE', isOpen, onClose }) => {
  const printRef = useRef(null);
  const [fullReq, setFullReq] = useState(request);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    setFullReq(request);
    if (!request || !isOpen) return;

    // Tự động tải lại đầy đủ items và attachments nếu chưa có
    const needFetch =
      (type === 'PURCHASE' && (!request.items || request.items.length === 0)) ||
      !request.attachments;

    if (needFetch && request.id) {
      setIsLoadingDetails(true);
      const endpoint = type === 'PURCHASE' ? `/requests/purchase/${request.id}` : `/requests/payment/${request.id}`;
      api.get(endpoint)
        .then((res) => {
          if (res.data?.data) {
            setFullReq(res.data.data);
          }
        })
        .catch((err) => console.error('Lỗi khi tải chi tiết để in:', err))
        .finally(() => setIsLoadingDetails(false));
    }
  }, [request, isOpen, type]);

  if (!isOpen || !fullReq) return null;

  const isPurchase = type === 'PURCHASE';

  const formatMoney = (amount) =>
    new Intl.NumberFormat('vi-VN').format(amount || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const createdDate = new Date(fullReq.created_at || Date.now());
  const dayStr = String(createdDate.getDate()).padStart(2, '0');
  const monthStr = String(createdDate.getMonth() + 1).padStart(2, '0');
  const yearStr = createdDate.getFullYear();

  const totalAmount = isPurchase ? fullReq.total_estimated_amount : fullReq.total_amount;
  const amountWords = nfc(fullReq.amount_in_words || numberToVietnameseWords(totalAmount));

  // Danh sách các loại chứng từ đính kèm
  const attachedTypes = (fullReq.attachments || []).map(a => a.file_type);
  const hasBaoGia = attachedTypes.includes('BAO_GIA_HOP_DONG') || (fullReq.attachments && fullReq.attachments.length > 0);
  const hasHoaDon = attachedTypes.includes('HOA_DON_GTGT');
  const hasNghiemThu = attachedTypes.includes('BIEN_BAN_NGHIEM_THU');
  const hasKhac = attachedTypes.includes('KHAC') || attachedTypes.includes('ANH_THUC_TE');

  // Danh sách dòng bảng dịch vụ (đệm thêm dòng trống nếu ít hơn 6 dòng cho chuẩn trang in)
  const itemsList = fullReq.items || [];
  const minRows = Math.max(itemsList.length, 6);
  const tableRows = [];
  for (let i = 0; i < minRows; i++) {
    tableRows.push(itemsList[i] || null);
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-800 text-white no-print">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-sm">
              Biểu Mẫu Chuẩn A4: {isPurchase ? 'Mẫu 01/ĐN-DV (Đề nghị mua dịch vụ)' : 'Mẫu 02/ĐNTT-VA (Đề nghị thanh toán)'}
            </h3>
            <span className="text-xs bg-brand-900 text-brand-200 border border-brand-700 px-2 py-0.5 rounded font-mono font-bold">
              {fullReq.code}
            </span>
            {isLoadingDetails && (
              <span className="text-xs text-amber-300 animate-pulse ml-2">(Đang đồng bộ dữ liệu...)</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Khung A4 Chuẩn 100% Theo Mẫu Công Ty */}
        <div
          ref={printRef}
          className="print-container p-8 print:p-6 bg-white text-slate-900 text-[13px] print:text-[11pt] leading-normal"
          style={{
            minHeight: '297mm',
            fontFamily: "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif"
          }}
        >
          {/* ========================================================================= */}
          {/* MẪU 01: GIẤY ĐỀ NGHỊ MUA DỊCH VỤ */}
          {/* ========================================================================= */}
          {isPurchase && (
            <div>
              {/* Header Trên cùng */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm tracking-tight">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                </div>
                <div className="text-right italic text-xs text-slate-800">
                  <p>{nfc('Mẫu số: 01/ĐN-DV')}</p>
                  <p>{nfc(`Số phiếu: ${fullReq.code}`)}</p>
                </div>
              </div>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-4">
                <h1 className="text-xl font-bold uppercase tracking-wide text-[#174378]">
                  {nfc('GIẤY ĐỀ NGHỊ MUA DỊCH VỤ')}
                </h1>
                <p className="italic text-xs text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-xs text-slate-800 mt-1">
                  {nfc(`Kính gửi: Ban Giám Đốc – ${fullReq.approver_department || fullReq.department || 'Phòng ban liên quan'}`)}
                </p>
              </div>

              {/* Thông tin chung */}
              <div className="space-y-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <p className="w-1/2">
                    <span>{nfc('Họ và tên người đề nghị: ')}</span>
                    <span className="font-semibold">{nfc(fullReq.creator_name || fullReq.creator_username)}</span>
                  </p>
                  <p className="w-1/2">
                    <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                    <span className="font-semibold">{nfc(fullReq.department)}</span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Lý do đề nghị: ')}</span>
                  <span className="font-medium italic">{nfc(fullReq.purpose)}</span>
                </div>

                <div className="flex items-center space-x-6 pt-0.5">
                  <span>{nfc('Mức độ ưu tiên:')}</span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{fullReq.priority === 'KHANCAP' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Khẩn cấp')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{fullReq.priority === 'BINHTHUONG' || !fullReq.priority ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Bình thường')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{fullReq.priority === 'DUPHONG' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Dự phòng')}</span>
                  </span>
                </div>
              </div>

              {/* Bảng chi tiết dịch vụ */}
              <div className="mb-3">
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-[#174378] text-white font-bold text-center">
                      <th className="border border-slate-400 p-2 w-10">{nfc('STT')}</th>
                      <th className="border border-slate-400 p-2 text-left">{nfc('Tên dịch vụ / Nội dung công việc')}</th>
                      <th className="border border-slate-400 p-2 text-left w-36">{nfc('Đơn vị cung cấp (NCC)')}</th>
                      <th className="border border-slate-400 p-2 w-28">{nfc('Thời gian thực hiện')}</th>
                      <th className="border border-slate-400 p-2 text-right w-32">{nfc('Chi phí dự kiến (VNĐ)')}</th>
                      <th className="border border-slate-400 p-2 text-left w-28">{nfc('Mục đích sử dụng')}</th>
                      <th className="border border-slate-400 p-2 text-left w-24">{nfc('Ghi chú')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((it, idx) => (
                      <tr key={idx} className="h-7 text-xs">
                        <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 font-medium">{it ? nfc(it.service_name) : ''}</td>
                        <td className="border border-slate-400 p-1.5">{it ? nfc(it.supplier_name || '---') : ''}</td>
                        <td className="border border-slate-400 p-1.5 text-center">{it ? formatDate(it.due_date) : ''}</td>
                        <td className="border border-slate-400 p-1.5 text-right font-mono font-semibold">
                          {it && it.amount ? formatMoney(it.amount) : ''}
                        </td>
                        <td className="border border-slate-400 p-1.5 italic text-slate-700">{it ? nfc(fullReq.purpose) : ''}</td>
                        <td className="border border-slate-400 p-1.5 italic text-slate-600">{it ? nfc(it.note || '') : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold text-xs">
                      <td colSpan="4" className="border border-slate-400 p-2 text-left uppercase">
                        {nfc('TỔNG CHI PHÍ DỰ KIẾN')}
                      </td>
                      <td className="border border-slate-400 p-2 text-right font-mono text-sm text-brand-950 font-black">
                        {formatMoney(fullReq.total_estimated_amount)} đ
                      </td>
                      <td colSpan="2" className="border border-slate-400 p-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Hồ sơ đính kèm & Ghi chú thêm */}
              <div className="space-y-1.5 mb-6 text-xs">
                <div className="flex items-center space-x-6">
                  <span className="w-28 text-slate-700">{nfc('Hồ sơ đính kèm:')}</span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{hasBaoGia ? ' ✔ ' : '   '}]</span>
                    <span>{nfc(`Có báo giá kèm theo (${fullReq.attachments?.length || '01'} bản)`)}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{!hasBaoGia ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Chưa có báo giá')}</span>
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="w-28 text-slate-700">{nfc('Ghi chú thêm:')}</span>
                  <span className="italic text-slate-800">
                    {fullReq.hod_comment ? nfc(fullReq.hod_comment) : nfc('Đã so sánh giá với các đơn vị cung cấp theo quy trình')}
                  </span>
                </div>
              </div>

              {/* Khu vực 4 Chữ Ký Chuẩn (Mẫu 01) */}
              <div className="mt-8 pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {/* 1. Người đề nghị */}
                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      <span className="text-slate-400 italic text-[11px]">{nfc('Đã lập phiếu')}</span>
                    </div>
                    <p className="font-semibold text-[12px]">{nfc(fullReq.creator_name || fullReq.creator_username)}</p>
                  </div>

                  {/* 2. Trưởng bộ phận */}
                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">
                        {nfc('TRƯỞNG BỘ PHẬN')}
                        {fullReq.approver_department && fullReq.approver_department !== fullReq.department && (
                          <span className="block text-[9px] font-normal lowercase italic text-slate-600">({nfc(fullReq.approver_department)})</span>
                        )}
                      </p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {fullReq.hod_approved_by ? (
                        <div className="inline-block p-1 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{nfc('ĐÃ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(fullReq.hod_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[12px]">{nfc(fullReq.hod_fullname || '.........................')}</p>
                  </div>

                  {/* 3. Bộ phận Kế toán / Thu mua */}
                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">{nfc('BỘ PHẬN KẾ TOÁN / THU MUA')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {fullReq.acc_approved_by ? (
                        <div className="inline-block p-1 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{nfc('ĐÃ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(fullReq.acc_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[12px]">{nfc(fullReq.acc_fullname || '.........................')}</p>
                  </div>

                  {/* 4. Ban Giám Đốc */}
                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[11px] text-brand-900">{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {fullReq.bod_approved_by || fullReq.status === 'APPROVED' ? (
                        <div className="inline-block p-1 bg-brand-50 border border-brand-400 rounded text-brand-900 text-[10px] shadow-xs">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                            <span>{nfc('ĐÃ PHÊ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(fullReq.bod_approved_at || fullReq.updated_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chờ phê duyệt)')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[12px]">{nfc(fullReq.bod_fullname || '.........................')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MẪU 02: GIẤY ĐỀ NGHỊ THANH TOÁN */}
          {/* ========================================================================= */}
          {!isPurchase && (
            <div>
              {/* Header Trên cùng */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm tracking-tight">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                </div>
                <div className="text-right italic text-xs text-slate-800">
                  <p>{nfc('Mẫu số: 02/ĐNTT-VA')}</p>
                  <p>{nfc(`Số phiếu: ${fullReq.code}`)}</p>
                </div>
              </div>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-4">
                <h1 className="text-xl font-bold uppercase tracking-wide text-[#174378]">
                  {nfc('GIẤY ĐỀ NGHỊ THANH TOÁN')}
                </h1>
                <p className="italic text-xs text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-xs font-semibold text-slate-800 mt-1">
                  {nfc('Kính gửi: BAN GIÁM ĐỐC – PHÒNG KẾ TOÁN')}
                </p>
              </div>

              {/* Thông tin người đề nghị & Nội dung */}
              <div className="space-y-2.5 mb-3 text-xs">
                <div className="flex justify-between">
                  <p className="w-1/2">
                    <span>{nfc('Họ và tên người đề nghị: ')}</span>
                    <span className="font-semibold">{nfc(fullReq.creator_name || fullReq.creator_username)}</span>
                  </p>
                  <p className="w-1/2">
                    <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                    <span className="font-semibold">{nfc(fullReq.department)}</span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Nội dung thanh toán: ')}</span>
                  <span className="font-medium italic">{nfc(fullReq.payment_content)}</span>
                </div>

                <div className="flex items-center space-x-12">
                  <p>
                    <span>{nfc('Số tiền đề nghị (bằng số): ')}</span>
                    <span className="font-bold font-mono text-sm text-slate-950 ml-2">{formatMoney(fullReq.total_amount)} Đồng</span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Số tiền viết bằng chữ: ')}</span>
                  <span className="font-semibold italic text-slate-800 ml-2">{amountWords}</span>
                </div>

                <div className="flex items-center space-x-6">
                  <span>{nfc('Hình thức thanh toán:')}</span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{fullReq.payment_method === 'TIEN_MAT' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Tiền mặt')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{fullReq.payment_method === 'CHUYEN_KHOAN' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Chuyển khoản')}</span>
                  </span>
                </div>
              </div>

              {/* BANNER 1: THÔNG TIN TÀI KHOẢN THỤ HƯỞNG */}
              <div className="mb-3 border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#174378] text-white font-bold text-center py-1.5 px-3 text-xs uppercase tracking-wide">
                  {nfc('THÔNG TIN TÀI KHOẢN THỤ HƯỞNG (NẾU CHUYỂN KHOẢN)')}
                </div>
                <div className="p-3 bg-white space-y-2 text-xs">
                  <p>
                    <span className="text-slate-700">{nfc('Tên người/Đơn vị thụ hưởng: ')}</span>
                    <span className="font-bold uppercase text-slate-900 ml-1">{nfc(fullReq.bank_account_holder || '---')}</span>
                  </p>
                  <div className="flex justify-between">
                    <p className="w-1/2">
                      <span className="text-slate-700">{nfc('Số tài khoản: ')}</span>
                      <span className="font-mono font-bold text-slate-950 text-sm ml-1">{fullReq.bank_account_number || '---'}</span>
                    </p>
                    <p className="w-1/2">
                      <span className="text-slate-700">{nfc('Ngân hàng: ')}</span>
                      <span className="font-semibold text-slate-900 ml-1">{nfc(fullReq.bank_name || '---')}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* BANNER 2: CHỨNG TỪ GỐC ĐÍNH KÈM */}
              <div className="mb-6 border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#174378] text-white font-bold text-center py-1.5 px-3 text-xs uppercase tracking-wide">
                  {nfc('CHỨNG TỪ GỐC ĐÍNH KÈM')}
                </div>
                <div className="p-3 bg-white space-y-2 text-xs">
                  <div className="flex items-center space-x-5">
                    <span className="text-slate-700 w-32">{nfc('Chứng từ kèm theo:')}</span>
                    <span className="inline-flex items-center space-x-1">
                      <span className="font-mono font-bold">[{hasBaoGia ? ' ✔ ' : '   '}]</span>
                      <span>{nfc('Báo giá / Đơn hàng')}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <span className="font-mono font-bold">[{hasHoaDon ? ' ✔ ' : '   '}]</span>
                      <span>{nfc('Hóa đơn / Phiếu thu')}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <span className="font-mono font-bold">[{hasNghiemThu ? ' ✔ ' : '   '}]</span>
                      <span>{nfc('Biên bản nghiệm thu')}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <span className="font-mono font-bold">[{hasKhac ? ' ✔ ' : '   '}]</span>
                      <span>{nfc('Khác')}</span>
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="text-slate-700 w-32">{nfc('Ghi chú thêm:')}</span>
                    <span className="italic text-slate-800">
                      {fullReq.acc_comment || fullReq.hod_comment ? nfc(fullReq.acc_comment || fullReq.hod_comment) : nfc('Đã nghiệm thu và kiểm tra đầy đủ chứng từ gốc hợp lệ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Khu vực 3 Chữ Ký Chuẩn (Mẫu 02) */}
              <div className="mt-8 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  {/* 1. Người đề nghị */}
                  <div className="flex flex-col justify-between min-h-[140px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2">
                      <span className="text-slate-400 italic text-[11px]">{nfc('Đã lập phiếu')}</span>
                    </div>
                    <p className="font-semibold text-[13px]">{nfc(fullReq.creator_name || fullReq.creator_username)}</p>
                  </div>

                  {/* 2. Kế toán trưởng */}
                  <div className="flex flex-col justify-between min-h-[140px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('KẾ TOÁN TRƯỞNG')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2">
                      {fullReq.acc_approved_by ? (
                        <div className="inline-block p-1.5 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{nfc('ĐÃ KIỂM TRA')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(fullReq.acc_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[13px]">{nfc(fullReq.acc_fullname || '.........................')}</p>
                  </div>

                  {/* 3. Ban Giám Đốc */}
                  <div className="flex flex-col justify-between min-h-[140px]">
                    <div>
                      <p className="font-bold uppercase text-[12px] text-brand-900">{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                    </div>
                    <div className="my-auto py-2">
                      {fullReq.bod_approved_by || fullReq.status === 'PAID' ? (
                        <div className="inline-block p-1.5 bg-brand-50 border border-brand-400 rounded text-brand-900 text-[10px] shadow-xs">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                            <span>{nfc('ĐÃ PHÊ DUYỆT CHI')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(fullReq.bod_approved_at || fullReq.updated_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chờ phê duyệt)')}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[13px]">{nfc(fullReq.bod_fullname || '.........................')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintWorkflowModal;
