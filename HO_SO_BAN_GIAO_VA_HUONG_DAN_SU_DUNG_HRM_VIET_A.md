# CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT NỆM VIỆT Á
# HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (VIỆT Á HRM)

---

## 📌 HỒ SƠ BÀN GIAO TOÀN DIỆN, CHI TIẾT TỪNG PHÂN HỆ TÍNH NĂNG, MA TRẬN PHÂN QUYỀN & DANH SÁCH TÀI KHOẢN

---

### PHẦN I: THÔNG TIN TRUY CẬP VÀ QUY ĐỊNH ĐĂNG NHẬP DUY NHẤT
• **Tên hệ thống:** Hệ thống Quản trị Nhân sự & Tiền lương Doanh nghiệp - Nệm Việt Á (HRM).  
• **Đường dẫn Cloud (Chính thức):** [https://hrmvieta.up.railway.app](https://hrmvieta.up.railway.app)  
• **Đường dẫn Local:** `http://localhost:5173`  
• **Quy mô:** Toàn bộ 11 phòng ban/kho/xưởng và 57 nhân sự công ty.  
• **QUY TẮC ĐĂNG NHẬP 1 CÁCH DUY NHẤT:** Tất cả nhân sự đăng nhập DUY NHẤT bằng cú pháp: `vieta` + [Mã số 3 chữ số] (chữ thường, viết liền không dấu, không cách). Ví dụ: `vieta002`, `vieta032`, `vieta036`, `vieta004`, `vieta082`.  
• **QUY TẮC MẬT KHẨU BẢO MẬT CAO:** Mỗi người có 1 mật khẩu riêng biệt (chữ HOA + chữ thường + số + ký tự đặc biệt). Không thể đoán mật khẩu của nhau.

---

### PHẦN II: MA TRẬN PHÂN QUYỀN CHI TIẾT (XEM GÌ & LÀM ĐƯỢC GÌ)

| Cấp độ Phân quyền | Đối tượng áp dụng | PHẦN ĐƯỢC PHÉP XEM (READ) | PHẦN ĐƯỢC PHÉP THỰC HIỆN (ACTION) |
| :--- | :--- | :--- | :--- |
| **CẤP 1 - ADMIN**<br>*(Toàn quyền Quản trị)* | • Võ Minh Cường (Phó GĐ)<br>• Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)<br>• Phan Tuấn Kiệt (IT/Marketing) | ✓ Xem toàn bộ 11 phòng ban/kho/xưởng<br>✓ Xem 100% hồ sơ & hợp đồng nhân sự<br>✓ Xem bảng chấm công toàn công ty<br>✓ Xem toàn bộ điểm KPI các phòng ban<br>✓ Xem 100% BẢNG LƯƠNG TOÀN CÔNG TY<br>✓ Xem báo cáo thống kê & nhật ký audit log<br>✓ Xem toàn bộ tài sản, văn bản, hòm thư | ✓ Thêm, sửa, xóa hồ sơ nhân viên<br>✓ Tạo, gia hạn & in hợp đồng lao động<br>✓ Phê duyệt đơn nghỉ phép / OT toàn cty<br>✓ Thiết lập chỉ tiêu & chốt điểm KPI tháng<br>✓ TÍNH TOÁN, KHÓA & XUẤT BẢNG LƯƠNG<br>✓ Ban hành Khen thưởng, Kỷ luật<br>✓ Thẩm định & duyệt thưởng Sáng kiến<br>✓ Quản trị tài khoản, phân quyền & sao lưu |
| **CẤP 2 - MANAGER**<br>*(Trưởng phòng / Quản lý)* | • 8 Quản lý phòng/kho/xưởng:<br>- Nguyễn Thị Thu Tâm (Kho Cần Thơ)<br>- Dương Thị Tuyết Hường (Kho Mỹ Tho)<br>- Nguyễn Quốc Hùng (Kế toán)<br>- Lê Huy Hoàng (R&D)<br>- Phạm Tấn Hưng (Kinh doanh)<br>- Nguyễn Thái Cần (Xưởng gối)<br>- Trần Minh Lý (Xưởng nệm)<br>- Trần Thị Bảo Châu (Kế toán xưởng)<br>*(Khối VP do Trúc Xinh quản lý)* | ✓ Xem danh sách nhân viên phòng mình<br>✓ Xem bảng chấm công phòng mình phụ trách<br>✓ Xem chi tiết KPI nhân viên phòng mình<br>✓ XEM BẢNG LƯƠNG NHÂN VIÊN PHÒNG MÌNH<br>✓ Xem phiếu lương cá nhân của chính mình<br>✓ Xem Sơ đồ tổ chức, Tài sản, Văn bản<br>🔒 TUYỆT ĐỐI KHÔNG xem lương Ban Giám Đốc<br>🔒 KHÔNG xem lương phòng ban khác | ✓ Điểm danh & chấm công nhân viên phòng mình<br>✓ Phê duyệt đơn xin nghỉ phép / OT cấp dưới<br>✓ Chấm điểm & đánh giá % KPI tháng nhân viên<br>✓ Đề xuất khen thưởng / kỷ luật nhân viên phòng<br>✓ Tạo yêu cầu cấp phát & báo hỏng tài sản phòng<br>✓ Gửi sáng kiến cải tiến & đóng góp ý kiến |
| **CẤP 3 - EMPLOYEE**<br>*(Nhân viên)* | • Toàn bộ 46 nhân sự còn lại trong công ty | ✓ Xem thông tin hồ sơ của chính mình (Profile)<br>✓ Xem lịch sử chấm công & ngày phép cá nhân<br>✓ XEM DUY NHẤT PHIẾU LƯƠNG CÁ NHÂN<br>✓ Xem Sơ đồ tổ chức công ty<br>✓ Xem Văn bản, quy định & tài sản được giao<br>✓ Xem danh sách sáng kiến công khai<br>🔒 TUYỆT ĐỐI KHÔNG XEM KPI (của mình & người khác - ẩn menu KPI)<br>🔒 KHÔNG XEM DANH SÁCH NHÂN VIÊN (ẩn menu Hồ sơ)<br>🔒 ẨN 100% MỨC LƯƠNG CỦA TẤT CẢ NGƯỜI KHÁC | ✓ Thực hiện điểm danh chấm công hàng ngày<br>✓ GỬI ĐƠN CÁ NHÂN: Xin nghỉ phép năm, nghỉ không lương, nghỉ ốm, đi muộn, tăng ca OT, giải trình công<br>✓ GỬI HÒM THƯ & SÁNG KIẾN: Hiến kế cải tiến sản xuất, đóng góp ý kiến (có tùy chọn ẨN DANH)<br>✓ Báo hỏng công cụ dụng cụ / tài sản được giao<br>✓ Tự đổi mật khẩu tài khoản cá nhân |

