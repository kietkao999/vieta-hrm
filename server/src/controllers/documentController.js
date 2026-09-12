import { query } from '../config/database.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nội dung chi tiết chuẩn mực cho 8 văn bản quy định & chính sách 2026
export const DEFAULT_DOCUMENTS = [
  {
    title: 'Nội Quy Công Ty 2026',
    category: 'Nội quy & Quy chế',
    file_name: 'NỘI QUY CÔNG TY TNHH TMSX VIỆT Á 2026 (NB).docx',
    file_url: '/uploads/documents/noi_quy_cong_ty_2026.docx',
    file_size: '2.4 MB',
    file_type: 'docx',
    effective_date: '2026-08-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 8/2026. Quy định chuẩn mực kỷ luật lao động, thời giờ làm việc, nghỉ ngơi, văn hóa doanh nghiệp và bảo vệ tài sản công ty.',
    status: 'Đang hiệu lực',
    created_by: 'Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)',
    content: `
# CÔNG TY TNHH TM SX VIỆT Á
**Số hiệu:** NQ-VA/2026/08  
**Ngày ban hành:** 01/08/2026  
**Người ký duyệt:** Võ Minh Cường (Phó Giám đốc) & Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)

---

## CHƯƠNG I: QUY ĐỊNH CHUNG
### Điều 1: Phạm vi và Đối tượng áp dụng
1. Bản nội quy này quy định về kỷ luật lao động, thời giờ làm việc, thời giờ nghỉ ngơi, trật tự nơi làm việc, an toàn vệ sinh lao động, bảo vệ tài sản và bí mật kinh doanh của Công ty TNHH TM SX Việt Á.
2. Áp dụng cho toàn thể cán bộ công nhân viên (CBNV) bao gồm: Khối Văn phòng, Khối Kinh doanh, Khối Sản xuất (Xưởng nệm, Xưởng gối) và Khối Kho vận (Kho Cần Thơ, Kho Mỹ Tho).

---

## CHƯƠNG II: THỜI GIỜ LÀM VIỆC VÀ NGHỈ NGƠI
### Điều 2: Thời giờ làm việc tiêu chuẩn
1. **Khối Văn phòng & Hành chính:**
   - Buổi sáng: Từ 08h00 đến 12h00
   - Buổi chiều: Từ 13h00 đến 17h00
   - Ngày làm việc: Từ Thứ 2 đến Thứ 7 hàng tuần (Chiều Thứ 7 nghỉ theo phân công).
2. **Khối Xưởng Sản xuất & Kho Vận:**
   - Ca 1: Từ 07h30 đến 11h30 và 12h30 đến 16h30.
   - Khi có nhu cầu tăng ca theo đơn hàng sản xuất, Quản lý xưởng sẽ thông báo trước ít nhất 04 giờ làm việc.

### Điều 3: Quản lý chấm công
1. CBNV bắt buộc phải quẹt vân tay / nhận diện khuôn mặt khi đến làm việc và khi ra về.
2. Đi trễ hoặc về sớm không có lý do chính đáng sẽ bị trừ điểm đánh giá KPI trách nhiệm theo quy định tháng.

---

## CHƯƠNG III: TRẬT TỰ & VĂN HÓA NƠI LÀM VIỆC
### Điều 4: Trang phục và Tác phong
1. Mặc đồng phục công ty đúng quy định vào các ngày làm việc trong tuần.
2. Đeo thẻ nhân viên trong suốt thời gian làm việc tại văn phòng, chi nhánh và nhà xưởng.
3. Giữ thái độ hòa nhã, tôn trọng đồng nghiệp và lịch sự, chuyên nghiệp với khách hàng, đối tác.

---

## CHƯƠNG IV: BẢO MẬT VÀ BẢO VỆ TÀI SẢN
### Điều 5: Bảo mật thông tin doanh nghiệp
1. Tuyệt đối không tiết lộ công thức sản xuất nệm, danh sách khách hàng, bảng giá đại lý và bảng lương nhân sự ra bên ngoài.
2. Mọi dữ liệu kinh doanh và công nghệ là tài sản độc quyền của Công ty TNHH TM SX Việt Á.

---

## CHƯƠNG V: KHEN THƯỞNG VÀ XỬ LÝ KỶ LUẬT
### Điều 6: Hình thức xử lý vi phạm
1. Khiển trách bằng văn bản đối với vi phạm lần đầu hoặc mức độ nhẹ.
2. Trừ điểm đánh giá KPI và thưởng hiệu quả tháng tương ứng.
3. Kéo dài thời hạn nâng bậc lương hoặc cách chức đối với vi phạm nghiêm trọng.
4. Xử lý chấm dứt HĐLĐ / Sa thải theo quy định của Bộ luật Lao động đối với hành vi trộm cắp, phá hoại tài sản hoặc tiết lộ bí mật công nghệ.
    `
  },
  {
    title: 'Phúc Lợi Công Ty 2026',
    category: 'Chính sách & Phúc lợi',
    file_name: 'CHÍNH SÁCH PHÚC LỢI 2026.docx',
    file_url: '/uploads/documents/chinh_sach_phuc_loi_2026.docx',
    file_size: '1.8 MB',
    file_type: 'docx',
    effective_date: '2026-09-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 9/2026. Quy chế chế độ hiếu hỷ, sinh nhật, du lịch nghỉ dưỡng thường niên, trợ cấp khó khăn đột xuất và thưởng các ngày Lễ, Tết.',
    status: 'Đang hiệu lực',
    created_by: 'Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)',
    content: `
# CÔNG TY TNHH TM SX VIỆT Á
**Số hiệu:** QĐ-PL/2026/09  
**Ngày ban hành:** 01/09/2026  
**Người ký duyệt:** Ban Giám đốc & Phòng HCNS

---

## MỤC ĐÍCH & Ý NGHĨA
Chính sách phúc lợi 2026 được xây dựng nhằm chăm lo đời sống vật chất và tinh thần cho toàn thể CBNV Công ty TNHH TM SX Việt Á, tạo động lực gắn bó lâu dài và nâng cao năng suất lao động.

---

## CÁC CHẾ ĐỘ PHÚC LỢI CỤ THỂ

### 1. Chế độ Sinh nhật CBNV:
- Tặng quà/tiền mặt trị giá **300.000 VNĐ** kèm thiệp chúc mừng từ Ban Giám đốc trong tháng sinh nhật.
- Tổ chức tiệc chúc mừng sinh nhật chung định kỳ hàng tháng tại từng chi nhánh/kho/xưởng.

### 2. Chế độ Hiếu - Hỷ & Thai sản:
- **Kết hôn:** Mừng **2.000.000 VNĐ/nhân sự** (nghỉ hưởng nguyên lương 03 ngày).
- **Sinh con (Thai sản):** Thăm hỏi **1.500.000 VNĐ/bé** (áp dụng cho cả lao động nam có vợ sinh con).
- **Ốm đau nằm viện:** Thăm hỏi từ **500.000 VNĐ - 1.500.000 VNĐ/lần**.
- **Tang chế:** Tứ thân phụ mẫu, vợ/chồng, con cái qua đời viếng **2.000.000 VNĐ - 3.000.000 VNĐ** kèm vòng hoa của công ty.

### 3. Thưởng các ngày Lễ, Tết trong năm:
- **Tết Dương Lịch (01/01):** Thưởng từ 500.000 VNĐ - 1.000.000 VNĐ/người.
- **Ngày 30/4 & 01/5:** Thưởng 500.000 VNĐ - 1.000.000 VNĐ/người.
- **Quốc khánh 02/09:** Thưởng 500.000 VNĐ - 1.000.000 VNĐ/người.
- **Tết Trung Thu:** Quà bánh trung thu cao cấp cho toàn thể CBNV có con nhỏ.
- **Thưởng Lương Tháng 13:** Căn cứ theo kết quả kinh doanh và đánh giá mức độ cống hiến trong năm.

### 4. Du lịch & Hoạt động tập thể thường niên:
- Công ty tổ chức chương trình Company Trip / Du lịch nghỉ dưỡng 1 năm/lần cho toàn thể nhân viên ký HĐLĐ chính thức.
    `
  },
  {
    title: 'Bộ Đào Tạo Hội Nhập',
    category: 'Đào tạo & Hướng dẫn',
    file_name: 'BỘ ĐÀO TẠO HỘI NHẬP CÔNG TY VIỆT Á.docx',
    file_url: '/uploads/documents/bo_dao_tao_hoi_nhap_viet_a.docx',
    file_size: '3.1 MB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Nhân sự mới gia nhập',
    description: 'Tài liệu hướng dẫn hội nhập cho nhân sự mới: Tổng quan công ty Nệm Việt Á, sơ đồ tổ chức, nội quy cơ bản, hệ thống trao đổi thông tin nội bộ.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `
# BỘ TÀI LIỆU ĐÀO TẠO HỘI NHẬP - NỆM VIỆT Á
**Đơn vị ban hành:** Phòng Hành chính Nhân sự  
**Áp dụng:** 100% Nhân sự mới tuyển dụng trong vòng 07 ngày đầu làm việc.

---

## PHẦN 1: GIỚI THIỆU DOANH NGHIỆP
1. **Tên công ty:** CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
2. **Lĩnh vực hoạt động:** Sản xuất và phân phối nệm cao cấp, gối, drap và phụ kiện phòng ngủ trên toàn quốc.
3. **Giá trị cốt lõi:** CHẤT LƯỢNG - UY TÍN - TẬN TÂM - ĐỔI MỚI.

---

## PHẦN 2: CƠ CẤU TỔ CHỨC & CHI NHÁNH
- **Khối Quản trị:** Ban Giám đốc, Phòng HCNS, Phòng Kế toán.
- **Khối Kinh doanh & Marketing:** Phòng Kinh doanh, Phòng R&D.
- **Khối Sản xuất:** Xưởng sản xuất nệm, Xưởng sản xuất gối.
- **Khối Chi nhánh & Kho vận:** Kho Cần Thơ, Kho Mỹ Tho và hệ thống giao hàng liên tỉnh.

---

## PHẦN 3: HƯỚNG DẪN SỬ DỤNG HỆ THỐNG HRM NỘI BỘ
1. **Đăng nhập hệ thống:** Truy cập cổng HRM tại \`https://hrmvieta.up.railway.app\`.
2. **Tài khoản:** Mã nhân viên (VD: \`VietA 001\`) và Mật khẩu mặc định được cấp lúc nhận việc.
3. **Các tính năng bắt buộc nắm rõ:**
   - Tra cứu và đối soát Bảng chấm công cá nhân.
   - Xem Phiếu lương & Đánh giá KPI hàng tháng.
   - Gửi đơn xin nghỉ phép, nghỉ ốm trực tuyến.
   - Tra cứu Danh bạ, Sơ đồ tổ chức và Quy định công ty.
    `
  },
  {
    title: 'Mẫu Đề Xuất Tuyển Dụng Nhân Sự',
    category: 'Biểu mẫu nhân sự',
    file_name: 'MẪU ĐỀ XUẤT TUYỂN DỤNG NHÂN SỰ.docx',
    file_url: '/uploads/documents/mau_de_xuat_tuyen_dung_nhan_su.docx',
    file_size: '512 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Trưởng phòng / Quản lý',
    description: 'Biểu mẫu đăng ký nhu cầu tuyển dụng bổ sung nhân sự định kỳ hoặc đột xuất dành cho Trưởng bộ phận, Quản lý kho và Xưởng sản xuất.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `
# CÔNG TY TNHH TM SX VIỆT Á
**MẪU SỐ:** BM-TD/01  
**TÊN BIỂU MẪU:** PHIẾU ĐỀ XUẤT BỔ SUNG NHÂN SỰ

---

### THÔNG TIN BỘ PHẬN ĐỀ XUẤT
- **Phòng ban / Bộ phận / Kho:** ................................................................
- **Người đề xuất:** ........................................... **Chức danh:** ........................
- **Ngày lập đề xuất:** ...... / ...... / 2026

---

### CHI TIẾT VỊ TRÍ CẦN TUYỂN DỤNG
1. **Chức danh công việc cần tuyển:** ................................................................
2. **Số lượng cần tuyển:** ............. người
3. **Lý do tuyển dụng:**
   - [ ] Bổ sung theo kế hoạch mở rộng sản xuất / kinh doanh
   - [ ] Thay thế nhân sự nghỉ việc (Ghi rõ mã NV nghỉ: ...................................)
   - [ ] Tuyển thời vụ / ngắn hạn
4. **Thời gian yêu cầu có nhân sự đi làm:** Ngày ...... / ...... / 2026

---

### TIÊU CHUẨN YÊU CẦU ỨNG VIÊN
- **Trình độ học vấn:** .........................................................................
- **Kinh nghiệm làm việc:** ....................................................................
- **Kỹ năng chuyên môn bắt buộc:** ........................................................
- **Mức lương đề xuất (Gross):** ............................................................. VNĐ

---

### Ý KIẾN PHÊ DUYỆT
- **Trưởng bộ phận đề xuất:** *(Ký và ghi rõ họ tên)*
- **Ý kiến Phòng HCNS:** *(Xác nhận định biên và nguồn lực tuyển dụng)*
- **Ban Giám đốc phê duyệt:** *(Đồng ý / Không đồng ý / Điều chỉnh)*
    `
  },
  {
    title: 'Thư Mời Nhận Việc (Offer Letter)',
    category: 'Biểu mẫu nhân sự',
    file_name: 'Thư Mời Nhận Việc.docx',
    file_url: '/uploads/documents/thu_moi_nhan_viec.docx',
    file_size: '420 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Phòng HCNS & Ứng viên',
    description: 'Mẫu thư mời nhận việc chuẩn hóa của Công ty TNHH TM SX Việt Á, quy định vị trí, mức lương, thời gian thử việc và chế độ đãi ngộ ban đầu.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `
# CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
**THƯ MỜI NHẬN VIỆC (JOB OFFER LETTER)**  
**Số:** TM-VA/2026/.....

---

**Kính gửi Anh/Chị:** ....................................................................................  
**Địa chỉ:** ....................................................................................................  
**Số điện thoại:** ....................................... **Email:** ......................................

Công ty TNHH TM SX Việt Á trân trọng thông báo Anh/Chị đã trúng tuyển và chính thức mời Anh/Chị gia nhập đội ngũ nhân sự của công ty với các điều khoản sau:

### 1. VỊ TRÍ CÔNG TÁC
- **Chức danh:** ........................................................................................
- **Phòng ban / Đơn vị:** ...........................................................................
- **Địa điểm làm việc:** ..............................................................................
- **Người quản lý trực tiếp:** ....................................................................

### 2. THỜI GIAN LÀM VIỆC & THỬ VIỆC
- **Ngày bắt đầu làm việc:** ...... / ...... / 2026
- **Thời gian thử việc:** 02 tháng (kể từ ngày bắt đầu).

### 3. CHẾ ĐỘ TIỀN LƯƠNG & PHÚC LỢI
- **Lương thử việc:** ......................................................... VNĐ/tháng (85% Lương chính thức).
- **Phụ cấp cơm trưa / điện thoại:** ................................ VNĐ/tháng.
- **Thưởng KPI & Hiệu quả:** Đánh giá và chi trả theo quy định hàng tháng.

### 4. HỒ SƠ CẦN CHUẨN BỊ KHI NHẬN VIỆC
1. Căn cước công dân (02 bản công chứng).
2. Sơ yếu lý lịch có xác nhận địa phương trong vòng 6 tháng.
3. Bằng cấp, chứng chỉ liên quan (công chứng).
4. Giấy khám sức khỏe từ cấp huyện trở lên.
5. 04 ảnh thẻ kích thước 3x4.
    `
  },
  {
    title: 'Quy Định An Toàn Lao Động',
    category: 'Nội quy & Quy chế',
    file_name: 'QUY ĐỊNH AN TOÀN LAO ĐỘNG.docx',
    file_url: '/uploads/documents/quy_dinh_an_toan_lao_dong.docx',
    file_size: '1.5 MB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Khối Xưởng & Kho bãi',
    description: 'Quy chuẩn an toàn vệ sinh lao động, phòng chống cháy nổ, trang bị bảo hộ lao động và quy trình vận hành máy móc an toàn tại kho xưởng.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Quản trị & Ban An toàn',
    content: `
# QUY ĐỊNH AN TOÀN LAO ĐỘNG & VỆ SINH MÔI TRƯỜNG
**Áp dụng:** Khối Xưởng sản xuất nệm, Xưởng gối, Kho vận Cần Thơ & Kho Mỹ Tho.

---

## 1. NGUYÊN TẮC AN TOÀN BẮT BUỘC
1. 100% Công nhân viên khi vào khu vực sản xuất phải mang đầy đủ trang thiết bị bảo hộ cá nhân (PPE): Khẩu trang chống bụi, găng tay thao tác, giày bảo hộ và kính chắn giọt keo.
2. Cấm tuyệt đối mang bật lửa, diêm, thuốc lá vào khu vực chứa mút xốp, cao su, bông ép và dung môi hóa chất.

---

## 2. QUY TRÌNH VẬN HÀNH MÁY MÓC
1. Chỉ những nhân sự đã qua đào tạo và được cấp phép mới được vận hành máy cắt mút, máy may một kim, máy may viền nệm và súng phun keo.
2. Kiểm tra tình trạng dây điện, nút dừng khẩn cấp (Emergency Stop) trước khi khởi động máy mỗi đầu ca.
3. Khi máy phát sinh tiếng kêu lạ hoặc kẹt vật liệu, phải tắt nguồn điện hoàn toàn trước khi xử lý.

---

## 3. PHÒNG CHÁY CHỮA CHÁY (PCCC)
1. Lối thoát hiểm, cửa thoát hiểm và các bình chữa cháy CO2/bột phải luôn thông thoáng, tuyệt đối không chất hàng hóa chắn lối.
2. Định kỳ hàng tháng Ban An toàn kiểm tra áp suất bình chữa cháy và hệ thống báo khói tự động.
    `
  },
  {
    title: 'Chính Sách Hỗ Trợ Chi Phí Nhân Viên Đi Hỗ Trợ',
    category: 'Chính sách & Phúc lợi',
    file_name: 'TB 73 HỖ TRỢ CHI PHÍ NV ĐI HỖ TRỢ.docx',
    file_url: '/uploads/documents/tb_73_ho_tro_chi_phi_nv_di_ho_tro.docx',
    file_size: '890 KB',
    file_type: 'docx',
    effective_date: '2026-06-01',
    applicable_to: 'Nhân viên đi công tác/hỗ trợ',
    description: 'Thông báo số 73 quy định về mức hỗ trợ công tác phí, phụ cấp ăn ở, phương tiện di chuyển đối với nhân sự điều động hỗ trợ các chi nhánh tỉnh.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc',
    content: `
# CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
**THÔNG BÁO SỐ:** 73/TB-VA/2026  
**V/v:** Quy định chế độ phụ cấp và hỗ trợ chi phí đối với nhân viên được điều động đi công tác, hỗ trợ kho & chi nhánh tỉnh.

---

### ĐIỀU 1: PHẠM VI ÁP DỤNG
Áp dụng cho toàn thể CBNV khi được Ban Giám đốc hoặc Trưởng phòng ban điều động hỗ trợ công tác ngắn hạn hoặc đột xuất tại các kho/chi nhánh (Kho Cần Thơ, Kho Mỹ Tho và các thị trường tỉnh).

---

### ĐIỀU 2: ĐỊNH MỨC CHI PHÍ HỖ TRỢ
1. **Phụ cấp lưu trú công tác ngày:**
   - Đi về trong ngày (cách trên 30km): **150.000 VNĐ/ngày**.
   - Lưu trú qua đêm tại địa phương hỗ trợ: **250.000 VNĐ/ngày**.
2. **Chi phí phương tiện di chuyển:**
   - Sử dụng xe khách/xe công ty: Thanh toán 100% tiền vé theo hóa đơn thực tế.
   - Tự túc di chuyển bằng xe máy cá nhân: Phụ cấp xăng xe **1.200 VNĐ/km**.
3. **Chi phí nhà nghỉ / Khách sạn:**
   - Hạn mức tối đa: **350.000 VNĐ - 500.000 VNĐ/phòng/đêm** (Thanh toán theo hóa đơn đỏ/hợp lệ).

---

### ĐIỀU 3: QUY TRÌNH THANH TOÁN
1. Nhân viên lập Giấy đề xuất đi công tác có chữ ký duyệt của Trưởng bộ phận.
2. Tạm ứng công tác phí tại Phòng Kế toán trước khi lên đường.
3. Quyết toán và hoàn ứng trong vòng 03 ngày làm việc sau khi kết thúc đợt hỗ trợ.
    `
  },
  {
    title: 'Thông Báo Điều Chỉnh Hệ Số Lương Tầng + Bậc',
    category: 'Lương & Đãi ngộ',
    file_name: 'THÔNG BÁO 18_ĐIỀU CHỈNH LƯƠNG CÁC BỘ PHẬN TRONG CÔNG TY.docx',
    file_url: '/uploads/documents/thong_bao_18_dieu_chinh_luong.docx',
    file_size: '1.2 MB',
    file_type: 'docx',
    effective_date: '2026-05-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Thông báo số 18 về việc điều chỉnh khung thang bảng lương, hệ số lương tầng, hệ số bậc lương áp dụng chính thức từ tháng 05/2026.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc',
    content: `
# CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
**THÔNG BÁO SỐ:** 18/TB-VA/2026  
**V/v:** Điều chỉnh khung thang bảng lương, hệ số lương tầng và bậc lương cho toàn bộ các bộ phận trong công ty.

---

### 1. NGUYÊN TẮC XÁC ĐỊNH LƯƠNG THEO TẦNG & BẬC
- **Lương Cố định** = Lương Tầng + Lương Bậc.
- **KPI Trách nhiệm** = Định mức theo Tầng x Tỷ lệ đạt (%) trong tháng.
- **Thưởng Hiệu quả** = Đánh giá theo sản lượng, doanh thu và hiệu suất công việc thực tế.

---

### 2. PHÂN TẦNG VÀ ĐỊNH MỨC KPI TRÁCH NHIỆM:
- **TẦNG 1 (Ban Lãnh đạo & Giám đốc):**
  - Mức thưởng trách nhiệm định mức: **2.500.000 VNĐ - 3.000.000 VNĐ**.
- **TẦNG 2 (Trưởng phòng, Quản lý xưởng, Quản lý kho):**
  - Mức thưởng trách nhiệm định mức: **2.000.000 VNĐ**.
- **TẦNG 3 (Phó quản lý, Kế toán xưởng, Chuyên viên kỹ thuật):**
  - Mức thưởng trách nhiệm định mức: **1.500.000 VNĐ**.
- **TẦNG 4 (Nhân viên may, cắt, phun keo, giao hàng, kho, tài xế):**
  - Mức thưởng trách nhiệm định mức: **1.000.000 VNĐ**.

---

### 3. HIỆU LỰC THI HÀNH
Thông báo này có hiệu lực kể từ kỳ tính lương tháng 05/2026. Phòng Kế toán và Phòng HCNS có trách nhiệm áp dụng đúng biểu mẫu này để tính toán bảng lương hàng tháng.
    `
  }
];

// Tạo các file tĩnh vật lý để khi người dùng nhấn Tải về sẽ có file tải về ngay lập tức
export const ensurePhysicalFiles = () => {
  try {
    const uploadDir = path.resolve(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const doc of DEFAULT_DOCUMENTS) {
      if (doc.file_url && doc.file_url.startsWith('/uploads/documents/')) {
        const filePath = path.resolve(__dirname, '../..' + doc.file_url);
        if (!fs.existsSync(filePath)) {
          // Tạo nội dung văn bản chuẩn
          const textContent = `================================================================================
CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
${doc.title.toUpperCase()}
Số hiệu / Tên file: ${doc.file_name}
Ngày áp dụng: ${doc.effective_date} | Đối tượng: ${doc.applicable_to}
Trạng thái: ${doc.status}
================================================================================

${doc.content.replace(/#/g, '').replace(/\*\*/g, '')}

================================================================================
BAN HÀNH BỞI: CÔNG TY TNHH TM SX VIỆT Á
Hệ thống Quản trị Nhân sự & Tiền lương (HRM Việt Á 2026)
================================================================================
`;
          fs.writeFileSync(filePath, textContent, 'utf-8');
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi tạo file vật lý cho tài liệu:', err);
  }
};

// Gọi tạo file ngay khi load module
ensurePhysicalFiles();

// Lấy danh sách văn bản quy định
export const getDocuments = async (req, res) => {
  try {
    const { category, search, status } = req.query;

    let sql = `SELECT * FROM documents WHERE 1=1`;
    const params = [];

    if (category && category !== 'all' && category !== 'Tất cả') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (title LIKE ? OR description LIKE ? OR file_name LIKE ? OR applicable_to LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ` ORDER BY id ASC`;

    const docs = await query.all(sql, params);

    // Tính toán thống kê theo từng danh mục
    const stats = {
      total: docs.length,
      rules: docs.filter(d => d.category === 'Nội quy & Quy chế').length,
      welfare: docs.filter(d => d.category === 'Chính sách & Phúc lợi').length,
      salary: docs.filter(d => d.category === 'Lương & Đãi ngộ').length,
      forms: docs.filter(d => d.category === 'Biểu mẫu nhân sự').length,
      training: docs.filter(d => d.category === 'Đào tạo & Hướng dẫn').length
    };

    res.json({
      success: true,
      data: docs,
      stats
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách văn bản quy định:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách văn bản.' });
  }
};

// Lấy chi tiết 1 văn bản
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu yêu cầu.' });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết văn bản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Tải file trực tiếp
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).send('Không tìm thấy tài liệu.');
    }

    let filePath = '';
    if (doc.file_url && doc.file_url.startsWith('/uploads/')) {
      filePath = path.resolve(__dirname, '../..' + doc.file_url);
    }

    // Nếu file chưa tồn tại, tự động tạo file và gửi về
    if (!filePath || !fs.existsSync(filePath)) {
      const uploadDir = path.resolve(__dirname, '../../uploads/documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const safeName = `doc_${doc.id}.doc`;
      filePath = path.join(uploadDir, safeName);
      
      const fileContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; }
    h1 { color: #1e3a8a; font-size: 20pt; text-align: center; }
    h2 { color: #1e40af; font-size: 16pt; margin-top: 20px; }
    h3 { color: #334155; font-size: 13pt; }
    .header-box { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; }
    .meta { font-style: italic; color: #64748b; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header-box">
    <h3>CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á</h3>
    <h1>${doc.title.toUpperCase()}</h1>
    <div class="meta">
      Mã văn bản: #${doc.id} | Danh mục: ${doc.category} | Ngày áp dụng: ${doc.effective_date} | Đối tượng: ${doc.applicable_to}
    </div>
  </div>
  <div>
    ${(doc.content || doc.description || '').replace(/\n/g, '<br/>')}
  </div>
</body>
</html>
      `;
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    }

    res.download(filePath, doc.file_name || `${doc.title}.doc`);
  } catch (error) {
    console.error('Lỗi khi tải file văn bản:', error);
    res.status(500).send('Lỗi khi tải tài liệu.');
  }
};

// Thêm văn bản mới
export const createDocument = async (req, res) => {
  try {
    const {
      title,
      category,
      file_name,
      file_url,
      file_size,
      file_type,
      effective_date,
      applicable_to,
      description,
      content,
      status
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tiêu đề và Danh mục văn bản.' });
    }

    const now = new Date().toISOString();
    const created_by = req.user?.full_name || req.user?.username || 'Quản trị viên';

    const result = await query.run(
      `INSERT INTO documents (
        title, category, file_name, file_url, file_size, file_type,
        effective_date, applicable_to, description, content, status, created_by,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        category,
        file_name || `${title}.docx`,
        file_url || '',
        file_size || '1.0 MB',
        file_type || 'docx',
        effective_date || now.split('T')[0],
        applicable_to || 'Toàn thể CBNV',
        description || '',
        content || '',
        status || 'Đang hiệu lực',
        created_by,
        now,
        now
      ]
    );

    const newDoc = await query.get('SELECT * FROM documents WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Đã thêm văn bản quy định thành công.',
      data: newDoc
    });
  } catch (error) {
    console.error('Lỗi khi tạo văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi tạo mới văn bản.' });
  }
};

// Cập nhật văn bản
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      file_name,
      file_url,
      file_size,
      file_type,
      effective_date,
      applicable_to,
      description,
      content,
      status
    } = req.body;

    const existing = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản để cập nhật.' });
    }

    const now = new Date().toISOString();

    await query.run(
      `UPDATE documents SET
        title = ?,
        category = ?,
        file_name = ?,
        file_url = ?,
        file_size = ?,
        file_type = ?,
        effective_date = ?,
        applicable_to = ?,
        description = ?,
        content = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        title ?? existing.title,
        category ?? existing.category,
        file_name ?? existing.file_name,
        file_url ?? existing.file_url,
        file_size ?? existing.file_size,
        file_type ?? existing.file_type,
        effective_date ?? existing.effective_date,
        applicable_to ?? existing.applicable_to,
        description ?? existing.description,
        content ?? existing.content,
        status ?? existing.status,
        now,
        id
      ]
    );

    const updated = await query.get('SELECT * FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Cập nhật văn bản thành công.',
      data: updated
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật văn bản.' });
  }
};

// Xóa văn bản
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy văn bản để xóa.' });
    }

    await query.run('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Đã xóa văn bản thành công.'
    });
  } catch (error) {
    console.error('Lỗi khi xóa văn bản:', error);
    res.status(500).json({ message: 'Lỗi khi xóa văn bản.' });
  }
};
