import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Layers, FileText, Receipt, DollarSign, FileDown } from 'lucide-react';
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

const getAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
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

  // =========================================================================
  // 1. IN TRỰC TIẾP QUA IFRAME CHUYÊN DỤNG (ĐẢM BẢO 100% ĐỊNH DẠNG TIMES NEW ROMAN & KHÔNG LỖI CỘT)
  // =========================================================================
  const handleDirectPrint = () => {
    const printableArea = document.getElementById('printable-workflow-area');
    if (!printableArea) {
      window.print();
      return;
    }

    // Xóa iframe cũ nếu có để tránh lưu cache hoặc trạng thái kích thước 0
    const oldIframe = document.getElementById('print-dedicated-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-dedicated-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-99999px';
    iframe.style.left = '-99999px';
    iframe.style.width = '800px';
    iframe.style.height = '1130px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${nfc(mainReq.code)} - Biểu Mẫu A4 Việt Á</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 0;
              line-height: 1.3;
            }
            .a4-page {
              page-break-after: always;
              break-after: page;
              min-height: 270mm;
              position: relative;
              box-sizing: border-box;
              width: 100%;
              margin: 0 auto;
            }
            .a4-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
            }
            .data-table th, .data-table td {
              border: 1px solid #333 !important;
              padding: 4px 6px !important;
              font-size: 10pt !important;
            }
            .data-table th {
              background-color: #174378 !important;
              color: #ffffff !important;
              font-weight: bold !important;
              text-align: center !important;
            }
            .layout-table {
              width: 100% !important;
              border-collapse: collapse !important;
              border: none !important;
              margin-bottom: 6px !important;
            }
            .layout-table td {
              border: none !important;
              padding: 2px 4px !important;
              vertical-align: top !important;
              text-align: left;
            }
            .sign-table {
              width: 100% !important;
              border-collapse: collapse !important;
              border: none !important;
              margin-top: 20px !important;
              table-layout: fixed !important;
            }
            .sign-table td {
              border: none !important;
              text-align: center !important;
              vertical-align: top !important;
              padding: 0 4px !important;
            }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: bold !important; }
            .italic { font-style: italic !important; }
            .uppercase { text-transform: uppercase !important; }
            .title-main {
              font-size: 16pt !important;
              font-weight: bold !important;
              text-transform: uppercase !important;
              color: #174378 !important;
              text-align: center !important;
              margin: 8px 0 2px 0 !important;
            }
            .section-box {
              border: 1px solid #333 !important;
              margin-bottom: 10px !important;
              width: 100% !important;
            }
            .section-header {
              background-color: #174378 !important;
              color: #fff !important;
              font-weight: bold !important;
              text-align: center !important;
              padding: 4px 6px !important;
              font-size: 10.5pt !important;
              text-transform: uppercase !important;
            }
            .section-body {
              padding: 6px 8px !important;
              text-align: left !important;
            }
            .stamp-box {
              display: inline-block !important;
              border: 1px solid #059669 !important;
              background-color: #ecfdf5 !important;
              color: #065f46 !important;
              padding: 2px 6px !important;
              border-radius: 4px !important;
              font-size: 8.5pt !important;
              font-weight: bold !important;
              margin: 4px 0 !important;
            }
            .stamp-box-bod {
              display: inline-block !important;
              border: 1px solid #1e40af !important;
              background-color: #eff6ff !important;
              color: #1e3a8a !important;
              padding: 2px 6px !important;
              border-radius: 4px !important;
              font-size: 8.5pt !important;
              font-weight: bold !important;
              margin: 4px 0 !important;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${printableArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 350);
  };

  // =========================================================================
  // 2. TẢI FILE WORD (.DOC) ĐỊNH DẠNG CHUẨN MICROSOFT WORD VĂN PHÒNG
  // =========================================================================
  const handleDownloadWord = () => {
    const printableArea = document.getElementById('printable-workflow-area');
    if (!printableArea) return;

    const fileName = `${mainReq.code}_${printMode}.doc`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${fileName}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 21cm 29.7cm;
              margin: 1.5cm 1.5cm 1.5cm 1.5cm;
              mso-page-orientation: portrait;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              color: #000000;
              line-height: 1.3;
            }
            .a4-page {
              page-break-after: always;
              mso-break-type: page-break;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .data-table th, .data-table td {
              border: 1px solid #333333;
              padding: 4pt 6pt;
              font-size: 10pt;
            }
            .data-table th {
              background-color: #174378;
              color: #ffffff;
              text-align: center;
              font-weight: bold;
            }
            .layout-table {
              width: 100%;
              border-collapse: collapse;
              border: none;
            }
            .layout-table td {
              border: none;
              padding: 2pt 4pt;
              vertical-align: top;
            }
            .sign-table {
              width: 100%;
              border-collapse: collapse;
              border: none;
              margin-top: 15pt;
            }
            .sign-table td {
              border: none;
              text-align: center;
              vertical-align: top;
              padding: 0 4pt;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .title-main {
              font-size: 15pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #174378;
              text-align: center;
              margin-top: 10pt;
              margin-bottom: 3pt;
            }
            .section-box {
              border: 1px solid #333333;
              margin-bottom: 10pt;
            }
            .section-header {
              background-color: #174378;
              color: #ffffff;
              font-weight: bold;
              text-align: center;
              padding: 3pt 6pt;
              font-size: 10pt;
              text-transform: uppercase;
            }
            .section-body {
              padding: 6pt;
            }
          </style>
        </head>
        <body>
          ${printableArea.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-start justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-2 sm:my-4">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 bg-slate-800 text-white sticky top-0 z-30 shadow-md gap-3">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm">Xem Trước, In & Tải File Word A4</h3>
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
            {/* Nút Tải Word */}
            <button
              onClick={handleDownloadWord}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              title="Tải biểu mẫu về máy tính dưới dạng file Word .doc để mở và chỉnh sửa"
            >
              <FileDown className="w-4 h-4" />
              <span>Tải File Word (.doc)</span>
            </button>

            {/* Nút In Trực Tiếp */}
            <button
              onClick={handleDirectPrint}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 p-2 bg-slate-100 border-b border-slate-200 gap-1.5 text-xs">
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
          id="printable-workflow-area"
          ref={printRef}
          className="bg-white text-slate-900"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '11pt',
            lineHeight: '1.3'
          }}
        >
          {/* ========================================================================= */}
          {/* TRANG 1: MẪU 01 - GIẤY ĐỀ NGHỊ MUA DỊCH VỤ (01/ĐN-DV) */}
          {/* ========================================================================= */}
          {showPage1 && (
            <div className="a4-page p-8 sm:p-10 pt-6 sm:pt-8 bg-white">
              {/* Header Trên cùng */}
              <table className="layout-table mb-2">
                <tbody>
                  <tr>
                    <td style={{ width: '60%' }}>
                      <p className="font-bold text-[11pt] tracking-tight">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                      <p className="text-[9.5pt] text-slate-700">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                    </td>
                    <td style={{ width: '40%', textAlign: 'right' }} className="italic text-[9.5pt]">
                      <p>{nfc('Mẫu số: 01/ĐN-DV')}</p>
                      <p>{nfc(`Số phiếu: ${effectivePurchase ? effectivePurchase.code : mainReq.code}`)}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-3">
                <div className="title-main">{nfc('GIẤY ĐỀ NGHỊ MUA DỊCH VỤ')}</div>
                <p className="italic text-[10pt] text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-[10pt] text-slate-800 mt-0.5">
                  {nfc(`Kính gửi: Ban Giám Đốc – ${effectivePurchase?.approver_department || mainReq.approver_department || mainReq.department || 'Phòng Kế toán'}`)}
                </p>
              </div>

              {/* Thông tin chung */}
              <table className="layout-table mb-2 text-[10.5pt]">
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Họ và tên người đề nghị: ')}</span>
                      <span className="font-bold">{nfc(effectivePurchase?.creator_name || mainReq.creator_name || mainReq.creator_username)}</span>
                    </td>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                      <span className="font-bold">{nfc(effectivePurchase?.department || mainReq.department)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Lý do đề nghị: ')}</span>
                      <span className="italic">{nfc(effectivePurchase?.purpose || mainReq.purpose || mainReq.payment_content)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Mức độ ưu tiên: ')}</span>
                      <span>[{mainReq.priority === 'KHANCAP' ? ' ✓ ' : '   '}] {nfc('Khẩn cấp')} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>[{mainReq.priority === 'BINHTHUONG' || !mainReq.priority ? ' ✓ ' : '   '}] {nfc('Bình thường')} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>[{mainReq.priority === 'DUPHONG' ? ' ✓ ' : '   '}] {nfc('Dự phòng')}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bảng chi tiết dịch vụ */}
              <div className="mb-2">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>{nfc('STT')}</th>
                      <th style={{ width: '28%', textAlign: 'left' }}>{nfc('Tên dịch vụ / Nội dung công việc')}</th>
                      <th style={{ width: '18%', textAlign: 'left' }}>{nfc('Đơn vị cung cấp (NCC)')}</th>
                      <th style={{ width: '13%' }}>{nfc('Thời gian thực hiện')}</th>
                      <th style={{ width: '16%', textAlign: 'right' }}>{nfc('Chi phí dự kiến (VNĐ)')}</th>
                      <th style={{ width: '12%', textAlign: 'left' }}>{nfc('Mục đích sử dụng')}</th>
                      <th style={{ width: '8%', textAlign: 'left' }}>{nfc('Ghi chú')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseTableRows.map((it, idx) => (
                      <tr key={idx} style={{ height: '22px' }}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="font-semibold text-left">{it ? nfc(it.service_name) : ''}</td>
                        <td className="text-left">{it ? nfc(it.supplier_name || '---') : ''}</td>
                        <td className="text-center">{it ? formatDate(it.due_date) : ''}</td>
                        <td className="text-right font-bold">
                          {it && it.amount ? formatMoney(it.amount) : ''}
                        </td>
                        <td className="text-left italic">{it ? nfc(effectivePurchase?.purpose || mainReq.purpose || '') : ''}</td>
                        <td className="text-left italic">{it ? nfc(it.note || '') : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan="4" className="text-left uppercase">
                        {nfc('TỔNG CHI PHÍ DỰ KIẾN')}
                      </td>
                      <td className="text-right font-bold" style={{ fontSize: '11pt', color: '#174378' }}>
                        {formatMoney(effectivePurchase?.total_estimated_amount || mainReq.total_estimated_amount || mainReq.total_amount)} đ
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Hồ sơ đính kèm & Ghi chú thêm */}
              <table className="layout-table mb-3 text-[10.5pt]">
                <tbody>
                  <tr>
                    <td style={{ width: '130px' }}>{nfc('Hồ sơ đính kèm:')}</td>
                    <td>
                      <span>[{hasBaoGia ? ' ✓ ' : '   '}] {nfc(`Có báo giá kèm theo (${allAttachments.length || '01'} bản)`)} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>[{!hasBaoGia ? ' ✓ ' : '   '}] {nfc('Chưa có báo giá')}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>{nfc('Ghi chú thêm:')}</td>
                    <td className="italic">
                      {mainReq.hod_comment ? nfc(mainReq.hod_comment) : nfc('Đã so sánh giá với các đơn vị cung cấp theo quy trình')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* 4 Chữ Ký Chuẩn Dùng Bảng Ngang (Hoàn Hảo Trên Cả Bản In & Word) */}
              <table className="sign-table">
                <tbody>
                  <tr>
                    <td style={{ width: '25%' }}>
                      <p className="font-bold uppercase text-[10pt]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ height: '48px' }}></div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '25%' }}>
                      <p className="font-bold uppercase text-[10pt]">
                        {nfc('TRƯỞNG BỘ PHẬN')}
                        {mainReq.approver_department && mainReq.approver_department !== mainReq.department && (
                          <span className="block text-[8pt] font-normal lowercase italic text-slate-600">({nfc(mainReq.approver_department)})</span>
                        )}
                      </p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {effectivePurchase?.hod_approved_by || mainReq.hod_approved_by ? (
                          <div className="stamp-box">
                            <div>✓ {nfc('ĐÃ DUYỆT')}</div>
                            <div style={{ fontSize: '7.5pt', fontWeight: 'normal' }}>{formatDateTime(effectivePurchase?.hod_approved_at || mainReq.hod_approved_at)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[9pt]">{nfc('(Chưa ký)')}</span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '25%' }}>
                      <p className="font-bold uppercase text-[10pt]">{nfc('BỘ PHẬN KẾ TOÁN')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {effectivePurchase?.acc_approved_by || mainReq.acc_approved_by ? (
                          <div className="stamp-box">
                            <div>✓ {nfc('ĐÃ DUYỆT')}</div>
                            <div style={{ fontSize: '7.5pt', fontWeight: 'normal' }}>{formatDateTime(effectivePurchase?.acc_approved_at || mainReq.acc_approved_at)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[9pt]">{nfc('(Chưa ký)')}</span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '25%' }}>
                      <p className="font-bold uppercase text-[10pt]" style={{ color: '#174378' }}>{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                      <div style={{ minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {effectivePurchase?.bod_approved_by || mainReq.bod_approved_by || mainReq.status === 'APPROVED' ? (
                          <div className="stamp-box-bod">
                            <div>★ {nfc('ĐÃ PHÊ DUYỆT')}</div>
                            <div style={{ fontSize: '7.5pt', fontWeight: 'normal' }}>{formatDateTime(effectivePurchase?.bod_approved_at || mainReq.bod_approved_at || mainReq.updated_at)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[9pt]">{nfc('(Chờ phê duyệt)')}</span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRANG 2: PHẦN 2 - BẢNG TỔNG HỢP HÓA ĐƠN & CHỨNG TỪ GỐC */}
          {/* ========================================================================= */}
          {showPage2 && (
            <div className="a4-page p-8 sm:p-10 pt-6 sm:pt-8 bg-white">
              {/* Header Trên cùng */}
              <table className="layout-table mb-2">
                <tbody>
                  <tr>
                    <td style={{ width: '60%' }}>
                      <p className="font-bold text-[11pt] tracking-tight">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                      <p className="text-[9.5pt] text-slate-700">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                    </td>
                    <td style={{ width: '40%', textAlign: 'right' }} className="italic text-[9.5pt]">
                      <p>{nfc('PHẦN 2 / QUY TRÌNH 3 BƯỚC')}</p>
                      <p>{nfc(`Hồ sơ số: ${mainReq.code}`)}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-3">
                <div className="title-main">{nfc('BẢNG TỔNG HỢP HÓA ĐƠN & CHỨNG TỪ GỐC')}</div>
                <p className="italic text-[10pt] text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-[10pt] font-semibold text-slate-800 mt-0.5">
                  {nfc('Kèm theo hồ sơ đề xuất & quyết toán chi phí công ty')}
                </p>
              </div>

              {/* Thông tin hồ sơ */}
              <table className="layout-table mb-3 text-[10.5pt]">
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Người lập hồ sơ: ')}</span>
                      <span className="font-bold">{nfc(mainReq.creator_name || mainReq.creator_username)}</span>
                    </td>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                      <span className="font-bold">{nfc(mainReq.department)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Nội dung công việc / Dịch vụ: ')}</span>
                      <span className="italic">{nfc(mainReq.purpose || mainReq.payment_content)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bảng kê danh sách chứng từ */}
              <div className="mb-3">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>{nfc('STT')}</th>
                      <th style={{ width: '32%', textAlign: 'left' }}>{nfc('Phân loại chứng từ')}</th>
                      <th style={{ width: '36%', textAlign: 'left' }}>{nfc('Tên file / Số hóa đơn chứng từ')}</th>
                      <th style={{ width: '13%' }}>{nfc('Dung lượng')}</th>
                      <th style={{ width: '13%' }}>{nfc('Ngày tải lên')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAttachments.length > 0 ? (
                      allAttachments.map((att, idx) => (
                        <tr key={idx} style={{ height: '22px' }}>
                          <td className="text-center">{idx + 1}</td>
                          <td className="font-semibold text-left">
                            {nfc(FILE_TYPE_MAP[att.file_type] || att.file_type)}
                          </td>
                          <td className="text-left">{nfc(att.file_name)}</td>
                          <td className="text-center">{att.file_size || '---'}</td>
                          <td className="text-center">{formatDate(att.uploaded_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center italic text-slate-500 py-3">
                          {nfc('Chứng từ gốc đính kèm bản cứng theo phiếu')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Khung hiển thị ảnh hóa đơn / chứng từ thực tế */}
              <div className="section-box">
                <div className="section-header">
                  {nfc('HÌNH ẢNH HÓA ĐƠN / NGHIỆM THU THỰC TẾ KÈM THEO')}
                </div>
                <div className="section-body">
                  <table className="layout-table">
                    <tbody>
                      <tr>
                        {allAttachments
                          .filter(a => /\.(jpg|jpeg|png|webp|gif)$/i.test(a.file_url || a.file_name || ''))
                          .slice(0, 2)
                          .map((imgAtt, idx) => (
                            <td key={idx} style={{ width: '50%', textAlign: 'center', padding: '6px' }}>
                              <div style={{ border: '1px solid #cbd5e1', padding: '4px', background: '#f8fafc', borderRadius: '4px' }}>
                                <img
                                  src={getAbsoluteUrl(imgAtt.file_url)}
                                  alt={imgAtt.file_name}
                                  style={{ maxHeight: '160px', margin: '0 auto', objectFit: 'contain' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <p className="text-[8.5pt] text-slate-700 mt-1 font-medium">{nfc(imgAtt.file_name)}</p>
                              </div>
                            </td>
                          ))}
                        {allAttachments.filter(a => /\.(jpg|jpeg|png|webp|gif)$/i.test(a.file_url || a.file_name || '')).length === 0 && (
                          <td colSpan="2" className="text-center italic text-slate-500 py-4">
                            {nfc('Đã đính kèm đầy đủ bản cứng Hóa đơn GTGT & Chứng từ đối soát gốc')}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2 Chữ Ký Trang 2 Dùng Bảng Ngang */}
              <table className="sign-table" style={{ marginTop: '25px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <p className="font-bold uppercase text-[10.5pt]">{nfc('NGƯỜI LẬP HỒ SƠ')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ height: '55px' }}></div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '50%' }}>
                      <p className="font-bold uppercase text-[10.5pt]">{nfc('KẾ TOÁN KIỂM TRA CHỨNG TỪ')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ height: '55px' }}></div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRANG 3: MẪU 02 - GIẤY ĐỀ NGHỊ THANH TOÁN (02/ĐNTT-VA) */}
          {/* ========================================================================= */}
          {showPage3 && (
            <div className="a4-page p-8 sm:p-10 pt-6 sm:pt-8 bg-white">
              {/* Header Trên cùng */}
              <table className="layout-table mb-2">
                <tbody>
                  <tr>
                    <td style={{ width: '60%' }}>
                      <p className="font-bold text-[11pt] tracking-tight">{nfc('CÔNG TY TNHH TM SX VIỆT Á')}</p>
                      <p className="text-[9.5pt] text-slate-700">{nfc('Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp')}</p>
                    </td>
                    <td style={{ width: '40%', textAlign: 'right' }} className="italic text-[9.5pt]">
                      <p>{nfc('Mẫu số: 02/ĐNTT-VA')}</p>
                      <p>{nfc(`Số phiếu: ${effectivePayment ? effectivePayment.code : mainReq.code}`)}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Tiêu đề Biểu Mẫu */}
              <div className="text-center my-3">
                <div className="title-main">{nfc('GIẤY ĐỀ NGHỊ THANH TOÁN')}</div>
                <p className="italic text-[10pt] text-slate-700 mt-1">
                  {nfc(`Đồng Tháp, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`)}
                </p>
                <p className="italic text-[10pt] font-semibold text-slate-800 mt-0.5">
                  {nfc('Kính gửi: BAN GIÁM ĐỐC – PHÒNG KẾ TOÁN')}
                </p>
              </div>

              {/* Thông tin người đề nghị & Nội dung */}
              <table className="layout-table mb-2 text-[10.5pt]">
                <tbody>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Họ và tên người đề nghị: ')}</span>
                      <span className="font-bold">{nfc(effectivePayment?.creator_name || mainReq.creator_name || mainReq.creator_username)}</span>
                    </td>
                    <td style={{ width: '50%' }}>
                      <span>{nfc('Bộ phận / Phòng ban: ')}</span>
                      <span className="font-bold">{nfc(effectivePayment?.department || mainReq.department)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Nội dung thanh toán: ')}</span>
                      <span className="italic">{nfc(effectivePayment?.payment_content || mainReq.payment_content || mainReq.purpose)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Số tiền đề nghị (bằng số): ')}</span>
                      <span className="font-bold text-[11.5pt]" style={{ color: '#174378' }}>
                        {formatMoney(effectivePayment?.total_amount || mainReq.total_amount || mainReq.total_estimated_amount)} Đồng
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Số tiền viết bằng chữ: ')}</span>
                      <span className="italic font-semibold">
                        {nfc(effectivePayment?.amount_in_words || numberToVietnameseWords(effectivePayment?.total_amount || mainReq.total_amount || mainReq.total_estimated_amount))}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <span>{nfc('Hình thức thanh toán: ')}</span>
                      <span>[{(effectivePayment?.payment_method || mainReq.payment_method) === 'TIEN_MAT' ? ' ✓ ' : '   '}] {nfc('Tiền mặt')} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>[{(effectivePayment?.payment_method || mainReq.payment_method) !== 'TIEN_MAT' ? ' ✓ ' : '   '}] {nfc('Chuyển khoản')}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* KHUNG 1: THÔNG TIN TÀI KHOẢN THỤ HƯỞNG */}
              <div className="section-box mb-2">
                <div className="section-header">
                  {nfc('THÔNG TIN TÀI KHOẢN THỤ HƯỞNG (NẾU CHUYỂN KHOẢN)')}
                </div>
                <div className="section-body text-[10.5pt]">
                  <table className="layout-table">
                    <tbody>
                      <tr>
                        <td colSpan="2">
                          <span>{nfc('Tên người/Đơn vị thụ hưởng: ')}</span>
                          <span className="font-bold uppercase">{nfc(effectivePayment?.bank_account_holder || mainReq.bank_account_holder || '---')}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '50%' }}>
                          <span>{nfc('Số tài khoản: ')}</span>
                          <span className="font-bold">{effectivePayment?.bank_account_number || mainReq.bank_account_number || '---'}</span>
                        </td>
                        <td style={{ width: '50%' }}>
                          <span>{nfc('Ngân hàng: ')}</span>
                          <span className="font-semibold">{nfc(effectivePayment?.bank_name || mainReq.bank_name || '---')}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KHUNG 2: CHỨNG TỪ GỐC ĐÍNH KÈM */}
              <div className="section-box mb-3">
                <div className="section-header">
                  {nfc('CHỨNG TỪ GỐC ĐÍNH KÈM')}
                </div>
                <div className="section-body text-[10.5pt]">
                  <table className="layout-table">
                    <tbody>
                      <tr>
                        <td style={{ width: '130px' }}>{nfc('Chứng từ kèm theo:')}</td>
                        <td>
                          <span>[{hasBaoGia ? ' ✓ ' : '   '}] {nfc('Báo giá / Đơn hàng')} &nbsp;&nbsp;</span>
                          <span>[{hasHoaDon ? ' ✓ ' : '   '}] {nfc('Hóa đơn / Phiếu thu')} &nbsp;&nbsp;</span>
                          <span>[{hasNghiemThu ? ' ✓ ' : '   '}] {nfc('Biên bản nghiệm thu')} &nbsp;&nbsp;</span>
                          <span>[{hasKhac ? ' ✓ ' : '   '}] {nfc('Khác')}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>{nfc('Ghi chú thêm:')}</td>
                        <td className="italic">
                          {mainReq.acc_comment || mainReq.hod_comment ? nfc(mainReq.acc_comment || mainReq.hod_comment) : nfc('Đã nghiệm thu và kiểm tra đầy đủ chứng từ gốc hợp lệ')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3 Chữ Ký Chuẩn Dùng Bảng Ngang (Hoàn Hảo Trên Cả Bản In & Word) */}
              <table className="sign-table">
                <tbody>
                  <tr>
                    <td style={{ width: '33.33%' }}>
                      <p className="font-bold uppercase text-[10.5pt]">{nfc('NGƯỜI ĐỀ NGHỊ')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ height: '50px' }}></div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '33.33%' }}>
                      <p className="font-bold uppercase text-[10.5pt]">{nfc('KẾ TOÁN TRƯỞNG')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký & ghi rõ họ tên)')}</p>
                      <div style={{ minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {effectivePayment?.acc_approved_by || mainReq.acc_approved_by ? (
                          <div className="stamp-box">
                            <div>✓ {nfc('ĐÃ KIỂM TRA')}</div>
                            <div style={{ fontSize: '7.5pt', fontWeight: 'normal' }}>{formatDateTime(effectivePayment?.acc_approved_at || mainReq.acc_approved_at)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[9pt]">{nfc('(Chưa ký)')}</span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>

                    <td style={{ width: '33.33%' }}>
                      <p className="font-bold uppercase text-[10.5pt]" style={{ color: '#174378' }}>{nfc('BAN GIÁM ĐỐC')}</p>
                      <p className="italic text-[9pt] text-slate-500">{nfc('(Ký tên & đóng dấu)')}</p>
                      <div style={{ minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {effectivePayment?.bod_approved_by || mainReq.bod_approved_by || mainReq.status === 'PAID' ? (
                          <div className="stamp-box-bod">
                            <div>★ {nfc('ĐÃ PHÊ DUYỆT CHI')}</div>
                            <div style={{ fontSize: '7.5pt', fontWeight: 'normal' }}>{formatDateTime(effectivePayment?.bod_approved_at || mainReq.bod_approved_at || mainReq.updated_at)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[9pt]">{nfc('(Chờ phê duyệt)')}</span>
                        )}
                      </div>
                      <p className="text-[10pt] text-slate-400 font-mono">.........................</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintWorkflowModal;