---

### PHẦN III: HƯỚNG DẪN CHI TIẾT 16 PHÂN HỆ TÍNH NĂNG CỦA ỨNG DỤNG

#### 1. Bàn làm việc tổng quan (Dashboard - `/`)
• **Thống kê thời gian thực:** Hiển thị tổng số 57 nhân sự, tỷ lệ đi làm hôm nay, số lượng nhân sự vắng mặt/nghỉ phép, cảnh báo hợp đồng sắp hết hạn trong 30 ngày và danh sách sinh nhật trong tháng.  
• **Phím tắt tác vụ nhanh:** Hỗ trợ nút bấm nhanh: Chấm công, Nộp đơn nghỉ phép, Xem bảng lương, Tra cứu phiếu lương cá nhân.  
• **Phân quyền áp dụng:** Cấp 1 - Admin (Xem toàn công ty), Cấp 2 - Manager (Xem số liệu phòng ban mình), Cấp 3 - Employee (Xem tổng quan cá nhân).

#### 2. Sơ đồ tổ chức động & Bộ máy doanh nghiệp (`/settings/departments-positions`)
• **Cơ cấu cây tổ chức:** Trực quan hóa bộ máy doanh nghiệp từ Ban Giám Đốc -> 11 Đơn vị (Khối Văn phòng, Kho Cần Thơ, Kho Mỹ Tho, Xưởng Nệm, Xưởng Gối, Kinh doanh, Marketing, Kế toán, R&D, Giao hàng, Tạp vụ).  
• **Định biên & Quản lý trực tiếp:** Hiển thị rõ chức danh, số lượng nhân sự trực thuộc và người quản lý trực tiếp (Manager ID) của từng bộ phận.  
• **Phân quyền áp dụng:** Tất cả 3 Cấp bậc (Admin, Manager, Employee) đều được xem để nắm rõ bộ máy công ty.

#### 3. Quản lý Hồ sơ Nhân viên 360 độ (`/employees`)
• **Hồ sơ điện tử toàn diện:** Lưu trữ đầy đủ Mã NV, Họ tên, Ngày sinh, CCCD/CMND, Quê quán, Địa chỉ, Số điện thoại, Email, Trình độ học vấn, Tài khoản ngân hàng chi trả lương.  
• **Thiết lập ngạch bậc lương & Chế độ:** Quản lý Lương ngạch bậc, Lương đóng bảo hiểm xã hội, Phụ cấp trách nhiệm, Phụ cấp ăn trưa, Phụ cấp xăng xe điện thoại.  
• 🔒 **Phân quyền nghiêm ngặt:** Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ ẨN HOÀN TOÀN MENU để bảo mật danh bạ nội bộ.

#### 4. Hợp đồng lao động & Tự động in Word/PDF (`/contracts`)
• **Quản lý vòng đời hợp đồng:** Quản lý HĐ Thử việc, HĐ xác định thời hạn (12 tháng, 24 tháng), HĐ không xác định thời hạn, cảnh báo tự động trước khi hết hạn 30 ngày.  
• 📄 **In hợp đồng 1 chạm:** Bấm nút 'In Hợp đồng' -> Hệ thống tự động trích xuất thông tin người lao động và đại diện pháp luật, xuất ngay file Word (.docx) hoặc PDF chuẩn quy chế công ty Nệm Việt Á.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin và Cấp 2 - Manager.

