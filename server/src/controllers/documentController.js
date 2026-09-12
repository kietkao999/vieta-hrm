import { query } from '../config/database.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Danh mục 8 văn bản chính thức chuẩn xác 100% từ Google Docs gốc
export const DEFAULT_DOCUMENTS = [
  {
    title: 'Nội Quy Công Ty 2026',
    category: 'Nội quy & Quy chế',
    file_name: 'NỘI QUY CÔNG TY TNHH TMSX VIỆT Á 2026 (NB).docx',
    doc_id: '17eszxsVIxo9UqOGpZBmh4AY3Dt5Agk35',
    google_drive_url: 'https://docs.google.com/document/d/17eszxsVIxo9UqOGpZBmh4AY3Dt5Agk35/edit',
    preview_url: 'https://docs.google.com/document/d/17eszxsVIxo9UqOGpZBmh4AY3Dt5Agk35/preview',
    file_url: '/uploads/documents/noi_quy_cong_ty_2026.docx',
    file_size: '54 KB',
    file_type: 'docx',
    effective_date: '2026-08-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 8/2026. Số: 01-2026/QĐ-NQLD. Quy định 6 Giá trị cốt lõi, 5S, kỷ luật lao động, thời giờ làm việc (07:30 - 17:00), bảo mật thông tin và quyền lợi nhân viên.',
    status: 'Đang hiệu lực',
    created_by: 'Võ Minh Cường (Phó Giám đốc)',
    content: `CÔNG TY TNHH TMSX VIỆT Á
Số: 01-2026/QĐ-NQLD
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
Kim Sơn, ngày 01 tháng 08 năm 2026

NỘI QUY CÔNG TY
(THÔNG BÁO NỘI BỘ)
Cùng làm việc đúng giờ – văn minh – an toàn – hiệu quả

6 GIÁ TRỊ CỐT LÕI:
• CHẤT LƯỢNG  •  TRÁCH NHIỆM  •  SÁNG TẠO  •  ĐỒNG ĐỘI  •  TÔN TRỌNG  •  GƯƠNG MẪU

I. MỤC ĐÍCH
* Xây dựng môi trường làm việc chuyên nghiệp, văn minh, đoàn kết.
* Nâng cao tinh thần trách nhiệm và sự phối hợp trong công việc.
* Đảm bảo hoạt động sản xuất, kinh doanh hiệu quả và an toàn.

II. PHẠM VI ÁP DỤNG
* Áp dụng cho toàn thể nhân viên chính thức, thử việc và các cá nhân làm việc theo sự quản lý của Công ty.

III. QUY ĐỊNH CHUNG
1. Đi làm đúng giờ: Đi làm và chấm công đúng giờ theo quy định. Nếu có việc đột xuất hoặc đến muộn, báo quản lý trực tiếp sớm nhất có thể.
2. Đồng phục và tác phong: Mặc đúng đồng phục khi làm việc. Giữ tác phong gọn gàng, lịch sự, giao tiếp văn minh và tôn trọng mọi người.
3. Phục vụ khách hàng: Luôn vui vẻ, lịch sự, đặt nhu cầu khách hàng lên hàng đầu. Chủ động xử lý vấn đề "không quá 24 giờ". Không tranh cãi, lớn tiếng làm ảnh hưởng hình ảnh Công ty.
4. 5S – nơi làm việc: Giữ nơi làm việc sạch, gọn, dễ tìm và dễ sử dụng. Phân loại vật dụng, sắp xếp đúng chỗ, vệ sinh thường xuyên mỗi ngày.
5. Hàng hóa: Sắp xếp hàng hóa, nguyên vật liệu, thành phẩm đúng vị trí. Không để hàng hóa chắn lối đi hoặc gây mất an toàn.
6. Ứng xử với đồng nghiệp: Hỗ trợ, hợp tác thay vì cạnh tranh không lành mạnh. Tôn trọng sự khác biệt, giao tiếp chuyên nghiệp. Không gây gổ, xúc phạm hoặc có hành vi bạo lực.
7. Đối với công việc: Làm việc có trách nhiệm, đúng thời hạn. Chủ động đề xuất giải pháp cải thiện hiệu suất.
8. Hút thuốc: Chỉ hút thuốc tại khu vực quy định. Tuyệt đối không hút thuốc tại xưởng, kho, văn phòng hoặc khu vực có nguy cơ cháy nổ.
9. Tiền hàng: Kiểm tra tiền cẩn thận trước khi nhận. Không nhận tiền giả, tiền rách hoặc không đủ điều kiện lưu thông.
10. Bảo mật thông tin: Giữ bí mật thông tin về Công ty, khách hàng, nhà cung cấp, giá bán và dữ liệu nội bộ. Không tự ý chụp ảnh, quay phim hoặc đăng thông tin nội bộ lên mạng xã hội.

IV. THỜI GIAN LÀM VIỆC VÀ NGHỈ NGƠI
* Giờ hành chính:
  - Buổi sáng: 07:30 – 11:30.
  - Nghỉ trưa: 11:30 – 13:00.
  - Buổi chiều: 13:00 – 17:00.
* Xưởng sản xuất và Kho: Có mặt lúc 07:20 để họp đầu giờ, nhận kế hoạch và phân công công việc.

V. CHẤM CÔNG & NGHỈ PHÉP
* Chấm công bằng vân tay khi vào và kết thúc ca làm việc.
* Nghỉ phép phải làm đơn báo trước ít nhất 03 ngày làm việc và chờ Trưởng bộ phận phê duyệt.
* Nghỉ việc phải viết đơn và thực hiện thời gian báo trước 30 ngày kèm bàn giao công việc đầy đủ.
* Nghỉ không phép 02 ngày trong kỳ sẽ bị cắt thưởng KPI của kỳ đó theo Quy chế KPI.

VI. LÀM THÊM GIỜ, TIỀN LƯƠNG & TẠM ỨNG
* Tiền làm thêm giờ (tăng ca sau 17:00) được tính theo hệ số 150% (1,5).
* Tiền lương: Trả 01 lần/tháng vào ngày 10 dương lịch của tháng kế tiếp.
* Tạm ứng lương: Tạm ứng vào ngày 25 dương lịch hằng tháng (đăng ký trước ngày 23), tối đa 50% tiền lương thực tế theo ngày công đã làm.

VII. ĐIỀU KHOẢN THỰC HIỆN
* Quy chế có hiệu lực từ ngày 01/08/2026.
* Đại diện Công ty: Phó Giám đốc VÕ MINH CƯỜNG (Đã ký duyệt).`
  },
  {
    title: 'Phúc Lợi Công Ty 2026',
    category: 'Chính sách & Phúc lợi',
    file_name: 'CHÍNH SÁCH PHÚC LỢI 2026.docx',
    doc_id: '1LF05Qy3NbR5wJ3rYHyQySsKofPXLSSBS',
    google_drive_url: 'https://docs.google.com/document/d/1LF05Qy3NbR5wJ3rYHyQySsKofPXLSSBS/edit',
    preview_url: 'https://docs.google.com/document/d/1LF05Qy3NbR5wJ3rYHyQySsKofPXLSSBS/preview',
    file_url: '/uploads/documents/chinh_sach_phuc_loi_2026.docx',
    file_size: '10 KB',
    file_type: 'docx',
    effective_date: '2026-09-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Áp dụng tháng 9/2026. Số hiệu: QĐ-PL/2026/09. Quy chế mừng sinh nhật 300.000đ, kết hôn 2.000.000đ, thai sản 1.500.000đ, ốm đau, tang chế, thưởng các dịp Lễ Tết và du lịch 1 năm/lần.',
    status: 'Đang hiệu lực',
    created_by: 'Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)',
    content: `CÔNG TY TNHH TM SX VIỆT Á
Số hiệu: QĐ-PL/2026/09  
Ngày ban hành: 01/09/2026  
Người ký duyệt: Ban Giám đốc & Phòng HCNS

CHÍNH SÁCH PHÚC LỢI 2026

I. MỤC ĐÍCH & Ý NGHĨA
Chính sách phúc lợi 2026 được xây dựng nhằm chăm lo đời sống vật chất và tinh thần cho toàn thể CBNV Công ty TNHH TM SX Việt Á, tạo động lực gắn bó lâu dài và nâng cao năng suất lao động.

II. CÁC CHẾ ĐỘ PHÚC LỢI CỤ THỂ
1. Chế độ Sinh nhật CBNV:
   - Tặng quà/tiền mặt trị giá 300.000 VNĐ kèm thiệp chúc mừng từ Ban Giám đốc trong tháng sinh nhật.
   - Tổ chức tiệc chúc mừng sinh nhật chung định kỳ hàng tháng tại từng chi nhánh/kho/xưởng.

2. Chế độ Hiếu - Hỷ & Thai sản:
   - Kết hôn: Mừng 2.000.000 VNĐ/nhân sự (nghỉ hưởng nguyên lương 03 ngày).
   - Sinh con (Thai sản): Thăm hỏi 1.500.000 VNĐ/bé (áp dụng cho cả lao động nam có vợ sinh con).
   - Ốm đau nằm viện: Thăm hỏi từ 500.000 VNĐ - 1.500.000 VNĐ/lần.
   - Tang chế: Tứ thân phụ mẫu, vợ/chồng, con cái qua đời viếng 2.000.000 VNĐ - 3.000.000 VNĐ kèm vòng hoa công ty.

3. Thưởng các ngày Lễ, Tết trong năm:
   - Tết Dương Lịch (01/01): Thưởng từ 500.000 VNĐ - 1.000.000 VNĐ/người.
   - Ngày 30/4 & 01/5: Thưởng 500.000 VNĐ - 1.000.000 VNĐ/người.
   - Quốc khánh 02/09: Thưởng 500.000 VNĐ - 1.000.000 VNĐ/người.
   - Tết Trung Thu: Quà bánh trung thu cao cấp cho toàn thể CBNV có con nhỏ.
   - Thưởng Lương Tháng 13: Căn cứ theo kết quả kinh doanh và đánh giá mức độ cống hiến trong năm.

4. Du lịch & Hoạt động tập thể thường niên:
   - Công ty tổ chức chương trình Company Trip / Du lịch nghỉ dưỡng 1 năm/lần cho toàn thể nhân viên ký HĐLĐ chính thức.`
  },
  {
    title: 'Bộ Đào Tạo Hội Nhập',
    category: 'Đào tạo & Hướng dẫn',
    file_name: 'BỘ ĐÀO TẠO HỘI NHẬP CÔNG TY VIỆT Á.docx',
    doc_id: '1UD2QzFCL1m8qkQM3o3oAlOc43J5GJVhR',
    google_drive_url: 'https://docs.google.com/document/d/1UD2QzFCL1m8qkQM3o3oAlOc43J5GJVhR/edit',
    preview_url: 'https://docs.google.com/document/d/1UD2QzFCL1m8qkQM3o3oAlOc43J5GJVhR/preview',
    file_url: '/uploads/documents/bo_dao_tao_hoi_nhap_viet_a.docx',
    file_size: '16.1 MB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Nhân sự mới gia nhập',
    description: 'Tài liệu hướng dẫn hội nhập toàn diện: Kênh truyền thông, Lịch sử thành lập 2015-2021, Top 20 Thương hiệu mạnh Quốc gia, Top 10 Thương hiệu Nệm Việt, sơ đồ tổ chức gần 70 nhân sự.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `BỘ ĐÀO TẠO HỘI NHẬP CÔNG TY VIỆT Á

PHẦN 1: GIỚI THIỆU CÔNG TY
1. Các kênh truyền thông của Công ty:
   * Trang Fanpage: http://www.facebook.com/ctynemvietaa/
   * Youtube: http://www.youtube.com/@congtynemvieta
   * Website: www.nemvieta.net
   * Email: congtynemvieta@gmail.com
   * Hotline: 18008384

2. Lịch sử hình thành và phát triển:
   * 2015 – 2016: Giai đoạn khởi đầu bán nhỏ lẻ chăn drap gối nệm.
   * 2016 – 2020: Thành lập đại lý phân phối Nhật Mai phân phối lớn cho các tỉnh miền Tây Nam Bộ.
   * 2021: Chính thức thành lập Công ty TNHH Thương mại Sản xuất Việt Á, đầu tư nhà máy sản xuất nệm riêng.
   * Thành tựu: Top 20 Thương Hiệu Mạnh Quốc Gia (2022), Top 10 Thương hiệu Nệm Việt (2025), Chứng nhận tiêu chuẩn ISO.
   * Quy mô hiện tại: Gần 70 cán bộ công nhân viên cùng hệ thống kho xưởng hiện đại.

PHẦN 2: NHỮNG GIÁ TRỊ CỐT LÕI TẠI VIỆT Á
   * Lấy khách hàng làm trung tâm.
   * Lấy con người làm nền tảng phát triển.
   * Lấy chất lượng làm cam kết sống còn.

PHẦN 3: CƠ CẤU TỔ CHỨC & VĂN HÓA LÃNH ĐẠO
   * Ban Giám đốc, Phòng HCNS, Phòng Kế toán, Phòng Kinh doanh, Phòng Marketing, Phòng R&D.
   * Xưởng sản xuất nệm, Xưởng gối, Chi nhánh Cần Thơ, Chi nhánh Mỹ Tho.

PHẦN 4: HƯỚNG DẪN THỜI GIAN LÀM VIỆC, NGHỈ PHÉP & PHÚC LỢI
   * Quy định làm việc đúng giờ, đồng phục, tác phong và quy trình chấm công trên hệ thống HRM.`
  },
  {
    title: 'Mẫu Đề Xuất Tuyển Dụng',
    category: 'Biểu mẫu nhân sự',
    file_name: 'MẪU ĐỀ XUẤT TUYỂN DỤNG NHÂN SỰ.docx',
    doc_id: '1SLEBTi85h6DQYSA3u4coAmJ8M-adq9lU',
    google_drive_url: 'https://docs.google.com/document/d/1SLEBTi85h6DQYSA3u4coAmJ8M-adq9lU/edit',
    preview_url: 'https://docs.google.com/document/d/1SLEBTi85h6DQYSA3u4coAmJ8M-adq9lU/preview',
    file_url: '/uploads/documents/mau_de_xuat_tuyen_dung_nhan_su.docx',
    file_size: '647 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Trưởng phòng / Quản lý',
    description: 'Biểu mẫu chuẩn hóa Phiếu đề xuất tuyển dụng nhân sự (Thay thế, Bổ sung, Mở rộng hoạt động), tiêu chuẩn chuyên môn, độ tuổi, trình độ, giờ làm việc và chữ ký phê duyệt.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `CÔNG TY TNHH TM SX VIỆT Á
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM  
Độc Lập – Tự Do – Hạnh Phúc

PHIẾU ĐỀ XUẤT TUYỂN DỤNG

1. MỤC ĐÍCH TUYỂN DỤNG:
   [ ] Thay thế nhân sự nghỉ        [ ] Bổ sung định biên        [ ] Mở rộng hoạt động kinh doanh

2. NỘI DUNG ĐỀ XUẤT:
   - Phòng ban / bộ phận cần tuyển: ................................................................
   - Chức danh cần tuyển: ................................................................................
   - Số lượng tuyển: ..........................................................................................

3. TIÊU CHUẨN TUYỂN DỤNG:
   - Độ tuổi: ........................................... | Giới tính: [ ] Nam   [ ] Nữ
   - Trình độ: [ ] Cao học   [ ] Đại học   [ ] Cao đẳng   [ ] Trung cấp   [ ] Lao động phổ thông
   - Ngoại ngữ: [ ] Giao tiếp   [ ] Chuyên ngành
   - Tin học: [ ] Văn phòng   [ ] Chuyên ngành
   - Chuyên môn & Kinh nghiệm yêu cầu: ................................................................
   - Mô tả công việc tóm tắt: .......................................................................................
   - Thời gian làm việc: [ ] Giờ hành chính   [ ] Theo ca   [ ] Thỏa thuận

4. PHÊ DUYỆT & ĐỀ XUẤT:
   - Người đề xuất: (Ký và ghi rõ họ tên)
   - Người phê duyệt (Ban Giám đốc): (Ký và ghi rõ họ tên)`
  },
  {
    title: 'Thư Mời Nhận Việc',
    category: 'Biểu mẫu nhân sự',
    file_name: 'Thư Mời Nhận Việc.docx',
    doc_id: '1e1EpOX0MdiEu7hykwnevUG0r9QBoYqEW',
    google_drive_url: 'https://docs.google.com/document/d/1e1EpOX0MdiEu7hykwnevUG0r9QBoYqEW/edit',
    preview_url: 'https://docs.google.com/document/d/1e1EpOX0MdiEu7hykwnevUG0r9QBoYqEW/preview',
    file_url: '/uploads/documents/thu_moi_nhan_viec.docx',
    file_size: '340 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Phòng HCNS & Ứng viên',
    description: 'Mẫu Thư mời nhận việc chính thức: Số ……/TMNV-VA/20…, chi tiết vị trí công tác, mức lương thử việc, lương chính thức, phụ cấp, hồ sơ cần chuẩn bị và thời hạn phản hồi.',
    status: 'Đang hiệu lực',
    created_by: 'Phòng Hành chính Nhân sự',
    content: `CÔNG TY TNHH TMSX VIỆT Á
Số: ……/TMNV-VA/20……
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc Lập – Tự Do - Hạnh Phúc

THƯ MỜI NHẬN VIỆC (JOB OFFER LETTER)

Kính gửi: Ông/Bà ....................................................................................

Công ty TNHH Thương mại Sản xuất Việt Á trân trọng thông báo Anh/Chị đã trúng tuyển và gửi lời mời gia nhập đội ngũ nhân sự với các nội dung sau:

1. THÔNG TIN CÔNG VIỆC:
   * Chức danh: ....................................................................................
   * Phòng / Bộ phận: ............................................................................
   * Người quản lý trực tiếp: ................................................................
   * Địa điểm làm việc: ..........................................................................
   * Ngày nhận việc: …../…../20….. (Thứ Hai đến Thứ Bảy).

2. CHẾ ĐỘ TIỀN LƯƠNG & PHÚC LỢI:
   * Mức lương thử việc: .................................................... đồng/tháng.
   * Mức lương chính thức: ................................................ đồng/tháng (sau khi hoàn thành thử việc).
   * Phụ cấp & Thưởng: Theo quy chế lương thưởng và KPI của Công ty.
   * Chế độ bảo hiểm: Tham gia BHXH, BHYT, BHTN theo luật định.

3. THỜI GIAN THỬ VIỆC:
   * Thời gian thử việc: 30 - 60 ngày kể từ ngày bắt đầu nhận việc.

4. HỒ SƠ CẦN CHUẨN BỊ KHI NHẬN VIỆC:
   * Bản sao Căn cước công dân (công chứng).
   * Sơ yếu lý lịch có xác nhận địa phương trong vòng 6 tháng.
   * Giấy khám sức khỏe còn hiệu lực.
   * Bằng cấp, chứng chỉ liên quan (công chứng).
   * 04 ảnh thẻ 3x4.

Kim Sơn, ngày …… tháng …… năm 20……
ĐẠI DIỆN CÔNG TY (Ký tên và đóng dấu)`
  },
  {
    title: 'Quy Định An Toàn Lao Động',
    category: 'Nội quy & Quy chế',
    file_name: 'QUY ĐỊNH AN TOÀN LAO ĐỘNG.docx',
    doc_id: '1HnGnp_VJKUXX6rMXEI3E0ZKJlEKThmnr8mWJFtMQnG4',
    google_drive_url: 'https://docs.google.com/document/d/1HnGnp_VJKUXX6rMXEI3E0ZKJlEKThmnr8mWJFtMQnG4/edit',
    preview_url: 'https://docs.google.com/document/d/1HnGnp_VJKUXX6rMXEI3E0ZKJlEKThmnr8mWJFtMQnG4/preview',
    file_url: '/uploads/documents/quy_dinh_an_toan_lao_dong.docx',
    file_size: '56 KB',
    file_type: 'docx',
    effective_date: '2026-01-01',
    applicable_to: 'Khối Xưởng & Kho bãi',
    description: 'Quy chuẩn an toàn lao động chi tiết cho từng khối: Xưởng sản xuất (máy cắt, may), Kho hàng (nâng vác), Tài xế & phụ xe, Văn phòng và PCCC cứu hộ.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Quản trị & Ban An toàn',
    content: `QUY ĐỊNH AN TOÀN LAO ĐỘNG
CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á

I. MỤC ĐÍCH
* Đảm bảo an toàn tính mạng, sức khỏe cho người lao động.
* Phòng ngừa tai nạn lao động và bệnh nghề nghiệp.
* Bảo vệ tài sản của Công ty và khách hàng.

II. QUY ĐỊNH CHUNG
1. Chấp hành đầy đủ nội quy, quy trình và hướng dẫn an toàn của Công ty.
2. Không làm việc khi đang sử dụng rượu bia hoặc chất kích thích.
3. Không tự ý sửa chữa, tháo lắp hoặc vận hành máy móc khi chưa được phân công.
4. Báo ngay cho quản lý khi phát hiện nguy cơ mất an toàn.

III. QUY ĐỊNH ĐỐI VỚI KHU VỰC SẢN XUẤT (XƯỞNG NỆM, XƯỞNG GỐI)
1. Chỉ vận hành máy móc khi đã được đào tạo và được phép sử dụng.
2. Kiểm tra tình trạng máy trước khi vận hành.
3. Tuyệt đối không đưa tay vào khu vực máy cắt mút, máy may một kim, máy may viền khi máy đang hoạt động.
4. Khi phát hiện máy có dấu hiệu bất thường, phải tắt nguồn điện và báo ngay cho quản lý.

IV. QUY ĐỊNH ĐỐI VỚI KHO HÀNG & GIAO NHẬN
1. Sắp xếp hàng hóa đúng vị trí quy định, không chất hàng vượt tải trọng kệ.
2. Khi nâng bê hàng nặng phải sử dụng đúng tư thế hoặc dụng cụ xe nâng hỗ trợ.
3. Lối đi trong kho phải luôn thông thoáng.

V. QUY ĐỊNH ĐỐI VỚI TÀI XẾ VÀ PHỤ XE
1. Kiểm tra phương tiện cẩn thận trước khi xuất bến.
2. Tuân thủ Luật giao thông đường bộ, thắt dây an toàn khi lái xe.
3. Chằng buộc hàng hóa chắc chắn trước khi vận chuyển.

VI. PHÒNG CHÁY CHỮA CHÁY (PCCC)
1. Tuyệt đối không hút thuốc tại xưởng sản xuất và kho bãi chứa mút xốp.
2. Giữ lối thoát hiểm và vị trí đặt bình chữa cháy luôn thông thoáng.`
  },
  {
    title: 'Chính Sách Cho Nhân Viên Đi Hỗ Trợ',
    category: 'Chính sách & Phúc lợi',
    file_name: 'TB 73 HỖ TRỢ CHI PHÍ NV ĐI HỖ TRỢ.docx',
    doc_id: '1L3vUnYOUiOGbNKcr5srth0ihf0NgCbLI',
    google_drive_url: 'https://docs.google.com/document/d/1L3vUnYOUiOGbNKcr5srth0ihf0NgCbLI/edit',
    preview_url: 'https://docs.google.com/document/d/1L3vUnYOUiOGbNKcr5srth0ihf0NgCbLI/preview',
    file_url: '/uploads/documents/tb_73_ho_tro_chi_phi_nv_di_ho_tro.docx',
    file_size: '10 KB',
    file_type: 'docx',
    effective_date: '2026-06-01',
    applicable_to: 'Nhân viên đi công tác/hỗ trợ',
    description: 'Thông báo số 73/TB-VA/2026 về định mức công tác phí: Lưu trú 150.000đ - 250.000đ/ngày, xăng xe 1.200đ/km, phòng nghỉ 350.000đ - 500.000đ/đêm.',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc',
    content: `CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
THÔNG BÁO SỐ: 73/TB-VA/2026  
V/v: Quy định chế độ phụ cấp và hỗ trợ chi phí đối với nhân viên được điều động đi công tác, hỗ trợ kho & chi nhánh tỉnh.

ĐIỀU 1: PHẠM VI ÁP DỤNG
Áp dụng cho toàn thể CBNV khi được Ban Giám đốc hoặc Trưởng phòng ban điều động hỗ trợ công tác ngắn hạn hoặc đột xuất tại các kho/chi nhánh (Kho Cần Thơ, Kho Mỹ Tho và các thị trường tỉnh).

ĐIỀU 2: ĐỊNH MỨC CHI PHÍ HỖ TRỢ
1. Phụ cấp lưu trú công tác ngày:
   - Đi về trong ngày (cách trên 30km): 150.000 VNĐ/ngày.
   - Lưu trú qua đêm tại địa phương hỗ trợ: 250.000 VNĐ/ngày.
2. Chi phí phương tiện di chuyển:
   - Sử dụng xe khách/xe công ty: Thanh toán 100% tiền vé theo hóa đơn thực tế.
   - Tự túc di chuyển bằng xe máy cá nhân: Phụ cấp xăng xe 1.200 VNĐ/km.
3. Chi phí nhà nghỉ / Khách sạn:
   - Hạn mức tối đa: 350.000 VNĐ - 500.000 VNĐ/phòng/đêm (Thanh toán theo hóa đơn đỏ/hợp lệ).

ĐIỀU 3: QUY TRÌNH THANH TOÁN
1. Nhân viên lập Giấy đề xuất đi công tác có chữ ký duyệt của Trưởng bộ phận.
2. Tạm ứng công tác phí tại Phòng Kế toán trước khi lên đường.
3. Quyết toán và hoàn ứng trong vòng 03 ngày làm việc sau khi kết thúc đợt hỗ trợ.`
  },
  {
    title: 'Hệ Số Lương Tầng + Bậc',
    category: 'Lương & Đãi ngộ',
    file_name: 'THÔNG BÁO 18_ĐIỀU CHỈNH LƯƠNG CÁC BỘ PHẬN TRONG CÔNG TY.docx',
    doc_id: '1pUlTKGXoNdAgKnrQ43lgFOHcVvdKw7ek',
    google_drive_url: 'https://docs.google.com/document/d/1pUlTKGXoNdAgKnrQ43lgFOHcVvdKw7ek/edit',
    preview_url: 'https://docs.google.com/document/d/1pUlTKGXoNdAgKnrQ43lgFOHcVvdKw7ek/preview',
    file_url: '/uploads/documents/thong_bao_18_dieu_chinh_luong.docx',
    file_size: '118 KB',
    file_type: 'docx',
    effective_date: '2026-05-01',
    applicable_to: 'Toàn thể CBNV',
    description: 'Thông báo số 18 về khung lương tầng bậc: Tầng 1 (Lãnh đạo), Tầng 2 (Trưởng phòng/Quản lý: KPI TN 2tr), Tầng 3 (Phó QL/Kế toán: KPI TN 1.5tr), Tầng 4 (Nhân viên may, cắt, kho, tài xế: KPI TN 1tr).',
    status: 'Đang hiệu lực',
    created_by: 'Ban Giám đốc',
    content: `CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT VIỆT Á
THÔNG BÁO SỐ: 18/TB-VA/2026  
V/v: Điều chỉnh khung thang bảng lương, hệ số lương tầng và bậc lương cho toàn bộ các bộ phận trong công ty.

1. NGUYÊN TẮC XÁC ĐỊNH LƯƠNG THEO TẦNG & BẬC:
   * Lương Cố định = Lương Tầng + Lương Bậc.
   * KPI Trách nhiệm = Định mức theo Tầng x Tỷ lệ đạt (%) trong tháng.
   * Thưởng Hiệu quả = Đánh giá theo sản lượng, doanh thu và hiệu suất công việc thực tế.

2. PHÂN TẦNG VÀ ĐỊNH MỨC KPI TRÁCH NHIỆM:
   * TẦNG 1 (Ban Lãnh đạo & Giám đốc):
     - Mức thưởng trách nhiệm định mức: 2.500.000 VNĐ - 3.000.000 VNĐ.
   * TẦNG 2 (Trưởng phòng, Quản lý xưởng, Quản lý kho Cần Thơ/Mỹ Tho):
     - Mức thưởng trách nhiệm định mức: 2.000.000 VNĐ.
   * TẦNG 3 (Phó quản lý xưởng, Kế toán xưởng, Chuyên viên kỹ thuật):
     - Mức thưởng trách nhiệm định mức: 1.500.000 VNĐ.
   * TẦNG 4 (Nhân viên may, cắt, phun keo, giao hàng, kho, tài xế):
     - Mức thưởng trách nhiệm định mức: 1.000.000 VNĐ.

3. HIỆU LỰC THI HÀNH:
   * Áp dụng chính thức từ kỳ tính lương tháng 05/2026 trở đi.`
  }
];

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
    const { format } = req.query; // 'docx' hoặc 'pdf'
    const doc = await query.get('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).send('Không tìm thấy tài liệu.');
    }

    // Nếu yêu cầu file Word và có sẵn file vật lý
    if ((!format || format === 'docx') && doc.file_url && doc.file_url.startsWith('/uploads/')) {
      const filePath = path.resolve(__dirname, '../..' + doc.file_url);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, doc.file_name || `${doc.title}.docx`);
      }
    }

    // Nếu có doc_id Google Docs
    if (doc.doc_id) {
      const exportFormat = format === 'pdf' ? 'pdf' : 'docx';
      const redirectUrl = `https://docs.google.com/document/d/${doc.doc_id}/export?format=${exportFormat}`;
      return res.redirect(redirectUrl);
    }

    if (doc.file_url) {
      return res.redirect(doc.file_url);
    }

    res.status(404).send('Chưa có link tải về cho tài liệu này.');
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
      doc_id,
      google_drive_url,
      preview_url,
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

    let finalPreviewUrl = preview_url;
    if (doc_id) {
      finalPreviewUrl = `https://docs.google.com/document/d/${doc_id}/preview`;
    }

    const result = await query.run(
      `INSERT INTO documents (
        title, category, file_name, doc_id, google_drive_url, preview_url,
        file_url, file_size, file_type, effective_date, applicable_to,
        description, content, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        category,
        file_name || `${title}.docx`,
        doc_id || '',
        google_drive_url || '',
        finalPreviewUrl || '',
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
      doc_id,
      google_drive_url,
      preview_url,
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

    let finalPreviewUrl = preview_url ?? existing.preview_url;
    if (doc_id) {
      finalPreviewUrl = `https://docs.google.com/document/d/${doc_id}/preview`;
    }

    await query.run(
      `UPDATE documents SET
        title = ?,
        category = ?,
        file_name = ?,
        doc_id = ?,
        google_drive_url = ?,
        preview_url = ?,
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
        doc_id ?? existing.doc_id,
        google_drive_url ?? existing.google_drive_url,
        finalPreviewUrl,
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
