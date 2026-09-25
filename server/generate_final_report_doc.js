import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPathDoc = path.resolve(__dirname, '../BAO_CAO_HOAN_THIEN_HE_THONG_HRM_VIET_A.doc');

const reportHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo Cáo Tổng Kết Hoàn Thiện Hệ Thống HRM Nệm Việt Á</title>
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
    @page Section1 {
      size: 21.0cm 29.7cm;
      margin: 2.0cm 2.0cm 2.0cm 2.0cm;
      mso-header-margin: 1.0cm;
      mso-footer-margin: 1.0cm;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 11.5pt;
      line-height: 1.4;
      color: #000000;
    }
    h1 {
      font-size: 16pt;
      font-weight: bold;
      color: #174378;
      text-align: center;
      margin-top: 15pt;
      margin-bottom: 5pt;
      text-transform: uppercase;
    }
    h2 {
      font-size: 13pt;
      font-weight: bold;
      color: #174378;
      margin-top: 14pt;
      margin-bottom: 4pt;
      border-bottom: 1.5pt solid #174378;
      padding-bottom: 2pt;
      text-transform: uppercase;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      color: #0f172a;
      margin-top: 10pt;
      margin-bottom: 3pt;
    }
    p, li {
      text-align: justify;
      margin-bottom: 4pt;
    }
    table.header-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-bottom: 10pt;
    }
    table.header-table td {
      border: none;
      padding: 0;
      vertical-align: top;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #475569;
      padding: 4pt 6pt;
      font-size: 10.5pt;
    }
    table.data-table th {
      background-color: #174378;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
    }
    .highlight-box {
      background-color: #f1f5f9;
      border-left: 4pt solid #174378;
      padding: 6pt 10pt;
      margin: 8pt 0;
      font-style: italic;
    }
    .badge {
      display: inline-block;
      padding: 2pt 6pt;
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #10b981;
      font-size: 9.5pt;
      font-weight: bold;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Header Công Ty -->
    <table class="header-table">
      <tr>
        <td style="width: 55%; text-align: left;">
          <b>CÔNG TY TNHH TM SX VIỆT Á</b><br/>
          <span style="font-size: 10pt; color: #475569;">Trụ sở: Kim Sơn, Châu Thành, Đồng Tháp</span><br/>
          <span style="font-size: 10pt; color: #475569;">Hệ Thống Quản Trị Nhân Sự & Tiền Lương (HRM)</span>
        </td>
        <td style="width: 45%; text-align: right; font-style: italic;">
          <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
          <span>Độc lập – Tự do – Hạnh phúc</span><br/>
          <span style="font-size: 10pt;">Đồng Tháp, ngày 25 tháng 09 năm 2026</span>
        </td>
      </tr>
    </table>

    <h1>BÁO CÁO TỔNG KẾT & NGHIỆM THU<br/><span style="font-size: 14pt;">HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (HRM)</span></h1>
    
    <div style="text-align: center; font-style: italic; margin-bottom: 12pt;">
      <b>Kính gửi: BAN GIÁM ĐỐC – CÔNG TY TNHH TM SX VIỆT Á</b>
    </div>

    <div class="highlight-box">
      <b>Tình trạng triển khai:</b> ĐÃ HOÀN THIỆN 100% CÁC HẠNG MỤC TÍNH NĂNG VÀ BẢO MẬT &bull; SẴN SÀNG ĐƯA VÀO VẬN HÀNH CHÍNH THỨC TOÀN CÔNG TY.
    </div>

    <h2>I. TỔNG QUAN DỰ ÁN</h2>
    <p>Hệ thống Quản trị Nhân sự & Tiền lương Nệm Việt Á (HRM) được thiết kế và xây dựng riêng biệt, bám sát 100% theo quy chuẩn tổ chức thực tế của Nệm Việt Á với quy mô 57 cán bộ nhân viên, gồm 2 khối văn phòng, 2 xưởng sản xuất (Nệm, Gối) và 2 tổng kho (Cần Thơ, Mỹ Tho).</p>

    <h2>II. CHI TIẾT CÁC MÔ-ĐUN & TÍNH NĂNG ĐÃ HOÀN THIỆN</h2>

    <h3>1. Cơ chế Phân quyền 3 Cấp độ & Bảo mật Lương tuyệt đối (Security & RBAC)</h3>
    <ul>
      <li><b>Cấp 1 - ADMIN (Toàn quyền quản trị):</b> Ban Giám Đốc (Võ Minh Cường), Trưởng phòng HCNS (Huỳnh Thị Trúc Xinh), CNTT (Phan Tuấn Kiệt). Có toàn quyền quản trị hệ thống, xem bảng lương toàn công ty, duyệt KPI và quản trị tài khoản.</li>
      <li><b>Cấp 2 - MANAGER (Trưởng phòng / Quản lý kho, xưởng):</b> Quản lý nhân sự, chấm công, KPI trực thuộc bộ phận mình. <i>Xem được bảng lương các nhân sự trực thuộc phòng ban mình quản lý. Tuyệt đối không xem được lương Ban Giám Đốc và phòng ban khác.</i></li>
      <li><b>Cấp 3 - EMPLOYEE (Nhân viên):</b> Tra cứu hồ sơ cá nhân, phiếu lương bản thân, chấm công GPS/Wifi, gửi đơn từ & sáng kiến. <i>Bảo mật tuyệt đối: Ẩn 100% menu KPI, ẩn danh sách nhân viên công ty, ẩn 100% lương người khác.</i></li>
    </ul>

    <h3>2. Quản trị Hồ sơ Nhân sự & Sơ đồ Tổ chức</h3>
    <ul>
      <li>Chuẩn hóa cơ sở dữ liệu 57 nhân sự với đầy đủ thông tin: Mã nhân viên, chức vụ, bộ phận, chi nhánh, ngày vào làm, thâm niên công tác.</li>
      <li>Quản lý danh mục Phòng ban, Chức vụ và Chi nhánh/Kho bãi theo tọa độ GPS định vị.</li>
    </ul>

    <h3>3. Chấm công & Điểm danh Thông minh</h3>
    <ul>
      <li>Điểm danh Check-in / Check-out theo bán kính định vị GPS tại từng chi nhánh/kho/xưởng và mạng Wifi nội bộ.</li>
      <li>Tự động tổng hợp ngày công thực tế, đi trễ, về sớm, giờ tăng ca ngày thường và tăng ca chủ nhật/ngày lễ.</li>
      <li>Hệ thống gửi & phê duyệt đơn từ trực tuyến: Nghỉ phép, công tác, tăng ca, đi trễ/về sớm.</li>
    </ul>

    <h3>4. Quản trị Tiền Lương & Phiếu Lương Điện Tử (Payroll)</h3>
    <ul>
      <li>Tính toán tự động và chính xác 100% từ Database: Lương cơ bản, phụ cấp trách nhiệm, làm thêm giờ, thưởng KPI, trích đóng BHXH (8%), BHYT (1.5%), BHTN (1%), giảm trừ vi phạm.</li>
      <li>Hỗ trợ chốt lương tháng, xuất báo cáo Bảng lương Excel chi tiết.</li>
      <li>Phiếu lương điện tử cá nhân bảo mật, minh bạch từng khoản thu nhập.</li>
    </ul>

    <h3>5. Đánh giá KPI & Thưởng Hiệu quả Công việc</h3>
    <ul>
      <li>Thiết lập và giao chỉ tiêu KPI hàng tháng theo từng phòng ban và cá nhân.</li>
      <li>Tự động tính hệ số KPI (0.8 - 1.2) và kết chuyển tiền thưởng trách nhiệm/KPI trực tiếp vào bảng lương tháng.</li>
    </ul>

    <h3>6. Quy trình 3 Bước: Mua Dịch Vụ - Chứng Từ - Đề Nghị Thanh Toán</h3>
    <ul>
      <li><b>Phần 1: Giấy đề nghị mua dịch vụ (Mẫu 01/ĐN-DV):</b> Phê duyệt chủ trương và dự toán kinh phí trước khi thực hiện.</li>
      <li><b>Phần 2: Bảng tổng hợp hóa đơn & Chứng từ gốc:</b> Đính kèm Hóa đơn GTGT, biên bản nghiệm thu, ảnh thực tế rõ nét.</li>
      <li><b>Phần 3: Giấy đề nghị thanh toán (Mẫu 02/ĐNTT-VA):</b> Tự động kế thừa thông tin, tích hợp thông tin tài khoản thụ hưởng và số tiền bằng chữ tiếng Việt chuẩn xác.</li>
      <li><b>Đồng bộ dữ liệu 2 chiều:</b> Tự động điền chéo thông tin khi nhập, chuyển tab linh hoạt không mất dữ liệu.</li>
    </ul>

    <h3>7. Xuất Biểu Mẫu, Xem Trước & In Ấn Chuẩn A4</h3>
    <ul>
      <li><b>In trực tiếp (Ctrl + P):</b> Định dạng chuẩn xác từng biểu mẫu nằm trọn trên <b>đúng 1 trang A4 duy nhất</b>.</li>
      <li><b>In Combo trọn bộ 3 tờ:</b> Xuất hồ sơ thanh toán đúng <b>3 trang A4 liên tiếp</b>, không bị tràn trang.</li>
      <li><b>Xuất file Word (.doc MHTML):</b> Đóng gói nhúng dữ liệu ảnh nhị phân trực tiếp, <b>hiển thị 100% hình ảnh hóa đơn offline và trong chế độ Protected View</b> của Word.</li>
    </ul>

    <h3>8. Tiện ích Bổ trợ</h3>
    <ul>
      <li>Quản lý Hợp đồng lao động & cảnh báo hợp đồng sắp hết hạn.</li>
      <li>Quản lý Cấp phát & Thu hồi Tài sản, trang thiết bị làm việc.</li>
      <li>Theo dõi Khen thưởng, Kỷ luật & Cổng tiếp nhận Sáng kiến cải tiến.</li>
      <li>Nhật ký hệ thống (Audit Logs) & Sao lưu / Phục hồi dữ liệu SQLite định kỳ an toàn.</li>
    </ul>

    <h2>III. KẾT LUẬN & ĐỀ XUẤT BÀN GIAO</h2>
    <p>1. Hệ thống HRM Nệm Việt Á đã hoàn thành nghiệm thu toàn diện các chức năng quản trị, bảo mật và in ấn chứng từ.</p>
    <p>2. Kính trình Ban Giám Đốc xem xét phê duyệt đưa hệ thống vào áp dụng chính thức phục vụ công tác quản trị và tính lương định kỳ của Công ty.</p>

    <br/>
    <!-- Bảng Chữ Ký Nghiệm Thu -->
    <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 20pt; text-align: center;">
      <tr>
        <td style="width: 33%; vertical-align: top; border: none;">
          <b>NGƯỜI LẬP BÁO CÁO</b><br/>
          <i style="font-size: 9.5pt; color: #64748b;">(Ký & ghi rõ họ tên)</i><br/><br/><br/><br/>
          <b>Phan Tuấn Kiệt</b><br/>
          <span style="font-size: 9.5pt; color: #475569;">Phụ trách CNTT & Hệ thống</span>
        </td>
        <td style="width: 33%; vertical-align: top; border: none;">
          <b>TRƯỞNG PHÒNG HCNS</b><br/>
          <i style="font-size: 9.5pt; color: #64748b;">(Ký & ghi rõ họ tên)</i><br/><br/><br/><br/>
          <b>Huỳnh Thị Trúc Xinh</b><br/>
          <span style="font-size: 9.5pt; color: #475569;">Trưởng phòng Hành chính Nhân sự</span>
        </td>
        <td style="width: 34%; vertical-align: top; border: none;">
          <b>BAN GIÁM ĐỐC</b><br/>
          <i style="font-size: 9.5pt; color: #64748b;">(Ký tên & đóng dấu)</i><br/><br/><br/><br/>
          <b>Võ Minh Cường</b><br/>
          <span style="font-size: 9.5pt; color: #475569;">Phó Giám Đốc</span>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

fs.writeFileSync(outputPathDoc, '\ufeff' + reportHtml, 'utf-8');
console.log('✓ Đã xuất thành công file Báo cáo Word tại:', outputPathDoc);