#### 5. Chấm công & Điểm danh hàng ngày (`/attendance`)
• **Điểm danh trực tuyến:** Nhân viên bấm Check-in / Check-out hàng ngày, hệ thống tự động ghi nhận giờ vào, giờ ra, số phút đi muộn / về sớm.  
• **Bảng chấm công tổng hợp:** Theo dõi dữ liệu 26 ngày công chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương.  
• **Theo dõi làm thêm giờ (OT):** Ghi nhận chính xác số giờ tăng ca ngày thường (hệ số x1.5), tăng ca chủ nhật (x2.0) và ngày lễ (x3.0) để đồng bộ sang bảng lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự (Admin xem toàn bộ; Manager xem & chấm công phòng mình; Employee xem lịch sử cá nhân).

#### 6. Quản lý Đơn từ cá nhân trực tuyến (`/attendance?tab=leaves`)
• **Mục đích:** Giải quyết thủ tục hành chính liên quan đến ngày công làm việc của nhân viên.  
• **Các loại đơn:** Đơn xin nghỉ phép năm, Nghỉ không lương, Nghỉ ốm đau/thai sản, Đi muộn/về sớm, Đăng ký làm thêm giờ (OT), Giải trình quên chấm công.  
• **Quy trình phê duyệt:** Nhân viên gửi đơn -> Trưởng phòng / HCNS nhận thông báo -> Phê duyệt / Từ chối kèm lý do -> Tự động cập nhật vào Bảng công và Lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự đều được gửi đơn; Quản lý và Admin duyệt đơn.

#### 7. Quản lý KPI & Đánh giá hiệu suất tháng (`/kpi`)
• **Thiết lập định mức KPI:** Chọn tháng cần đánh giá (ví dụ Tháng 08/2026), cấu hình mức thưởng trách nhiệm định mức theo chức danh (1.000.000đ, 2.000.000đ,...).  
• **Chấm điểm & Tự động tính thưởng:** Trưởng phòng chấm điểm theo tỷ lệ % hoàn thành (100%, 80%, 50%,...) -> Tự động tính tiền Thưởng trách nhiệm và Thưởng hiệu suất.  
• 🔒 **Phân quyền bảo mật cao:** Chỉ Cấp 1 (Admin) và Cấp 2 (Manager xem phòng mình); Cấp 3 (Employee) BỊ KHÓA & ẨN HOÀN TOÀN để tránh so bì nội bộ.

#### 8. Tính toán, Duyệt & Xuất Bảng lương tự động (`/payroll`)
• **Công thức tính lương chuẩn 100% dữ liệu thực:**  
  * *Lương ngạch bậc thực nhận = (Lương ngạch bậc / 26) * Ngày công thực tế + Tiền OT (x1.5) + Tiền KPI + Phụ cấp ăn/điện thoại - BHXH (10.5%) - Công đoàn (1%) - Tạm ứng/Kỷ luật.*  
• **Xuất Bảng Lương Excel:** Xuất file Excel bảng lương tổng hợp 11 phòng ban đầy đủ công thức chuẩn bị trình ký Ban Giám Đốc.  
• **Phát hành Phiếu lương (Payslip):** Bấm 'Gửi phiếu lương' để từng nhân viên tự tra cứu trên tài khoản cá nhân. Nhân viên chỉ thấy duy nhất phiếu lương của mình, ẨN 100% lương người khác.  
• **Phân quyền xem lương:** Admin xem toàn cty; Manager xem phòng mình và phiếu cá nhân; Employee chỉ xem phiếu cá nhân.

#### 9. 💡 Hòm thư & Sáng kiến cải tiến sản xuất (`/innovations`)
• **Mục đích phát triển:** Khuyến khích cán bộ công nhân viên tại các xưởng sản xuất, kho bãi và văn phòng hiến kế cải tiến kỹ thuật, tiết kiệm nguyên vật liệu, nâng cao chất lượng nệm.  
• **3 Nhóm chủ đề đóng góp:** 1) Ý tưởng cải tiến sáng tạo; 2) Góp ý môi trường & phúc lợi; 3) Phản ánh khiếu nại kiến nghị nội bộ.  
• **Chế độ Bảo mật danh tính:** Nhân viên có thể tùy chọn: Hiện tên công khai HOẶC Gửi ẨN DANH (bảo mật 100% thông tin người gửi).  
• **Thẩm định & Thưởng nóng:** Ban Giám Đốc & HCNS phê duyệt thưởng nóng (tiền mặt/quà) -> Số tiền thưởng tự động đồng bộ sang Bảng lương.  
• **Phân quyền áp dụng:** Tất cả nhân sự (Admin, Manager, Employee) đều có quyền gửi sáng kiến và tương tác thả tim.

