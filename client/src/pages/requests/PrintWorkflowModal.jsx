import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Layers, FileText, Receipt, DollarSign, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { numberToVietnameseWords } from '../../utils/numberToVietnameseWords';

// Chuẩn hóa Unicode NFC để tránh lỗi tách rời dấu tiếng Việt
const nfc = (str) => (str ? String(str).normalize('NFC') : '');

const FILE_TYPE_MAP = {
  HOA_DON_GTGT: '🧾 Hóa đơn Giá trị gia tăng (GTGT)',
  BAO_GIA_HOP_DONG: '📑 Báo giá / Hợp đồng kinh tế',
  BIEN_BAN_NGHIEM_THU: '📋 Biên bản nghiệm thu / Bàn giao',
  ANH_THUC_TE: '📸 Hình ảnh nghiệm thu thực tế',
  KHAC: '📂 Chứng từ kế toán khác'
};

const PrintWorkflowModal = ({ request, type = 'PURCHASE', isOpen, onClose }) => {
  const printRef = useRef(null);

  // Chế độ in: 'COMBO_3_PAGES' (Trọn bộ 3 tờ) | 'PURCHASE_ONLY' | 'ATTACHMENTS_ONLY' | 'PAYMENT_ONLY'
  const [printMode, setPrintMode] = useState('COMBO_3_PAGES');
  const [purchaseData, setPurchaseData] = useState(type === 'PURCHASE' ? request : null);
  const [paymentData, setPaymentData] = useState(type === 'PAYMENT' ? request : null);
  const [allAttachments, setAllAttachments] = useState(request?.attachments || []);
  const [isLoadingCombo, setIsLoadingCombo] = useState(false);

  useEffect(() => {
    if (!request || !isOpen) return;

    setIsLoadingCombo(true);
    // Tải dữ liệu trọn bộ combo từ API
    api.get(`/requests/combo/${type}/${request.id}`)
      .then((res) => {
        if (res.data?.data) {
          const combo = res.data.data;
          setPurchaseData(combo.purchase_request || (type === 'PURCHASE' ? request : null));
          setPaymentData(combo.payment_request || (type === 'PAYMENT' ? request : null));
          setAllAttachments(combo.attachments || request.attachments || []);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải dữ liệu combo in 3 tờ:', err);
        if (type === 'PURCHASE') setPurchaseData(request);
        else setPaymentData(request);
        setAllAttachments(request.attachments || []);
      })
      .finally(() => setIsLoadingCombo(false));
  }, [request, isOpen, type]);

  if (!isOpen) return null;

  // Phiếu chính đang xem
  const mainReq = type === 'PURCHASE' ? (purchaseData || request) : (paymentData || request);
  const effectivePurchase = purchaseData || (type === 'PURCHASE' ? request : null);
  const effectivePayment = paymentData || (type === 'PAYMENT' ? request : null);

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

  const createdDate = new Date(mainReq.created_at || Date.now());
  const dayStr = String(createdDate.getDate()).padStart(2, '0');
  const monthStr = String(createdDate.getMonth() + 1).padStart(2, '0');
  const yearStr = createdDate.getFullYear();

  // Danh sách dòng bảng dịch vụ cho Phần 1 (đệm thêm dòng trống nếu ít hơn 6 dòng cho chuẩn trang in)
  const purchaseItems = effectivePurchase?.items || [];
  const minRows = Math.max(purchaseItems.length, 6);
  const purchaseTableRows = [];
  for (let i = 0; i < minRows; i++) {
    purchaseTableRows.push(purchaseItems[i] || null);
  }

  // Danh sách loại chứng từ đính kèm
  const attachedTypes = allAttachments.map(a => a.file_type);
  const hasBaoGia = attachedTypes.includes('BAO_GIA_HOP_DONG') || allAttachments.length > 0;
  const hasHoaDon = attachedTypes.includes('HOA_DON_GTGT');
  const hasNghiemThu = attachedTypes.includes('BIEN_BAN_NGHIEM_THU');
  const hasKhac = attachedTypes.includes('KHAC') || attachedTypes.includes('ANH_THUC_TE');

  // Quyết định render các trang
  const showPage1 = printMode === 'COMBO_3_PAGES' || printMode === 'PURCHASE_ONLY';
  const showPage2 = printMode === 'COMBO_3_PAGES' || printMode === 'ATTACHMENTS_ONLY';
  const showPage3 = printMode === 'COMBO_3_PAGES' || printMode === 'PAYMENT_ONLY';

  return (
    <div className="fixed inset-0 z-70 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-2 sm:my-4 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header Toolbar Cố định trên cùng modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 bg-slate-800 text-white no-print sticky top-0 z-30 shadow-md gap-3">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm">Xem Trước & In Hồ Sơ Chuẩn A4</h3>
                <span className="text-xs bg-brand-900 text-brand-200 border border-brand-700 px-2 py-0.5 rounded font-mono font-bold">
                  {mainReq.code}
                </span>
              </div>
              {isLoadingCombo && (
                <span className="text-[11px] text-amber-300 animate-pulse">Đang liên kết trọn bộ 3 tờ...</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thanh Chọn Chế Độ In (Tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-2 bg-slate-100 border-b border-slate-200 gap-1.5 text-xs no-print">
          <button
            type="button"
            onClick={() => setPrintMode('COMBO_3_PAGES')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
              printMode === 'COMBO_3_PAGES'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🌟 In Trọn Bộ 3 Tờ (Combo)</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('PURCHASE_ONLY')}
            className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              printMode === 'PURCHASE_ONLY'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Đề nghị mua (Mẫu 01)</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('ATTACHMENTS_ONLY')}
            className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              printMode === 'ATTACHMENTS_ONLY'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>2. Bảng kê chứng từ ({allAttachments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('PAYMENT_ONLY')}
            className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              printMode === 'PAYMENT_ONLY'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Thanh toán (Mẫu 02)</span>
          </button>
        </div>

        {/* Khung Chứa Các Trang In A4 Chuẩn */}
        <div
          ref={printRef}
          className="print-container bg-white text-slate-900 text-[13px] print:text-[11pt] leading-normal"
          style={{
            fontFamily: "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif"
          }}
        >
          {/* ========================================================================= */}
          {/* TRANG 1: MẪU 01 - GIẤY ĐỀ NGHỊ MUA DỊCH VỤ (01/ĐN-DV) */}
          {/* ========================================================================= */}
          {showPage1 && (
            <div
              className="p-8 sm:p-10 pt-6 sm:pt-8 print:p-6 print:pt-4 bg-white"
              style={{
                minHeight: '297mm',
                pageBreakAfter: (showPage2 || showPage3) ? 'always' : 'auto',
                breakAfter: (showPage2 || showPage3) ? 'page' : 'auto'
              }}
            >
              {/* Header Trên cùng */}
              <div className="flex justify-between items-start pt-2 pb-1">
                <div>
                  <p className="font-bold text-sm tracking-tight text-slate-950">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                </div>
                <div className="text-right italic text-xs text-slate-800">
                  <p>{nfc('Mẫu số: 01/ĐN-DV')}</p>
                  <p>{nfc(`Số phiếu: ${effectivePurchase ? effectivePurchase.code : mainReq.code}`)}</p>
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
                  {nfc(`Kính gửi: Ban Giám Đốc – ${effectivePurchase?.approver_department || mainReq.approver_department || mainReq.department || 'Phòng ban liên quan'}`)}
                </p>
              </div>

              {/* Thông tin chung */}
              <div className="space-y-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <p className="w-1/2">
                    <span>{nfc('Họ và tên người đề nghị: ')}</span>
                    <span className="font-semibold">{nfc(effectivePurchase?.creator_name || mainReq.creator_name || mainReq.creator_username)}</span>
                  </p>
                  <p className="w-1/2">
                    <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                    <span className="font-semibold">{nfc(effectivePurchase?.department || mainReq.department)}</span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Lý do đề nghị: ')}</span>
                  <span className="font-medium italic">{nfc(effectivePurchase?.purpose || mainReq.purpose || mainReq.payment_content)}</span>
                </div>

                <div className="flex items-center space-x-6 pt-0.5">
                  <span>{nfc('Mức độ ưu tiên:')}</span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{mainReq.priority === 'KHANCAP' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Khẩn cấp')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{mainReq.priority === 'BINHTHUONG' || !mainReq.priority ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Bình thường')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{mainReq.priority === 'DUPHONG' ? ' ✔ ' : '   '}]</span>
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
                    {purchaseTableRows.map((it, idx) => (
                      <tr key={idx} className="h-7 text-xs">
                        <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 font-medium">{it ? nfc(it.service_name) : ''}</td>
                        <td className="border border-slate-400 p-1.5">{it ? nfc(it.supplier_name || '---') : ''}</td>
                        <td className="border border-slate-400 p-1.5 text-center">{it ? formatDate(it.due_date) : ''}</td>
                        <td className="border border-slate-400 p-1.5 text-right font-mono font-semibold">
                          {it && it.amount ? formatMoney(it.amount) : ''}
                        </td>
                        <td className="border border-slate-400 p-1.5 italic text-slate-700">{it ? nfc(effectivePurchase?.purpose || mainReq.purpose || '') : ''}</td>
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
                        {formatMoney(effectivePurchase?.total_estimated_amount || mainReq.total_estimated_amount || mainReq.total_amount)} đ
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
                    <span>{nfc(`Có báo giá kèm theo (${allAttachments.length || '01'} bản)`)}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{!hasBaoGia ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Chưa có báo giá')}</span>
                  </span>
                </div>

                <div className="flex items-start">
                  <span className="w-28 text-slate-700">{nfc('Ghi chú thêm:')}</span>
                  <span className="italic text-slate-800">
                    {mainReq.hod_comment ? nfc(mainReq.hod_comment) : nfc('Đã so sánh giá với các đơn vị cung cấp theo quy trình')}
                  </span>
                </div>
              </div>

              {/* 4 Chữ Ký Chuẩn Dùng Chung */}
              <div className="mt-8 pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2"></div>
                    <p className="font-mono text-slate-400 text-[11px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">
                        {nfc('TRƯỞNG BỘ PHẬN')}
                        {mainReq.approver_department && mainReq.approver_department !== mainReq.department && (
                          <span className="block text-[9px] font-normal lowercase italic text-slate-600">({nfc(mainReq.approver_department)})</span>
                        )}
                      </p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {effectivePurchase?.hod_approved_by || mainReq.hod_approved_by ? (
                        <div className="inline-block p-1 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{nfc('ĐÃ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(effectivePurchase?.hod_approved_at || mainReq.hod_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-mono text-slate-400 text-[11px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[11px]">{nfc('BỘ PHẬN KẾ TOÁN / THU MUA')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {effectivePurchase?.acc_approved_by || mainReq.acc_approved_by ? (
                        <div className="inline-block p-1 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>{nfc('ĐÃ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(effectivePurchase?.acc_approved_at || mainReq.acc_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-mono text-slate-400 text-[11px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[11px] text-brand-900">{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                    </div>
                    <div className="my-auto py-1">
                      {effectivePurchase?.bod_approved_by || mainReq.bod_approved_by || mainReq.status === 'APPROVED' ? (
                        <div className="inline-block p-1 bg-brand-50 border border-brand-400 rounded text-brand-900 text-[10px] shadow-xs">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                            <span>{nfc('ĐÃ PHÊ DUYỆT')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600">{formatDateTime(effectivePurchase?.bod_approved_at || mainReq.bod_approved_at || mainReq.updated_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chờ phê duyệt)')}</span>
                      )}
                    </div>
                    <p className="font-mono text-slate-400 text-[11px]">.........................</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRANG 2: PHẦN 2 - BẢNG TỔNG HỢP HÓA ĐƠN & CHỨNG TỪ GỐC */}
          {/* ========================================================================= */}
          {showPage2 && (
            <div
              className="p-8 sm:p-10 pt-6 sm:pt-8 print:p-6 print:pt-4 bg-white"
              style={{
                minHeight: '297mm',
                pageBreakAfter: showPage3 ? 'always' : 'auto',
                breakAfter: showPage3 ? 'page' : 'auto'
              }}
            >
              {/* Header Trên cùng */}
              <div className="flex justify-between items-start pt-2 pb-1">
                <div>
                  <p className="font-bold text-sm tracking-tight text-slate-950">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                </div>
                <div className="text-right italic text-xs text-slate-800">
                  <p>{nfc('PHẦN 2 / QUY TRÌNH 3 BƯỚC')}</p>
                  <p>{nfc(`Hồ sơ số: ${mainReq.code}`)}</p>
                </div>
              </div>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-4">
                <h1 className="text-xl font-bold uppercase tracking-wide text-[#174378]">
                  {nfc('BẢNG TỔNG HỢP HÓA ĐƠN & CHỨNG TỪ GỐC')}
                </h1>
                <p className="italic text-xs text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-xs font-semibold text-slate-800 mt-1">
                  {nfc('Kèm theo hồ sơ đề xuất & quyết toán chi phí công ty')}
                </p>
              </div>

              {/* Thông tin hồ sơ */}
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <p className="w-1/2">
                    <span>{nfc('Người lập hồ sơ: ')}</span>
                    <span className="font-semibold">{nfc(mainReq.creator_name || mainReq.creator_username)}</span>
                  </p>
                  <p className="w-1/2">
                    <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                    <span className="font-semibold">{nfc(mainReq.department)}</span>
                  </p>
                </div>
                <div>
                  <span>{nfc('Nội dung công việc / Dịch vụ: ')}</span>
                  <span className="font-medium italic">{nfc(mainReq.purpose || mainReq.payment_content)}</span>
                </div>
              </div>

              {/* Bảng kê danh sách chứng từ */}
              <div className="mb-4">
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-[#174378] text-white font-bold text-center">
                      <th className="border border-slate-400 p-2 w-10">{nfc('STT')}</th>
                      <th className="border border-slate-400 p-2 text-left w-48">{nfc('Phân loại chứng từ')}</th>
                      <th className="border border-slate-400 p-2 text-left">{nfc('Tên file / Số hóa đơn chứng từ')}</th>
                      <th className="border border-slate-400 p-2 w-28">{nfc('Dung lượng')}</th>
                      <th className="border border-slate-400 p-2 w-32">{nfc('Ngày tải lên')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAttachments.length > 0 ? (
                      allAttachments.map((att, idx) => (
                        <tr key={idx} className="h-7">
                          <td className="border border-slate-400 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-400 p-1.5 font-semibold text-slate-900">
                            {nfc(FILE_TYPE_MAP[att.file_type] || att.file_type)}
                          </td>
                          <td className="border border-slate-400 p-1.5 font-medium">{nfc(att.file_name)}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-mono text-slate-600">{att.file_size || '---'}</td>
                          <td className="border border-slate-400 p-1.5 text-center text-slate-600">{formatDate(att.uploaded_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="border border-slate-400 p-4 text-center italic text-slate-400">
                          {nfc('Chứng từ gốc đính kèm bản cứng theo phiếu')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Khung hiển thị ảnh hóa đơn / chứng từ thực tế */}
              <div className="mb-6 p-3 border border-slate-300 rounded bg-slate-50">
                <p className="font-bold text-xs uppercase text-slate-800 mb-2">
                  {nfc('Hình ảnh hóa đơn / Nghiệm thu thực tế kèm theo:')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {allAttachments
                    .filter(a => /\.(jpg|jpeg|png|webp|gif)$/i.test(a.file_url || a.file_name || ''))
                    .slice(0, 2)
                    .map((imgAtt, idx) => (
                      <div key={idx} className="border border-slate-300 bg-white p-2 rounded text-center">
                        <img
                          src={imgAtt.file_url}
                          alt={imgAtt.file_name}
                          className="max-h-48 mx-auto object-contain rounded"
                        />
                        <p className="text-[10px] text-slate-600 mt-1 truncate font-medium">{nfc(imgAtt.file_name)}</p>
                      </div>
                    ))}
                  {allAttachments.filter(a => /\.(jpg|jpeg|png|webp|gif)$/i.test(a.file_url || a.file_name || '')).length === 0 && (
                    <div className="col-span-2 p-6 border border-dashed border-slate-300 rounded text-center text-slate-400 italic text-xs">
                      {nfc('Đã đính kèm đầy đủ bản cứng Hóa đơn GTGT & Chứng từ đối soát gốc')}
                    </div>
                  )}
                </div>
              </div>

              {/* 2 Chữ Ký Trang 2 */}
              <div className="mt-8 pt-4">
                <div className="grid grid-cols-2 gap-12 text-center text-xs">
                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('NGƯỜI LẬP HỒ SƠ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2"></div>
                    <p className="font-mono text-slate-400 text-[12px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[120px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('KẾ TOÁN KIỂM TRA CHỨNG TỪ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2"></div>
                    <p className="font-mono text-slate-400 text-[12px]">.........................</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRANG 3: MẪU 02 - GIẤY ĐỀ NGHỊ THANH TOÁN (02/ĐNTT-VA) */}
          {/* ========================================================================= */}
          {showPage3 && (
            <div
              className="p-8 sm:p-10 pt-6 sm:pt-8 print:p-6 print:pt-4 bg-white"
              style={{
                minHeight: '297mm'
              }}
            >
              {/* Header Trên cùng */}
              <div className="flex justify-between items-start pt-2 pb-1">
                <div>
                  <p className="font-bold text-sm tracking-tight text-slate-950">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                </div>
                <div className="text-right italic text-xs text-slate-800">
                  <p>{nfc('Mẫu số: 02/ĐNTT-VA')}</p>
                  <p>{nfc(`Số phiếu: ${effectivePayment ? effectivePayment.code : mainReq.code}`)}</p>
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
                    <span className="font-semibold">{nfc(effectivePayment?.creator_name || mainReq.creator_name || mainReq.creator_username)}</span>
                  </p>
                  <p className="w-1/2">
                    <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                    <span className="font-semibold">{nfc(effectivePayment?.department || mainReq.department)}</span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Nội dung thanh toán: ')}</span>
                  <span className="font-medium italic">{nfc(effectivePayment?.payment_content || mainReq.payment_content || mainReq.purpose)}</span>
                </div>

                <div className="flex items-center space-x-12">
                  <p>
                    <span>{nfc('Số tiền đề nghị (bằng số): ')}</span>
                    <span className="font-bold font-mono text-sm text-slate-950 ml-2">
                      {formatMoney(effectivePayment?.total_amount || mainReq.total_amount || mainReq.total_estimated_amount)} Đồng
                    </span>
                  </p>
                </div>

                <div>
                  <span>{nfc('Số tiền viết bằng chữ: ')}</span>
                  <span className="font-semibold italic text-slate-800 ml-2">
                    {nfc(effectivePayment?.amount_in_words || numberToVietnameseWords(effectivePayment?.total_amount || mainReq.total_amount || mainReq.total_estimated_amount))}
                  </span>
                </div>

                <div className="flex items-center space-x-6">
                  <span>{nfc('Hình thức thanh toán:')}</span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{(effectivePayment?.payment_method || mainReq.payment_method) === 'TIEN_MAT' ? ' ✔ ' : '   '}]</span>
                    <span>{nfc('Tiền mặt')}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="font-mono font-bold">[{(effectivePayment?.payment_method || mainReq.payment_method) !== 'TIEN_MAT' ? ' ✔ ' : '   '}]</span>
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
                    <span className="font-bold uppercase text-slate-900 ml-1">{nfc(effectivePayment?.bank_account_holder || mainReq.bank_account_holder || '---')}</span>
                  </p>
                  <div className="flex justify-between">
                    <p className="w-1/2">
                      <span className="text-slate-700">{nfc('Số tài khoản: ')}</span>
                      <span className="font-mono font-bold text-slate-950 text-sm ml-1">{effectivePayment?.bank_account_number || mainReq.bank_account_number || '---'}</span>
                    </p>
                    <p className="w-1/2">
                      <span className="text-slate-700">{nfc('Ngân hàng: ')}</span>
                      <span className="font-semibold text-slate-900 ml-1">{nfc(effectivePayment?.bank_name || mainReq.bank_name || '---')}</span>
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
                      {mainReq.acc_comment || mainReq.hod_comment ? nfc(mainReq.acc_comment || mainReq.hod_comment) : nfc('Đã nghiệm thu và kiểm tra đầy đủ chứng từ gốc hợp lệ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Chữ Ký Chuẩn Dùng Chung */}
              <div className="mt-8 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2"></div>
                    <p className="font-mono text-slate-400 text-[12px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[12px]">{nfc('KẾ TOÁN TRƯỞNG')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                    </div>
                    <div className="my-auto py-2">
                      {effectivePayment?.acc_approved_by || mainReq.acc_approved_by ? (
                        <div className="inline-block p-1.5 bg-emerald-50 border border-emerald-400 rounded text-emerald-800 text-[10px]">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{nfc('ĐÃ KIỂM TRA')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(effectivePayment?.acc_approved_at || mainReq.acc_approved_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chưa ký)')}</span>
                      )}
                    </div>
                    <p className="font-mono text-slate-400 text-[12px]">.........................</p>
                  </div>

                  <div className="flex flex-col justify-between min-h-[130px]">
                    <div>
                      <p className="font-bold uppercase text-[12px] text-brand-900">{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[10px] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                    </div>
                    <div className="my-auto py-2">
                      {effectivePayment?.bod_approved_by || mainReq.bod_approved_by || mainReq.status === 'PAID' ? (
                        <div className="inline-block p-1.5 bg-brand-50 border border-brand-400 rounded text-brand-900 text-[10px] shadow-xs">
                          <div className="flex items-center justify-center space-x-1 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                            <span>{nfc('ĐÃ PHÊ DUYỆT CHI')}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-0.5">{formatDateTime(effectivePayment?.bod_approved_at || mainReq.bod_approved_at || mainReq.updated_at)}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">{nfc('(Chờ phê duyệt)')}</span>
                      )}
                    </div>
                    <p className="font-mono text-slate-400 text-[12px]">.........................</p>
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
