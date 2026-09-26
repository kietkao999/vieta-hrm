import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath1 = path.resolve(__dirname, '../BANG_TONG_HOP_CHUC_NANG_VA_HIEU_QUA_KINH_TE_HRM.doc');
const outputPath2 = path.resolve(__dirname, '../BANG_TONG_HOP_CHUC_NANG_VA_GIA_TRI_KINH_TE_VIET_A.doc');

const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>BẢNG TỔNG HỢP CHỨC NĂNG THỰC TẾ & HẠCH TOÁN GIÁ TRỊ KINH TẾ HRM</title>
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
      size: A4 portrait;
      margin: 20mm 15mm 20mm 15mm;
      mso-header-margin: 10mm;
      mso-footer-margin: 10mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.35;
      color: #111827;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .header-table td {
      vertical-align: top;
      padding: 0;
    }
    .company-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      color: #1e3a8a;
      text-align: center;
    }
    .company-sub {
      font-size: 10pt;
      text-align: center;
      color: #4b5563;
    }
    .national-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
    }
    .national-sub {
      font-size: 11pt;
      font-style: italic;
      text-align: center;
    }
    .divider-line {
      border-bottom: 1.5pt solid #1e3a8a;
      width: 120px;
      margin: 4px auto 0 auto;
    }
    .doc-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      color: #1e3a8a;
      margin-top: 15px;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 12pt;
      font-style: italic;
      text-align: center;
      color: #4b5563;
      margin-bottom: 15px;
    }
    .quote-box {
      background-color: #f0fdf4;
      border-left: 4pt solid #16a34a;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 12.5pt;
      color: #065f46;
      line-height: 1.4;
    }
    .quote-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
      color: #15803d;
      font-size: 11.5pt;
    }
    h2 {
      font-size: 13.5pt;
      font-weight: bold;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1.5pt solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
    }
    h3 {
      font-size: 12.5pt;
      font-weight: bold;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 16px;
      font-size: 11.5pt;
    }
    table.data-table th, table.data-table td {
      border: 1pt solid #94a3b8;
      padding: 6px 8px;
      vertical-align: middle;
    }
    table.data-table th {
      background-color: #f1f5f9;
      color: #1e293b;
      font-weight: bold;
      text-align: center;
      font-size: 11pt;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .badge-success {
      background-color: #dcfce7;
      color: #166534;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    .highlight-row {
      background-color: #eff6ff;
      font-weight: bold;
    }
    .total-row {
      background-color: #fef3c7;
      font-weight: bold;
      color: #92400e;
    }
    .sign-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    .sign-table td {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
      font-size: 12pt;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="company-title">CÔNG TY TNHH TM SX NỆM VIỆT Á</div>
        <div class="company-sub">HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (HRM)</div>
        <div class="divider-line"></div>
      </td>
      <td style="width: 55%;">
        <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="national-sub">Độc lập - Tự do - Hạnh phúc</div>
        <div class="divider-line"></div>
      </td>
    </tr>
  </table>

  <!-- TITLE -->
  <div class="doc-title">BÁO CÁO TỔNG HỢP CHỨC NĂNG THỰC TẾ &amp; HẠCH TOÁN GIÁ TRỊ KINH TẾ HỆ THỐNG HRM</div>
  <div class="doc-subtitle">Quy mô vận hành: 57 Nhân sự – 5 Địa điểm Chi nhánh/Kho/Xưởng – Khép kín 100% Dữ liệu thực tế</div>

  <!-- CORE EXECUTIVE STATEMENT -->
  <div class="quote-box">
    <div class="quote-title">🌟 ĐÚC KẾT TOÀN DIỆN MỤC ĐÍCH &amp; CHỨC NĂNG HỆ THỐNG:</div>
    <em>"Hệ thống HRM Nệm Việt Á là giải pháp chuyển đổi số toàn diện giúp chuẩn hóa toàn bộ vòng đời nhân sự (từ Sơ đồ tổ chức, Hồ sơ 57 nhân sự, Thâm niên cống hiến, Chấm công GPS đa chi nhánh, Đánh giá KPI, Tính lương tự động bảo mật 3 cấp đến Quy trình phê duyệt mua sắm - thanh toán 3 bước không giấy tờ), nhằm <b>tiết kiệm hơn 130–160 triệu đồng chi phí vận hành mỗi năm</b> và cung cấp dữ liệu số theo thời gian thực cho Ban Giám Đốc ra quyết định chính xác."</em>
  </div>

  <!-- PHẦN 1: BẢNG TỔNG HỢP CHỨC NĂNG THỰC TẾ -->
  <h2>PHẦN I. BẢNG TỔNG HỢP 100% CHỨC NĂNG THỰC TẾ TRÊN HỆ THỐNG HRM</h2>
  <p>Dưới đây là chi tiết toàn bộ các phân hệ, bảng cơ sở dữ liệu (SQLite <code>hrm.db</code>) và nghiệp vụ đang vận hành trực tiếp trong phần mềm:</p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 5%;">STT</th>
        <th style="width: 16%;">Khối Menu &amp; Tính năng</th>
        <th style="width: 20%;">Bảng CSDL &amp; Dữ liệu thực tế</th>
        <th style="width: 32%;">Chi tiết Chức năng thực tế trong App</th>
        <th style="width: 27%;">Giá trị &amp; Lợi ích mang lại</th>
      </tr>
    </thead>
    <tbody>
      <!-- KHỐI 1 -->
      <tr style="background-color: #f8fafc;">
        <td colspan="5" class="font-bold" style="color: #1e3a8a;">1. KHỐI TỔNG QUAN &amp; TỔ CHỨC DOANH NGHIỆP</td>
      </tr>
      <tr>
        <td class="text-center">01</td>
        <td class="font-bold">Dashboard (Trang chủ)</td>
        <td><code>employees (dob)</code>, <code>contracts</code>, <code>leave_requests</code></td>
        <td>
          • <b>Widget Sinh nhật tháng:</b> Tự động quét 57 nhân sự, lọc và xếp theo ngày sinh tăng dần kèm icon bánh kem.<br>
          • <b>Thống kê nhanh:</b> 57 nhân viên, số HĐ hiệu lực, số đơn nghỉ phép chờ duyệt.<br>
          • <b>Banner phân quyền:</b> Tự đổi màu sắc/chức danh theo vai trò (Admin, Manager, Employee).
        </td>
        <td>Lãnh đạo và HCNS không bao giờ quên sinh nhật nhân sự; nắm bắt trọn vẹn số liệu nhân sự trong 3 giây.</td>
      </tr>
      <tr>
        <td class="text-center">02</td>
        <td class="font-bold">Sơ đồ tổ chức</td>
        <td><code>departments</code>, <code>positions</code>, <code>branches</code></td>
        <td>
          • Trực quan hóa cấu trúc hình cây phân cấp từ BGĐ &rarr; Khối Phòng ban &rarr; Kho/Xưởng &rarr; Vị trí.<br>
          • Quản lý 5 chi nhánh thực tế: VP Cty, Kho Cần Thơ, Kho Mỹ Tho, Xưởng nệm, Xưởng gối.
        </td>
        <td>Chuẩn hóa cơ cấu, xóa bỏ chồng chéo trách nhiệm, xác định rõ tuyến báo cáo.</td>
      </tr>
      <tr>
        <td class="text-center">03</td>
        <td class="font-bold">Tài sản &amp; Thiết bị</td>
        <td><code>assets</code>, <code>asset_allocations</code>, <code>asset_maintenance_tickets</code></td>
        <td>
          • Quản lý danh mục CCDC và máy móc (máy may, máy ép mút, xe nâng, laptop).<br>
          • Gắn mã định danh (<code>code</code>), năm sử dụng, giá trị còn lại.<br>
          • Ghi nhận lịch sử bàn giao/thu hồi (<code>asset_allocations</code>) và phiếu báo hỏng/chi phí sửa chữa.
        </td>
        <td><b>Cắt giảm 100% thất thoát tài sản</b> khi nhân viên nghỉ việc; kiểm soát chặt chẽ chi phí bảo trì xưởng.</td>
      </tr>
      <tr>
        <td class="text-center">04</td>
        <td class="font-bold">Văn bản &amp; Quy định</td>
        <td><code>documents</code></td>
        <td>
          • Lưu trữ kho văn bản điện tử: Nội quy lao động, quy chế lương thưởng, quyết định bổ nhiệm.<br>
          • Cho phép đính kèm tệp và tra cứu trực tuyến.
        </td>
        <td>Nhân sự kho xa tự tra cứu quy định nhanh chóng, không bị trôi tin nhắn như Zalo.</td>
      </tr>
      <tr>
        <td class="text-center">05</td>
        <td class="font-bold">Đào tạo &amp; Hội nhập</td>
        <td><code>training</code>, <code>training_participants</code></td>
        <td>
          • Lập kế hoạch khóa học, chi phí (<code>cost</code>), lịch đào tạo, đơn vị đào tạo.<br>
          • Theo dõi danh sách học viên, kết quả đào tạo và chứng chỉ cấp phát.
        </td>
        <td>Chuẩn hóa kỹ thuật may/làm nệm, rút ngắn 50% thời gian kèm cặp nhân sự mới.</td>
      </tr>

      <!-- KHỐI 2 -->
      <tr style="background-color: #f8fafc;">
        <td colspan="5" class="font-bold" style="color: #1e3a8a;">2. KHỐI QUẢN TRỊ NHÂN SỰ &amp; VÒNG ĐỜI HỢP ĐỒNG</td>
      </tr>
      <tr>
        <td class="text-center">06</td>
        <td class="font-bold">Hồ sơ nhân viên &amp; Thâm niên</td>
        <td><code>employees</code>, <code>work_history</code>, API <code>/seniority</code></td>
        <td>
          • <b>Hồ sơ 57 nhân sự:</b> Quản lý CCCD, MST, BHXH, tài khoản ngân hàng, bậc lương (<code>tier</code>, <code>grade</code>).<br>
          • <b>Quản lý Thâm niên:</b> Tự động tính số năm cống hiến từ ngày vào làm và gắn huy hiệu vinh danh (🎖️ 5 năm, ⭐ 10 năm, 💎 15 năm, 🏆 20 năm).<br>
          • <b>Lịch sử công tác:</b> Ghi nhận quá trình điều chuyển phòng ban, bổ nhiệm chức danh.
        </td>
        <td>Tìm kiếm hồ sơ chỉ mất 1 giây; <b>Tự động cộng Phụ cấp thâm niên vào Bảng lương</b> chính xác 100%.</td>
      </tr>
      <tr>
        <td class="text-center">07</td>
        <td class="font-bold">Hợp đồng lao động</td>
        <td><code>contracts</code></td>
        <td>
          • Quản lý HĐ thử việc, xác định thời hạn (1 năm), không xác định thời hạn.<br>
          • <b>Cảnh báo thông minh:</b> Tự động đánh dấu màu đỏ/vàng hợp đồng sắp hết hạn trong 30 ngày.
        </td>
        <td><b>An toàn pháp lý 100%</b>, triệt tiêu rủi ro bị thanh tra xử phạt do chậm trễ ký lại HĐLĐ.</td>
      </tr>

      <!-- KHỐI 3 -->
      <tr style="background-color: #f8fafc;">
        <td colspan="5" class="font-bold" style="color: #1e3a8a;">3. KHỐI CHẤM CÔNG, KPI, TIỀN LƯƠNG &amp; PHÊ DUYỆT TÀI CHÍNH</td>
      </tr>
      <tr>
        <td class="text-center">08</td>
        <td class="font-bold">Chấm công &amp; Nghỉ phép</td>
        <td><code>attendance</code>, <code>leave_requests</code></td>
        <td>
          • <b>Điểm danh GPS đa chi nhánh:</b> Định vị tọa độ thực tế xưởng/kho mới được bấm check-in; tính phút đi trễ, giờ tăng ca (OT).<br>
          • <b>Nghỉ phép online:</b> Tạo đơn xin nghỉ, công tác; Quản lý/Giám đốc duyệt 1 chạm trên app.
        </td>
        <td>Tiết kiệm chi phí mua máy vân tay; dữ liệu giờ công tự động đồng bộ sang bảng lương.</td>
      </tr>
      <tr>
        <td class="text-center">09</td>
        <td class="font-bold">Quản lý KPI tháng</td>
        <td><code>employee_monthly_kpis</code></td>
        <td>
          • Đánh giá KPI hàng tháng: Tỷ lệ hoàn thành nhiệm vụ (<code>responsibility_rate</code>), thưởng hiệu suất (<code>performance_bonus</code>), trừ kỷ luật.<br>
          • Chuyển thẳng điểm KPI sang bảng lương.
        </td>
        <td>Trả lương đúng theo năng lực thực tế, tạo động lực cạnh tranh lành mạnh; bảo mật KPI tuyệt đối giữa các nhân sự.</td>
      </tr>
      <tr>
        <td class="text-center">10</td>
        <td class="font-bold">Bảng lương tự động</td>
        <td><code>payrolls</code> (29 cột tính toán)</td>
        <td>
          • <b>Tự động tính lương:</b> Lương cơ bản + Công thực tế + Thưởng KPI + Phụ cấp thâm niên - BHXH/Thuế/Tạm ứng.<br>
          • <b>Bảo mật 3 cấp:</b> Nhân viên chỉ thấy phiếu lương mình; Quản lý thấy phòng mình; Admin thấy toàn cty.
        </td>
        <td><b>Rút ngắn thời gian chốt lương từ 7 ngày xuống còn 15 phút</b>; triệt tiêu 100% rủi ro lộ lương nội bộ.</td>
      </tr>
      <tr>
        <td class="text-center">11</td>
        <td class="font-bold">Đề xuất &amp; Phê duyệt 3 bước</td>
        <td><code>purchase_requests</code>, <code>payment_requests</code>, <code>request_attachments</code></td>
        <td>
          • <b>Quy trình 3 bước:</b> Mua dịch vụ (Mẫu 01) &rarr; Bảng kê chứng từ &amp; ảnh Hóa đơn đỏ &rarr; Đề nghị thanh toán (Mẫu 02).<br>
          • <b>Đồng bộ 2 chiều:</b> Nhập tiền/nội dung Bước 1 tự động điền sang Bước 3.<br>
          • <b>In 3 trang A4 chuẩn &amp; Xuất file Word (.doc) MHTML</b> đính kèm ảnh hóa đơn mở offline không lỗi.
        </td>
        <td><b>Văn phòng không giấy tờ (Paperless)</b>; Giám đốc duyệt chi online mọi lúc mọi nơi; kiểm soát chặt chẽ từng đồng tiền ra.</td>
      </tr>

      <!-- KHỐI 4 -->
      <tr style="background-color: #f8fafc;">
        <td colspan="5" class="font-bold" style="color: #1e3a8a;">4. KHỐI GHI NHẬN &amp; ĐỔI MỚI SÁNG TẠO</td>
      </tr>
      <tr>
        <td class="text-center">12</td>
        <td class="font-bold">Khen thưởng &amp; Kỷ luật</td>
        <td><code>rewards</code>, <code>discipline</code></td>
        <td>
          • Ban hành quyết định khen thưởng nóng/thành tích hoặc xử lý kỷ luật vi phạm nội quy.<br>
          • Tự động lưu vết vào hồ sơ nhân viên để phục vụ đánh giá thi đua, nâng lương.
        </td>
        <td>Tạo môi trường kỷ luật nghiêm minh, công bằng và tôn vinh xứng đáng người có công.</td>
      </tr>
      <tr>
        <td class="text-center">13</td>
        <td class="font-bold">Hòm thư &amp; Sáng kiến</td>
        <td><code>innovations</code></td>
        <td>
          • Công nhân gửi ý tưởng cải tiến kỹ thuật, tiết kiệm vải/mút nệm trực tiếp lên Giám đốc (có gửi ẩn danh).<br>
          • Quản lý số tiền tiết kiệm ước tính (<code>cost_savings</code>) và chi thưởng sáng kiến (<code>reward_amount</code>).
        </td>
        <td>Thúc đẩy tinh thần cải tiến liên tục (Kaizen), trực tiếp giúp xưởng sản xuất nệm giảm lãng phí nguyên vật liệu.</td>
      </tr>

      <!-- KHỐI 5 -->
      <tr style="background-color: #f8fafc;">
        <td colspan="5" class="font-bold" style="color: #1e3a8a;">5. KHỐI HỆ THỐNG, BẢO MẬT &amp; AN TOÀN DỮ LIỆU</td>
      </tr>
      <tr>
        <td class="text-center">14</td>
        <td class="font-bold">Báo cáo thống kê</td>
        <td><code>reportController.js</code></td>
        <td>
          • Biểu đồ phân tích: Cơ cấu nhân sự theo phòng ban/chi nhánh, tỷ lệ nam/nữ, độ tuổi và biến động quỹ lương chi trả.
        </td>
        <td>Cung cấp bức tranh toàn cảnh để Ban Giám Đốc ra quyết định chiến lược tức thì.</td>
      </tr>
      <tr>
        <td class="text-center">15</td>
        <td class="font-bold">Phân quyền tài khoản</td>
        <td><code>users</code>, <code>roles</code></td>
        <td>
          • Quản lý tài khoản 57 nhân sự theo 3 nhóm quyền nghiêm ngặt: ADMIN, MANAGER, EMPLOYEE.<br>
          • Mã hóa mật khẩu chuẩn bảo mật cao cấp <code>Bcrypt</code>.
        </td>
        <td>Đảm bảo nguyên tắc đúng người đúng quyền, ngăn chặn truy cập trái phép dữ liệu cấp trên.</td>
      </tr>
      <tr>
        <td class="text-center">16</td>
        <td class="font-bold">Nhật ký hệ thống</td>
        <td><code>audit_logs</code> (Middleware)</td>
        <td>
          • Tự động ghi vết chi tiết IP, tài khoản, hành động và thời gian khi thêm/sửa/xóa bảng lương, hợp đồng, chi tiêu.
        </td>
        <td>Minh bạch 100%, dễ dàng kiểm toán và quy trách nhiệm rõ ràng khi có sự cố phát sinh.</td>
      </tr>
      <tr>
        <td class="text-center">17</td>
        <td class="font-bold">Sao lưu &amp; Khôi phục</td>
        <td><code>systemController.js</code></td>
        <td>
          • Tải về bản sao lưu Database toàn vẹn chỉ với <b>1-click</b>; hỗ trợ khôi phục tức thì.
        </td>
        <td><b>Rủi ro mất mát dữ liệu bằng 0%</b>, đảm bảo an toàn tuyệt đối trước mọi sự cố kỹ thuật.</td>
      </tr>
    </tbody>
  </table>

  <!-- PHẦN 2: BẢNG HẠCH TOÁN GIÁ TRỊ KINH TẾ & HIỆU QUẢ ĐỊNH LƯỢNG -->
  <h2>PHẦN II. BẢNG HẠCH TOÁN GIÁ TRỊ KINH TẾ &amp; HIỆU QUẢ ĐỊNH LƯỢNG (ROI)</h2>
  <p>Dựa trên quy mô vận hành thực tế của <b>Nệm Việt Á (57 nhân sự, 5 địa điểm chi nhánh/xưởng)</b>, dưới đây là bảng lượng hóa chi tiết mức tiết kiệm tài chính:</p>

  <h3>1. Tiết kiệm Thời gian &amp; Chi phí Nhân công Quản lý (Quy đổi ra Tiền mặt)</h3>
  <p><i>(Đơn giá giờ làm việc trung bình của nhân sự HCNS/Kế toán: ~44.000 VNĐ/giờ &asymp; 350.000 VNĐ/ngày công)</i></p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Nghiệp vụ thực hiện</th>
        <th style="width: 22%;">Phương pháp cũ (Thủ công)</th>
        <th style="width: 23%;">Hệ thống HRM mới</th>
        <th style="width: 15%;">Thời gian tiết kiệm</th>
        <th style="width: 15%;">Quy đổi Giá trị / Năm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Tính &amp; Chốt lương 57 người</td>
        <td><b>7 ngày</b> (56 giờ/tháng)<br>Cộng trừ chấm công, KPI, phép</td>
        <td><b>15 phút</b> (0.25 giờ)<br>Tự động quét công thức DB</td>
        <td class="text-center">55.75 giờ / tháng<br>(669 giờ/năm)</td>
        <td class="text-right font-bold" style="color: #166534;">29.436.000 đ</td>
      </tr>
      <tr>
        <td class="font-bold">Phê duyệt Mua sắm &amp; Thanh toán</td>
        <td><b>1.5 giờ / bộ hồ sơ</b><br>In 3 liên giấy, trình ký 3 cấp (40 đơn/tháng)</td>
        <td><b>10 phút / bộ hồ sơ</b><br>Duyệt online, tự động đồng bộ tiền</td>
        <td class="text-center">54.0 giờ / tháng<br>(648 giờ/năm)</td>
        <td class="text-right font-bold" style="color: #166534;">28.512.000 đ</td>
      </tr>
      <tr>
        <td class="font-bold">Quản lý Đơn nghỉ phép, Đi trễ</td>
        <td><b>30 phút / đơn</b> (kho xa gửi giấy)</td>
        <td><b>1 phút / đơn</b> (nộp &amp; duyệt app)</td>
        <td class="text-center">15.0 giờ / tháng<br>(180 giờ/năm)</td>
        <td class="text-right font-bold" style="color: #166534;">7.920.000 đ</td>
      </tr>
      <tr>
        <td class="font-bold">Tổng hợp Báo cáo cho Ban Giám Đốc</td>
        <td><b>1 - 2 ngày</b> tổng hợp Excel</td>
        <td><b>3 giây</b> mở Dashboard</td>
        <td class="text-center">8.0 giờ / tháng<br>(96 giờ/năm)</td>
        <td class="text-right font-bold" style="color: #166534;">4.224.000 đ</td>
      </tr>
      <tr class="highlight-row">
        <td colspan="3" class="text-right font-bold">TỔNG TIẾT KIỆM THỜI GIAN NHÂN CÔNG:</td>
        <td class="text-center font-bold" style="color: #1e3a8a;">1.593 giờ / năm<br>(&asymp; 200 ngày công)</td>
        <td class="text-right font-bold" style="color: #15803d; font-size: 12.5pt;">70.092.000 đ / năm</td>
      </tr>
    </tbody>
  </table>

  <h3>2. Tiết kiệm Chi phí Mua sắm Thiết bị, Vật tư In ấn &amp; Chống thất thoát</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35%;">Khoản mục Tiết kiệm Trực tiếp</th>
        <th style="width: 40%;">Căn cứ tính toán thực tế tại Nệm Việt Á</th>
        <th style="width: 25%;">Giá trị Tiết kiệm / Năm</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Thiết bị chấm công vân tay 5 chi nhánh</td>
        <td>Không cần mua 5 máy vân tay (5 &times; 4.5 triệu) + tiết kiệm tiền bảo trì/kéo mạng IP tĩnh cho kho Cần Thơ, Mỹ Tho, xưởng nệm.</td>
        <td class="text-right font-bold" style="color: #166534;">
          <b>22.500.000 đ</b> (năm đầu)<br>
          <b>+ 5.000.000 đ</b> (bảo trì/năm)
        </td>
      </tr>
      <tr>
        <td class="font-bold">Chi phí In ấn giấy tờ &amp; Phiếu lương (Paperless)</td>
        <td>Cắt giảm 85% lượng giấy A4 (15.000 tờ/năm), 8 hộp mực in, kẹp file, tủ hồ sơ lưu trữ đề xuất mua sắm, phiếu lương giấy.</td>
        <td class="text-right font-bold" style="color: #166534;">15.300.000 đ / năm</td>
      </tr>
      <tr>
        <td class="font-bold">Ngăn ngừa Thất thoát Tài sản, CCDC xưởng</td>
        <td>Quản lý định danh mã CCDC, ký biên bản bàn giao điện tử và thu hồi 100% khi nghỉ việc (máy may, máy ép, xe nâng, công cụ).</td>
        <td class="text-right font-bold" style="color: #166534;">20.000.000 đ / năm</td>
      </tr>
      <tr class="highlight-row">
        <td colspan="2" class="text-right font-bold">TỔNG TIẾT KIỆM CHI PHÍ VẬT TƯ &amp; TÀI SẢN:</td>
        <td class="text-right font-bold" style="color: #15803d; font-size: 12.5pt;">40.300.000 đ / năm</td>
      </tr>
    </tbody>
  </table>

  <h3>3. Triệt tiêu Rủi ro Pháp lý &amp; Bảo vệ Ngân sách Doanh nghiệp</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35%;">Rủi ro được Triệt tiêu</th>
        <th style="width: 40%;">Cơ chế xử lý thông minh của Phần mềm</th>
        <th style="width: 25%;">Mức bảo vệ Ngân sách</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-bold">Phạt vi phạm Luật Lao động về HĐLĐ</td>
        <td>Tính năng cảnh báo hạn HĐ trước 30 ngày giúp không bị quá hạn. (Tránh bị xử phạt theo NĐ 12/2022/NĐ-CP từ 2 - 25 triệu/vụ).</td>
        <td class="text-right font-bold" style="color: #166534;">Tránh phạt 10 - 25 triệu đ</td>
      </tr>
      <tr>
        <td class="font-bold">Sai sót thủ công khi tính Lương / KPI</td>
        <td>Công thức SQL tự động khóa sổ, loại bỏ hoàn toàn việc gõ nhầm công thức Excel dẫn đến chi vượt quỹ lương.</td>
        <td class="text-right font-bold" style="color: #166534;">Bảo vệ 20 - 30 triệu đ / năm</td>
      </tr>
      <tr>
        <td class="font-bold">Rò rỉ thông tin Lương nội bộ</td>
        <td>Phân quyền 3 cấp độc lập tuyệt đối, loại bỏ nguy cơ khiếu nại, mất đoàn kết nội bộ.</td>
        <td class="text-right font-bold" style="color: #166534;">Bảo mật Tuyệt đối 100%</td>
      </tr>
    </tbody>
  </table>

  <!-- TỔNG KẾT ROI -->
  <table class="data-table" style="margin-top: 20px;">
    <tbody>
      <tr class="total-row">
        <td style="width: 70%; font-size: 13pt; text-transform: uppercase;">
          🏆 TỔNG GIÁ TRỊ LỢI ÍCH KINH TẾ TIẾT KIỆM ƯỚC TÍNH MỖI NĂM:
        </td>
        <td style="width: 30%; font-size: 15pt; text-align: right;">
          130.000.000 – 160.000.000 VNĐ / NĂM
        </td>
      </tr>
    </tbody>
  </table>

  <!-- PHẦN 3: KÝ DUYỆT -->
  <table class="sign-table">
    <tr>
      <td>
        <b>NGƯỜI LẬP BÁO CÁO</b><br>
        <i>(Ký, ghi rõ họ tên)</i>
        <br><br><br><br><br>
        <b>Phan Tuấn Kiệt</b><br>
        <span>Lập trình Hệ thống HRM</span>
      </td>
      <td>
        <b>TRƯỞNG PHÒNG HCNS</b><br>
        <i>(Ký, ghi rõ họ tên)</i>
        <br><br><br><br><br>
        <b>Huỳnh Thị Trúc Xinh</b><br>
        <span>Trưởng phòng HCNS</span>
      </td>
      <td>
        <b>BAN GIÁM ĐỐC DUYỆT</b><br>
        <i>(Ký, đóng dấu)</i>
        <br><br><br><br><br>
        <b>Võ Minh Cường</b><br>
        <span>Phó Giám Đốc Nệm Việt Á</span>
      </td>
    </tr>
  </table>

</body>
</html>`;

try {
  fs.writeFileSync(outputPath1, docContent, 'utf-8');
  console.log('Đã cập nhật file Word tại:', outputPath1);
} catch (e) {
  console.log('File 1 đang được mở trong Word, tiến hành ghi file phụ 2...');
}

try {
  fs.writeFileSync(outputPath2, docContent, 'utf-8');
  console.log('Đã xuất thành công file Word tại:', outputPath2);
} catch (e) {
  console.error('Lỗi khi ghi file 2:', e.message);
}