#### 10. 📦 Quản lý Tài sản & Công cụ dụng cụ (CCDC) (`/assets`)
• **Danh mục tài sản máy móc:** Theo dõi máy móc xưởng nệm (máy may, máy cắt), xe tải giao hàng kho Cần Thơ/Mỹ Tho, máy tính thiết bị văn phòng, tình trạng và thời gian khấu hao.  
• **Cấp phát & Báo hỏng trực tuyến:** Theo dõi nhân sự đang giữ tài sản; Nhân viên tạo phiếu báo hỏng khi có sự cố; Bộ phận kỹ thuật tiếp nhận xử lý và cập nhật chi phí.  
• **Phân quyền áp dụng:** Tất cả 3 cấp bậc (Admin/Manager quản trị & điều phối, Employee xem tài sản được cấp & báo hỏng).

#### 11. 🏆 Khen thưởng & Kỷ luật đồng bộ Bảng lương (`/rewards`)
• **Ban hành Khen thưởng:** Lập quyết định vinh danh cá nhân/tập thể xuất sắc kèm số tiền thưởng -> Tự động cộng vào cột Thưởng khác trên Bảng lương.  
• **Ghi nhận Kỷ luật:** Lập biên bản xử lý vi phạm nội quy, đi muộn, vi phạm an toàn kèm mức phạt -> Tự động trừ vào cột Giảm trừ kỷ luật trên Bảng lương.  
• **Phân quyền áp dụng:** Admin ban hành; Toàn bộ nhân viên xem được các quyết định khen thưởng công khai.

#### 12. Văn bản, Quy định & Chính sách Doanh nghiệp (`/documents`)
• **Thư viện quy chế số:** Lưu trữ Nội quy lao động 2026, Chính sách phúc lợi, Thông báo xử lý vi phạm nội bộ cấp Quản lý & Nhân viên, Quy trình an toàn lao động.  
• **Tra cứu & Tải về:** Nhân viên tra cứu trực tiếp mọi lúc mọi nơi trên điện thoại hoặc máy tính, tải về các biểu mẫu hành chính chuẩn.  
• **Phân quyền áp dụng:** Tất cả 3 cấp bậc (Admin quản trị thư viện; Manager và Employee tra cứu tải về).

#### 13. Đào tạo & Hội nhập Nhân viên mới (`/training`)
• **Giáo trình hội nhập:** Tích hợp Bộ đào tạo hội nhập Công ty Nệm Việt Á, cẩm nang văn hóa ứng xử, hướng dẫn kỹ thuật xưởng may nệm, xưởng gối và quy trình bán hàng.  
• **Theo dõi tiến độ học tập:** Giúp nhân sự mới nhanh chóng nắm bắt công việc và vượt qua thời gian thử việc thành công.  
• **Phân quyền áp dụng:** Tất cả nhân sự trong công ty.

#### 14. Báo cáo Thống kê Quản trị cao cấp (`/reports`)
• **Thống kê nhân lực:** Phân tích cơ cấu nhân sự theo giới tính, độ tuổi, thâm niên công tác, trình độ và biến động nhân sự vào/ra.  
• **Phân tích tài chính nhân sự:** Báo cáo tổng chi phí quỹ lương theo từng phòng ban, chi phí tăng ca OT, chi phí BHXH và biến động qua các tháng.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin và Cấp 2 - Manager.

#### 15. Phân quyền & Quản trị Tài khoản Người dùng (`/users`)
• **Quản lý 57 tài khoản:** Gán quyền 3 Cấp độ chuẩn (Admin, Manager, Employee), khóa tài khoản khi nhân viên nghỉ việc, cấp lại mật khẩu bảo mật cao.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin (Phòng HCNS & IT).

#### 16. Nhật ký Hệ thống & Sao lưu Dữ liệu (`/audit-logs`, `/backup`)
• **Nhật ký Audit Log:** Ghi nhận 100% thao tác nhạy cảm (thêm/sửa nhân viên, tính lương, đổi mật khẩu, phê duyệt đơn từ) phục vụ tra cứu bảo mật.  
• **Sao lưu & Khôi phục (Backup):** Tải bản backup Database SQLite định kỳ về máy tính lưu trữ an toàn, khôi phục dữ liệu 1-click khi cần thiết.  
• **Phân quyền áp dụng:** Chỉ Cấp 1 - Admin.

---

### PHẦN IV: DANH SÁCH CHI TIẾT 57 TÀI KHOẢN ĐĂNG NHẬP VÀ MẬT KHẨU

#### 1. CẤP 1 - ADMIN (3 TÀI KHOẢN CHÍNH THỨC TOÀN QUYỀN)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | VietA 002 | **vieta002** | **Võ Minh Cường** | Ban giám đốc | Phó Giám đốc | `VietA#Admin@002!8X` |
| 2 | VietA 032 | **vieta032** | **Huỳnh Thị Trúc Xinh** | Khối văn phòng | Trưởng phòng HCNS | `VietA#Admin@032!8X` |
| 3 | VietA 043 | **vieta043** | **Phan Tuấn Kiệt** | Phòng Marketing | Trưởng phòng Marketing | `VietA#Admin@043!8X` |

#### 2. CẤP 2 - MANAGER (8 TÀI KHOẢN TRƯỞNG PHÒNG / QUẢN LÝ)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | VietA 003 | **vieta003** | **Nguyễn Thị Thu Tâm** | Kho Cần Thơ | Quản lý kho Cần Thơ | `VietA#Mgr@003$9Q` |
| 2 | VietA 015 | **vieta015** | **Dương Thị Tuyết Hường** | Kho Mỹ Tho | Quản lý kho Mỹ Tho | `VietA#Mgr@015$9Q` |
| 3 | VietA 031 | **vieta031** | **Nguyễn Quốc Hùng** | Khối văn phòng | Trưởng phòng kế toán | `VietA#Mgr@031$9Q` |
| 4 | VietA 035 | **vieta035** | **Lê Huy Hoàng** | Khối văn phòng | Trưởng phòng R&D | `VietA#Mgr@035$9Q` |
| 5 | VietA 036 | **vieta036** | **Phạm Tấn Hưng** | Phòng kinh doanh | Trưởng phòng kinh doanh | `VietA#Mgr@036$9Q` |
| 6 | VietA 046 | **vieta046** | **Nguyễn Thái Cần** | Xưởng sản xuất gối | Trưởng nhóm thổi gối | `VietA#Mgr@046$9Q` |
| 7 | VietA 050 | **vieta050** | **Trần Minh Lý** | Xưởng sản xuất nệm | Quản lý xưởng | `VietA#Mgr@050$9Q` |
| 8 | VietA 056 | **vieta056** | **Trần Thị Bảo Châu** | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Mgr@056$9Q` |

#### 3. CẤP 3 - EMPLOYEE (46 TÀI KHOẢN NHÂN VIÊN)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | VietA 004 | **vieta004** | **Nguyễn Thị Thúy Vy** | Khối văn phòng | Kế toán thu mua | `VietA#Emp@004*7W` |
| 2 | VietA 006 | **vieta006** | **Phạm Thanh Phong** | Kho Cần Thơ | Kế toán kho Cần Thơ | `VietA#Emp@006*7W` |
| 3 | VietA 007 | **vieta007** | **Trần Thanh Hoài** | Kho Cần Thơ | Tài xế Cần Thơ | `VietA#Emp@007*7W` |
| 4 | VietA 009 | **vieta009** | **Huỳnh Ngọc Dư** | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@009*7W` |
| 5 | VietA 010 | **vieta010** | **Nguyễn Hải Duy** | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@010*7W` |
| 6 | VietA 011 | **vieta011** | **Lý Minh Trung** | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@011*7W` |
| 7 | VietA 012 | **vieta012** | **Võ Huỳnh Đông Nghi** | Xưởng sản xuất nệm | Phó quản lý xưởng | `VietA#Emp@012*7W` |
| 8 | VietA 013 | **vieta013** | **Hồ Minh Thuận** | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@013*7W` |
| 9 | VietA 016 | **vieta016** | **Nguyễn Thị Huỳnh Như** | Kho Mỹ Tho | Phó quản lý kho Mỹ Tho | `VietA#Emp@016*7W` |
| 10 | VietA 017 | **vieta017** | **Trần Lương Ngọc Khánh** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@017*7W` |
| 11 | VietA 018 | **vieta018** | **Tạ Thị Ngọc Trâm** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@018*7W` |
| 12 | VietA 019 | **vieta019** | **Đoàn Hoài Linh** | Kho Mỹ Tho | Đội trưởng đội tài xế | `VietA#Emp@019*7W` |
| 13 | VietA 020 | **vieta020** | **Đặng Hoàng Tuấn** | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@020*7W` |
| 14 | VietA 022 | **vieta022** | **Nguyễn Tuấn Kiệt** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@022*7W` |
| 15 | VietA 023 | **vieta023** | **Nguyễn Hoàng Quân** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@023*7W` |
| 16 | VietA 024 | **vieta024** | **Nguyễn Hữu Tài** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@024*7W` |
| 17 | VietA 026 | **vieta026** | **Phạm Minh Phúc** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@026*7W` |
| 18 | VietA 027 | **vieta027** | **Phạm Ngọc Hiển** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@027*7W` |
| 19 | VietA 028 | **vieta028** | **Trần Hữu Lộc** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@028*7W` |
| 20 | VietA 029 | **vieta029** | **Nguyễn Thị Thanh Tú** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@029*7W` |
| 21 | VietA 033 | **vieta033** | **Nguyễn Quốc Huy** | Khối văn phòng | Trợ lý Giám đốc | `VietA#Emp@033*7W` |
| 22 | VietA 034 | **vieta034** | **Lê Thị Mỹ Phúc** | Khối văn phòng | Kế toán viên | `VietA#Emp@034*7W` |
| 23 | VietA 037 | **vieta037** | **Nguyễn Thị Kim Hoàng** | Phòng kinh doanh | Kế toán kinh doanh | `VietA#Emp@037*7W` |
| 24 | VietA 038 | **vieta038** | **Phạm Thị Xuân Khoa** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@038*7W` |
| 25 | VietA 040 | **vieta040** | **Võ Thanh Sơn** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@040*7W` |
| 26 | VietA 041 | **vieta041** | **Phạm Phước Lành** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@041*7W` |
| 27 | VietA 042 | **vieta042** | **Ngô Thanh Tín** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@042*7W` |
| 28 | VietA 047 | **vieta047** | **Nguyễn Thành Lợi** | Xưởng sản xuất gối | Nhân viên thổi gối | `VietA#Emp@047*7W` |
| 29 | VietA 049 | **vieta049** | **Nguyễn Thị Ngọc** | Xưởng sản xuất gối | Nhân viên may gối | `VietA#Emp@049*7W` |
| 30 | VietA 052 | **vieta052** | **Nguyễn Minh Văn** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@052*7W` |
| 31 | VietA 053 | **vieta053** | **Trịnh Dương Minh Nhựt** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@053*7W` |
| 32 | VietA 054 | **vieta054** | **Võ Hoàng Tín** | Xưởng sản xuất nệm | Nhân viên may viền | `VietA#Emp@054*7W` |
| 33 | VietA 055 | **vieta055** | **Phan Quốc Khôi** | Xưởng sản xuất nệm | Tài xế xưởng sản xuất | `VietA#Emp@055*7W` |
| 34 | VietA 058 | **vieta058** | **Nguyễn Thị Kim Hòa** | Xưởng sản xuất nệm | Nhân viên may tay | `VietA#Emp@058*7W` |
| 35 | VietA 060 | **vieta060** | **Trần Thị Kim Quyên** | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@060*7W` |
| 36 | VietA 061 | **vieta061** | **Lê Thanh Hồng** | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@061*7W` |
| 37 | VietA 063 | **vieta063** | **Lê Ngọc Tuấn** | Xưởng sản xuất nệm | Nhân viên vô vali | `VietA#Emp@063*7W` |
| 38 | VietA 066 | **vieta066** | **Nguyễn Thị Thùy Trang** | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Emp@066*7W` |
| 39 | VietA 069 | **vieta069** | **Trương Hồng Quân** | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@069*7W` |
| 40 | VietA 070 | **vieta070** | **Nguyễn Thanh Hải** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@070*7W` |
| 41 | VietA 071 | **vieta071** | **Nguyễn Dương Tiển** | Xưởng sản xuất nệm | Nhân viên vô áo | `VietA#Emp@071*7W` |
| 42 | VietA 074 | **vieta074** | **Nguyễn Thị Ngọc Huệ** | Xưởng sản xuất nệm | Nhân viên cắt vải | `VietA#Emp@074*7W` |
| 43 | VietA 078 | **vieta078** | **Cổ Hoàn Lâm** | Khối văn phòng | Nhân viên phòng tổ chức | `VietA#Emp@078*7W` |
| 44 | VietA 080 | **vieta080** | **Nguyễn Minh Tấn Phát** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@080*7W` |
| 45 | VietA 081 | **vieta081** | **Trần Gia Khải** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@081*7W` |
| 46 | VietA 082 | **vieta082** | **Nguyễn Huỳnh Trung Tín** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@082*7W` |

#### 4. BẢNG TỔNG HỢP TOÀN BỘ 57 NHÂN SỰ CÔNG TY
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | VietA 002 | **vieta002** | **Võ Minh Cường** | Ban giám đốc | Phó Giám đốc | `VietA#Admin@002!8X` |
| 2 | VietA 032 | **vieta032** | **Huỳnh Thị Trúc Xinh** | Khối văn phòng | Trưởng phòng HCNS | `VietA#Admin@032!8X` |
| 3 | VietA 043 | **vieta043** | **Phan Tuấn Kiệt** | Phòng Marketing | Trưởng phòng Marketing | `VietA#Admin@043!8X` |
| 4 | VietA 003 | **vieta003** | **Nguyễn Thị Thu Tâm** | Kho Cần Thơ | Quản lý kho Cần Thơ | `VietA#Mgr@003$9Q` |
| 5 | VietA 015 | **vieta015** | **Dương Thị Tuyết Hường** | Kho Mỹ Tho | Quản lý kho Mỹ Tho | `VietA#Mgr@015$9Q` |
| 6 | VietA 031 | **vieta031** | **Nguyễn Quốc Hùng** | Khối văn phòng | Trưởng phòng kế toán | `VietA#Mgr@031$9Q` |
| 7 | VietA 035 | **vieta035** | **Lê Huy Hoàng** | Khối văn phòng | Trưởng phòng R&D | `VietA#Mgr@035$9Q` |
| 8 | VietA 036 | **vieta036** | **Phạm Tấn Hưng** | Phòng kinh doanh | Trưởng phòng kinh doanh | `VietA#Mgr@036$9Q` |
| 9 | VietA 046 | **vieta046** | **Nguyễn Thái Cần** | Xưởng sản xuất gối | Trưởng nhóm thổi gối | `VietA#Mgr@046$9Q` |
| 10 | VietA 050 | **vieta050** | **Trần Minh Lý** | Xưởng sản xuất nệm | Quản lý xưởng | `VietA#Mgr@050$9Q` |
| 11 | VietA 056 | **vieta056** | **Trần Thị Bảo Châu** | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Mgr@056$9Q` |
| 12 | VietA 004 | **vieta004** | **Nguyễn Thị Thúy Vy** | Khối văn phòng | Kế toán thu mua | `VietA#Emp@004*7W` |
| 13 | VietA 006 | **vieta006** | **Phạm Thanh Phong** | Kho Cần Thơ | Kế toán kho Cần Thơ | `VietA#Emp@006*7W` |
| 14 | VietA 007 | **vieta007** | **Trần Thanh Hoài** | Kho Cần Thơ | Tài xế Cần Thơ | `VietA#Emp@007*7W` |
| 15 | VietA 009 | **vieta009** | **Huỳnh Ngọc Dư** | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@009*7W` |
| 16 | VietA 010 | **vieta010** | **Nguyễn Hải Duy** | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@010*7W` |
| 17 | VietA 011 | **vieta011** | **Lý Minh Trung** | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@011*7W` |
| 18 | VietA 012 | **vieta012** | **Võ Huỳnh Đông Nghi** | Xưởng sản xuất nệm | Phó quản lý xưởng | `VietA#Emp@012*7W` |
| 19 | VietA 013 | **vieta013** | **Hồ Minh Thuận** | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@013*7W` |
| 20 | VietA 016 | **vieta016** | **Nguyễn Thị Huỳnh Như** | Kho Mỹ Tho | Phó quản lý kho Mỹ Tho | `VietA#Emp@016*7W` |
| 21 | VietA 017 | **vieta017** | **Trần Lương Ngọc Khánh** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@017*7W` |
| 22 | VietA 018 | **vieta018** | **Tạ Thị Ngọc Trâm** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@018*7W` |
| 23 | VietA 019 | **vieta019** | **Đoàn Hoài Linh** | Kho Mỹ Tho | Đội trưởng đội tài xế | `VietA#Emp@019*7W` |
| 24 | VietA 020 | **vieta020** | **Đặng Hoàng Tuấn** | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@020*7W` |
| 25 | VietA 022 | **vieta022** | **Nguyễn Tuấn Kiệt** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@022*7W` |
| 26 | VietA 023 | **vieta023** | **Nguyễn Hoàng Quân** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@023*7W` |
| 27 | VietA 024 | **vieta024** | **Nguyễn Hữu Tài** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@024*7W` |
| 28 | VietA 026 | **vieta026** | **Phạm Minh Phúc** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@026*7W` |
| 29 | VietA 027 | **vieta027** | **Phạm Ngọc Hiển** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@027*7W` |
| 30 | VietA 028 | **vieta028** | **Trần Hữu Lộc** | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@028*7W` |
| 31 | VietA 029 | **vieta029** | **Nguyễn Thị Thanh Tú** | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@029*7W` |
| 32 | VietA 033 | **vieta033** | **Nguyễn Quốc Huy** | Khối văn phòng | Trợ lý Giám đốc | `VietA#Emp@033*7W` |
| 33 | VietA 034 | **vieta034** | **Lê Thị Mỹ Phúc** | Khối văn phòng | Kế toán viên | `VietA#Emp@034*7W` |
| 34 | VietA 037 | **vieta037** | **Nguyễn Thị Kim Hoàng** | Phòng kinh doanh | Kế toán kinh doanh | `VietA#Emp@037*7W` |
| 35 | VietA 038 | **vieta038** | **Phạm Thị Xuân Khoa** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@038*7W` |
| 36 | VietA 040 | **vieta040** | **Võ Thanh Sơn** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@040*7W` |
| 37 | VietA 041 | **vieta041** | **Phạm Phước Lành** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@041*7W` |
| 38 | VietA 042 | **vieta042** | **Ngô Thanh Tín** | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@042*7W` |
| 39 | VietA 047 | **vieta047** | **Nguyễn Thành Lợi** | Xưởng sản xuất gối | Nhân viên thổi gối | `VietA#Emp@047*7W` |
| 40 | VietA 049 | **vieta049** | **Nguyễn Thị Ngọc** | Xưởng sản xuất gối | Nhân viên may gối | `VietA#Emp@049*7W` |
| 41 | VietA 052 | **vieta052** | **Nguyễn Minh Văn** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@052*7W` |
| 42 | VietA 053 | **vieta053** | **Trịnh Dương Minh Nhựt** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@053*7W` |
| 43 | VietA 054 | **vieta054** | **Võ Hoàng Tín** | Xưởng sản xuất nệm | Nhân viên may viền | `VietA#Emp@054*7W` |
| 44 | VietA 055 | **vieta055** | **Phan Quốc Khôi** | Xưởng sản xuất nệm | Tài xế xưởng sản xuất | `VietA#Emp@055*7W` |
| 45 | VietA 058 | **vieta058** | **Nguyễn Thị Kim Hòa** | Xưởng sản xuất nệm | Nhân viên may tay | `VietA#Emp@058*7W` |
| 46 | VietA 060 | **vieta060** | **Trần Thị Kim Quyên** | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@060*7W` |
| 47 | VietA 061 | **vieta061** | **Lê Thanh Hồng** | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@061*7W` |
| 48 | VietA 063 | **vieta063** | **Lê Ngọc Tuấn** | Xưởng sản xuất nệm | Nhân viên vô vali | `VietA#Emp@063*7W` |
| 49 | VietA 066 | **vieta066** | **Nguyễn Thị Thùy Trang** | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Emp@066*7W` |
| 50 | VietA 069 | **vieta069** | **Trương Hồng Quân** | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@069*7W` |
| 51 | VietA 070 | **vieta070** | **Nguyễn Thanh Hải** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@070*7W` |
| 52 | VietA 071 | **vieta071** | **Nguyễn Dương Tiển** | Xưởng sản xuất nệm | Nhân viên vô áo | `VietA#Emp@071*7W` |
| 53 | VietA 074 | **vieta074** | **Nguyễn Thị Ngọc Huệ** | Xưởng sản xuất nệm | Nhân viên cắt vải | `VietA#Emp@074*7W` |
| 54 | VietA 078 | **vieta078** | **Cổ Hoàn Lâm** | Khối văn phòng | Nhân viên phòng tổ chức | `VietA#Emp@078*7W` |
| 55 | VietA 080 | **vieta080** | **Nguyễn Minh Tấn Phát** | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@080*7W` |
| 56 | VietA 081 | **vieta081** | **Trần Gia Khải** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@081*7W` |
| 57 | VietA 082 | **vieta082** | **Nguyễn Huỳnh Trung Tín** | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@082*7W` |

---

### PHẦN V: KỊCH BẢN KIỂM TRA & NGHIỆM THU TÍNH NĂNG (TEST CASES)

| STT | Tài khoản Test | Phân quyền | Hạng mục kiểm tra thực tế | Kết quả mong đợi chuẩn |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **vieta032**<br>(Trúc Xinh) | CẤP 1 - ADMIN | 1. Vào `/payroll` kiểm tra bảng lương<br>2. Vào `/employees` xem danh sách<br>3. Vào `/attendance` duyệt đơn<br>4. Vào `/kpi` chốt điểm tháng | ✓ Thấy 100% 57 nhân sự & 11 phòng ban<br>✓ Tính toán và xuất Excel lương toàn cty<br>✓ Duyệt đơn phép toàn bộ nhân viên<br>✓ Toàn quyền thiết lập & chốt KPI |
| 2 | **vieta036**<br>(Tấn Hưng) | CẤP 2 - MANAGER | 1. Vào `/payroll` xem lương phòng KD<br>2. Vào `/payroll` xem phiếu cá nhân<br>3. Thử xem lương phòng khác/BGĐ<br>4. Vào `/kpi` chấm điểm phòng KD | ✓ Thấy 7 nhân sự Phòng Kinh doanh<br>✓ Xem được phiếu lương của chính mình<br>🔒 Ẩn hoàn toàn lương Ban Giám Đốc & phòng khác<br>✓ Chấm điểm đúng 7 nhân sự kinh doanh |
| 3 | **vieta003**<br>(Thu Tâm) | CẤP 2 - MANAGER | 1. Vào `/attendance` chấm công kho<br>2. Vào `/kpi` chấm điểm tháng<br>3. Vào `/payroll` kiểm tra lương | ✓ Quản lý đúng 7 nhân sự Kho Cần Thơ<br>✓ Chấm điểm KPI đúng nhân viên kho<br>✓ Chỉ thấy bảng lương Kho Cần Thơ |
| 4 | **vieta004**<br>(Thúy Vy) | CẤP 3 - EMPLOYEE | 1. Vào `/payroll` xem bảng lương<br>2. Vào `/attendance` gửi đơn phép<br>3. Thử tìm menu `/kpi` và `/employees`<br>4. Vào `/innovations` gửi sáng kiến | ✓ Chỉ thấy duy nhất 1 phiếu lương của mình<br>✓ Gửi đơn phép thành công về Trưởng phòng<br>🔒 Ẩn hoàn toàn menu KPI & menu Hồ sơ nhân viên<br>✓ Gửi được sáng kiến ẩn danh/hiện danh |

---

### PHẦN VI: BIÊN BẢN KÝ NHẬN VÀ BÀN GIAO

*Hôm nay, ngày 24 tháng 9 năm 2026, tại Văn phòng Công ty TNHH Thương mại Sản xuất Nệm Việt Á, hai bên thống nhất bàn giao và tiếp nhận toàn bộ hệ thống phần mềm Quản trị Nhân sự & Tiền lương (Viet A HRM), danh sách tài khoản, mật khẩu và ma trận phân quyền để đưa vào vận hành thử nghiệm.*

| ĐẠI DIỆN BÊN BÀN GIAO (IT) | ĐẠI DIỆN BÊN TIẾP NHẬN (PHÒNG HCNS) |
| :---: | :---: |
| *(Ký, ghi rõ họ tên)*<br><br><br><br><br>**Phan Tuấn Kiệt** | *(Ký, ghi rõ họ tên)*<br><br><br><br><br>**Huỳnh Thị Trúc Xinh** |
