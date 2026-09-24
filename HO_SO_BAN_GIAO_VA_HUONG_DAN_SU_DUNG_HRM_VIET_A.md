# 📑 HỒ SƠ BÀN GIAO TOÀN DIỆN & HƯỚNG DẪN VẬN HÀNH HỆ THỐNG HRM
**CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT NỆM VIỆT Á**  
*Ngày bàn giao: 24/09/2026*  
*Đại diện bàn giao (IT): Phan Tuấn Kiệt*  
*Đại diện tiếp nhận (HCNS): Huỳnh Thị Trúc Xinh*  

---

## 🌐 PHẦN I: THÔNG TIN TRUY CẬP & QUY TẮC ĐĂNG NHẬP 1 CÁCH DUY NHẤT

* **Tên phần mềm:** Hệ thống Quản trị Nhân sự & Tiền lương Nệm Việt Á (Viet A HRM).
* **Đường dẫn Cloud (Chính thức):** [https://hrmvieta.up.railway.app](https://hrmvieta.up.railway.app)
* **Đường dẫn nội bộ Local:** `http://localhost:5173`
* **Quy mô:** Toàn bộ 11 phòng ban/kho/xưởng và 57 nhân sự công ty.
* **QUY TẮC ĐĂNG NHẬP 1 CÁCH DUY NHẤT:**
  * Tất cả nhân sự đăng nhập **DUY NHẤT** theo cú pháp: `vieta` + [Mã số 3 chữ số] (chữ thường, viết liền không dấu, không cách).
  * Ví dụ: `vieta002`, `vieta032`, `vieta036`, `vieta004`, `vieta082`.
  * Không sử dụng bất kỳ tên tài khoản alias nào khác.
* **QUY TẮC MẬT KHẨU BẢO MẬT CAO:**
  * Mỗi nhân sự được cấp 1 mật khẩu riêng biệt (chữ HOA + chữ thường + số + ký tự đặc biệt), không thể đoán của nhau.

---

## 🔐 PHẦN II: MA TRẬN PHÂN QUYỀN CHI TIẾT (XEM GÌ & LÀM ĐƯỢC GÌ)

| Cấp độ | Đối tượng | PHẦN ĐƯỢC PHÉP XEM (READ) | PHẦN ĐƯỢC PHÉP THỰC HIỆN (ACTION) |
| :--- | :--- | :--- | :--- |
| **CẤP 1 - ADMIN**<br>*(Toàn quyền quản trị)* | • Võ Minh Cường (Phó GĐ)<br>• Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS)<br>• Phan Tuấn Kiệt (IT/Marketing) | ✓ Xem toàn bộ 11 phòng ban/kho/xưởng<br>✓ Xem 100% hồ sơ & hợp đồng nhân sự<br>✓ Xem bảng chấm công toàn công ty<br>✓ Xem toàn bộ điểm KPI các phòng ban<br>✓ **XEM 100% BẢNG LƯƠNG TOÀN CÔNG TY**<br>✓ Xem báo cáo thống kê & nhật ký audit log | ✓ Thêm, sửa, xóa hồ sơ nhân viên<br>✓ Tạo, gia hạn & in hợp đồng lao động<br>✓ Phê duyệt đơn nghỉ phép / OT toàn cty<br>✓ Thiết lập chỉ tiêu & chốt điểm KPI tháng<br>✓ **TÍNH TOÁN, KHÓA & XUẤT BẢNG LƯƠNG**<br>✓ Quản trị tài khoản, phân quyền & sao lưu |
| **CẤP 2 - MANAGER**<br>*(Trưởng phòng / Quản lý)* | • 8 Quản lý bộ phận:<br>- Thu Tâm (Kho Cần Thơ)<br>- Tuyết Hường (Kho Mỹ Tho)<br>- Quốc Hùng (Kế toán)<br>- Huy Hoàng (R&D)<br>- Tấn Hưng (Kinh doanh)<br>- Thái Cần (Xưởng gối)<br>- Minh Lý (Xưởng nệm)<br>- Bảo Châu (Kế toán xưởng) | ✓ Xem danh sách nhân viên phòng mình<br>✓ Xem bảng chấm công phòng mình phụ trách<br>✓ Xem chi tiết KPI nhân viên phòng mình<br>✓ **XEM BẢNG LƯƠNG NHÂN VIÊN PHÒNG MÌNH**<br>✓ Xem phiếu lương cá nhân của chính mình<br>🔒 **TUYỆT ĐỐI KHÔNG xem lương Ban Giám Đốc**<br>🔒 **KHÔNG xem lương phòng ban khác** | ✓ Điểm danh & chấm công nhân viên phòng mình<br>✓ Phê duyệt đơn xin nghỉ phép / OT của cấp dưới<br>✓ Chấm điểm & đánh giá % KPI tháng của nhân viên<br>✓ Đề xuất khen thưởng / kỷ luật cho nhân viên<br>✓ Tạo yêu cầu cấp phát & báo hỏng tài sản phòng |
| **CẤP 3 - EMPLOYEE**<br>*(Nhân viên)* | • Toàn bộ 46 nhân sự còn lại trong công ty | ✓ Xem thông tin hồ sơ cá nhân (Profile)<br>✓ Xem lịch sử chấm công & ngày phép cá nhân<br>✓ **XEM DUY NHẤT PHIẾU LƯƠNG CÁ NHÂN**<br>✓ Xem Sơ đồ tổ chức<br>✓ Xem Văn bản, quy định & tài sản được cấp<br>🔒 **TUYỆT ĐỐI KHÔNG XEM ĐƯỢC KPI (của mình & người khác)**<br>🔒 **TUYỆT ĐỐI KHÔNG XEM ĐƯỢC DANH SÁCH NHÂN VIÊN TRONG CÔNG TY**<br>🔒 **ẨN 100% MỨC LƯƠNG CỦA TẤT CẢ NGƯỜI KHÁC** | ✓ Thực hiện điểm danh chấm công hàng ngày<br>✓ Gửi đơn xin nghỉ phép, đi muộn, làm thêm giờ<br>✓ Gửi ý kiến đề xuất tại Hòm thư & Sáng kiến<br>✓ Báo hỏng công cụ dụng cụ / tài sản được giao<br>✓ Tự đổi mật khẩu tài khoản cá nhân |

---

## 📋 PHẦN III: HƯỚNG DẪN SỬ DỤNG VÀ VẬN HÀNH 8 PHÂN HỆ NGHIỆP VỤ CHO PHÒNG HCNS

### 🔹 1. Quản lý Hồ sơ nhân sự & 📄 Tự động in Hợp đồng lao động chuẩn (`/employees`, `/contracts`)
* **Hồ sơ nhân sự (`/employees`):** Xem danh sách 57 nhân sự, tìm kiếm theo phòng ban/tên/mã số, thêm nhân viên mới, phân ngạch bậc lương.
* **Tự động in Hợp đồng lao động (`/contracts`):** Chọn nhân viên -> Nhấn nút **"In Hợp đồng lao động"**. Hệ thống tự động điền Họ tên, CCCD, địa chỉ, ngạch bậc lương, phụ cấp, chức danh, người đại diện công ty và xuất ra file Word (.docx) hoặc in trực tiếp PDF chuẩn mẫu quy chế công ty.

### 🔹 2. Chấm công, Quản lý Nghỉ phép & Làm thêm giờ (`/attendance`)
* **Bảng chấm công tổng hợp:** Theo dõi dữ liệu 26 ngày công chuẩn theo từng tháng, tự động tính số ngày làm việc thực tế, số ngày nghỉ phép năm, nghỉ không lương, giờ đi muộn/về sớm.
* **Phê duyệt đơn từ trực tuyến:** Vào tab *Đơn xin nghỉ phép / Đi muộn / OT* -> Quản lý hoặc HCNS nhấn **Duyệt (Approve)** hoặc **Từ chối (Reject)** kèm lý do phản hồi cho nhân viên.
* **Chốt công tháng:** Nhấn nút **"Đồng bộ bảng công"** trước khi tính lương để chuyển số ngày công thực tế và giờ OT sang phân hệ Tính lương.

### 🔹 3. Quản lý KPI & Đánh giá tháng (`/kpi`)
* Chọn tháng đánh giá (ví dụ: Tháng 08/2026).
* Thiết lập hạn mức KPI trách nhiệm theo chức vụ (1.000.000đ, 2.000.000đ,...).
* Nhập tỷ lệ hoàn thành (%) -> Hệ thống tự động tính thưởng trách nhiệm thực nhận và thưởng hiệu suất (Performance Bonus).

### 🔹 4. Tính toán & Xuất Bảng lương (`/payroll`)
1. **Bước 1:** Chọn Tháng và Năm cần lập bảng lương.
2. **Bước 2:** Nhấn **"Tính lương tự động"** (hệ thống tự lấy Lương ngạch bậc theo ngày công + Tiền OT x1.5 + KPI + Phụ cấp - BHXH 10.5% - Công đoàn 1% - Tạm ứng/Giảm trừ).
3. **Bước 3:** Kiểm tra tổng quỹ lương theo từng phòng ban tại bảng tổng hợp.
4. **Bước 4:** Nhấn **"Xuất Bảng Lương Excel"** để lưu trữ hoặc trình Ban Giám Đốc phê duyệt.
5. **Bước 5:** Nhấn **"Gửi phiếu lương"** để nhân viên tự tra cứu trên tài khoản cá nhân.

### 🔹 5. 💡 Hòm thư & Sáng kiến cải tiến sản xuất (`/innovations`)
* **Mục đích:** Khuyến khích công nhân viên tại các xưởng sản xuất nệm/gối, kho bãi và văn phòng đóng góp các ý tưởng cải tiến kỹ thuật, tiết kiệm nguyên vật liệu, nâng cao năng suất và an toàn lao động.
* **Nhân viên gửi sáng kiến:** Gửi ý tưởng kèm mô tả hiệu quả dự kiến, đính kèm hình ảnh/tài liệu và chọn chế độ Gửi ẩn danh hoặc Công khai.
* **Thẩm định & Duyệt thưởng:** Ban Giám Đốc và HCNS tiếp nhận đề xuất, đánh giá tính khả thi và duyệt mức **Thưởng sáng kiến** -> Tiền thưởng tự động được cộng vào kỳ lương của nhân viên.

### 🔹 6. 📦 Quản lý Tài sản & Công cụ dụng cụ (CCDC) (`/assets`)
* **Quản lý danh mục tài sản:** Theo dõi máy móc xưởng nệm/gối, xe tải giao hàng kho Cần Thơ/Mỹ Tho, máy tính văn phòng, tình trạng sử dụng, thời gian khấu hao và giá trị còn lại.
* **Cấp phát & Báo hỏng:** Cấp phát tài sản cho nhân viên/phòng ban. Khi có sự cố hỏng hóc, nhân viên tạo **Phiếu báo hỏng** trực tuyến; bộ phận kỹ thuật tiếp nhận xử lý và cập nhật tiến độ sửa chữa/thay thế.

### 🔹 7. 🏆 Khen thưởng & Kỷ luật (Đồng bộ Bảng lương) (`/rewards`)
* **Khen thưởng:** Ban hành quyết định khen thưởng cá nhân/tập thể xuất sắc, khen thưởng đột xuất -> Tiền thưởng tự động cộng vào cột Thưởng khác trên Bảng lương.
* **Kỷ luật:** Ghi nhận biên bản vi phạm nội quy, an toàn lao động kèm số tiền phạt -> Tiền phạt tự động trừ vào cột Giảm trừ kỷ luật trên Bảng lương.

### 🔹 8. 🌳 Sơ đồ tổ chức động & Danh bạ công ty (`/settings/departments-positions`, `/employees`)
* **Trực quan hóa bộ máy:** Hiển thị cây phả hệ tổ chức toàn diện từ Ban Giám Đốc -> Khối Văn phòng, Kho Cần Thơ, Kho Mỹ Tho, Xưởng Nệm, Xưởng Gối, Phòng Kinh doanh, Phòng Marketing.
* **Cơ cấu nhân sự:** Tra cứu nhanh số lượng nhân sự, danh sách chức danh và nhân viên trực thuộc từng phòng ban theo thời gian thực.

---

## 📊 PHẦN IV: DANH SÁCH CHI TIẾT 57 TÀI KHOẢN ĐĂNG NHẬP

### 1. CẤP 1 - ADMIN (3 Tài khoản Toàn quyền)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `VietA 002` | **`vieta002`** | **Võ Minh Cường** | Ban giám đốc | Phó Giám đốc | `VietA#Admin@002!8X` |
| 2 | `VietA 032` | **`vieta032`** | **Huỳnh Thị Trúc Xinh** | Khối văn phòng | Trưởng phòng HCNS | `VietA#Admin@032!8X` |
| 3 | `VietA 043` | **`vieta043`** | **Phan Tuấn Kiệt** | Phòng Marketing | Trưởng phòng Marketing | `VietA#Admin@043!8X` |

### 2. CẤP 2 - MANAGER (8 Tài khoản Trưởng phòng / Quản lý)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `VietA 003` | **`vieta003`** | **Nguyễn Thị Thu Tâm** | Kho Cần Thơ | Quản lý kho Cần Thơ | `VietA#Mgr@003$9Q` |
| 2 | `VietA 015` | **`vieta015`** | **Dương Thị Tuyết Hường** | Kho Mỹ Tho | Quản lý kho Mỹ Tho | `VietA#Mgr@015$9Q` |
| 3 | `VietA 031` | **`vieta031`** | **Nguyễn Quốc Hùng** | Khối văn phòng | Trưởng phòng kế toán | `VietA#Mgr@031$9Q` |
| 4 | `VietA 035` | **`vieta035`** | **Lê Huy Hoàng** | Khối văn phòng | Trưởng phòng R&D | `VietA#Mgr@035$9Q` |
| 5 | `VietA 036` | **`vieta036`** | **Phạm Tấn Hưng** | Phòng kinh doanh | Trưởng phòng kinh doanh | `VietA#Mgr@036$9Q` |
| 6 | `VietA 046` | **`vieta046`** | **Nguyễn Thái Cần** | Xưởng sản xuất gối | Trưởng nhóm thổi gối | `VietA#Mgr@046$9Q` |
| 7 | `VietA 050` | **`vieta050`** | **Trần Minh Lý** | Xưởng sản xuất nệm | Quản lý xưởng | `VietA#Mgr@050$9Q` |
| 8 | `VietA 056` | **`vieta056`** | **Trần Thị Bảo Châu** | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Mgr@056$9Q` |

### 3. CẤP 3 - EMPLOYEE (46 Tài khoản Nhân viên)
| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `VietA 004` | **`vieta004`** | Nguyễn Thị Thúy Vy | Khối văn phòng | Kế toán thu mua | `VietA#Emp@004*7W` |
| 2 | `VietA 006` | **`vieta006`** | Phạm Thanh Phong | Kho Cần Thơ | Kế toán kho Cần Thơ | `VietA#Emp@006*7W` |
| 3 | `VietA 007` | **`vieta007`** | Trần Thanh Hoài | Kho Cần Thơ | Tài xế Cần Thơ | `VietA#Emp@007*7W` |
| 4 | `VietA 009` | **`vieta009`** | Huỳnh Ngọc Dư | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@009*7W` |
| 5 | `VietA 010` | **`vieta010`** | Nguyễn Hải Duy | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@010*7W` |
| 6 | `VietA 011` | **`vieta011`** | Lý Minh Trung | Kho Cần Thơ | Nhân viên kho Cần Thơ | `VietA#Emp@011*7W` |
| 7 | `VietA 012` | **`vieta012`** | Võ Huỳnh Đông Nghi | Xưởng sản xuất nệm | Phó quản lý xưởng | `VietA#Emp@012*7W` |
| 8 | `VietA 013` | **`vieta013`** | Hồ Minh Thuận | Kho Cần Thơ | Nhân viên giao hàng Cần Thơ | `VietA#Emp@013*7W` |
| 9 | `VietA 016` | **`vieta016`** | Nguyễn Thị Huỳnh Như | Kho Mỹ Tho | Phó quản lý kho Mỹ Tho | `VietA#Emp@016*7W` |
| 10 | `VietA 017` | **`vieta017`** | Trần Lương Ngọc Khánh | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@017*7W` |
| 11 | `VietA 018` | **`vieta018`** | Tạ Thị Ngọc Trâm | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@018*7W` |
| 12 | `VietA 019` | **`vieta019`** | Đoàn Hoài Linh | Kho Mỹ Tho | Đội trưởng đội tài xế | `VietA#Emp@019*7W` |
| 13 | `VietA 020` | **`vieta020`** | Đặng Hoàng Tuấn | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@020*7W` |
| 14 | `VietA 022` | **`vieta022`** | Nguyễn Tuấn Kiệt | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@022*7W` |
| 15 | `VietA 023` | **`vieta023`** | Nguyễn Hoàng Quân | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@023*7W` |
| 16 | `VietA 024` | **`vieta024`** | Nguyễn Hữu Tài | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@024*7W` |
| 17 | `VietA 026` | **`vieta026`** | Phạm Minh Phúc | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@026*7W` |
| 18 | `VietA 027` | **`vieta027`** | Phạm Ngọc Hiển | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@027*7W` |
| 19 | `VietA 028` | **`vieta028`** | Trần Hữu Lộc | Kho Mỹ Tho | Nhân viên kho Mỹ Tho | `VietA#Emp@028*7W` |
| 20 | `VietA 029` | **`vieta029`** | Nguyễn Thị Thanh Tú | Kho Mỹ Tho | Kế toán kho Mỹ Tho | `VietA#Emp@029*7W` |
| 21 | `VietA 033` | **`vieta033`** | Nguyễn Quốc Huy | Khối văn phòng | Trợ lý Giám đốc | `VietA#Emp@033*7W` |
| 22 | `VietA 034` | **`vieta034`** | Lê Thị Mỹ Phúc | Khối văn phòng | Kế toán viên | `VietA#Emp@034*7W` |
| 23 | `VietA 037` | **`vieta037`** | Nguyễn Thị Kim Hoàng | Phòng kinh doanh | Kế toán kinh doanh | `VietA#Emp@037*7W` |
| 24 | `VietA 038` | **`vieta038`** | Phạm Thị Xuân Khoa | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@038*7W` |
| 25 | `VietA 040` | **`vieta040`** | Võ Thanh Sơn | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@040*7W` |
| 26 | `VietA 041` | **`vieta041`** | Phạm Phước Lành | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@041*7W` |
| 27 | `VietA 042` | **`vieta042`** | Ngô Thanh Tín | Phòng kinh doanh | Nhân viên kinh doanh | `VietA#Emp@042*7W` |
| 28 | `VietA 047` | **`vieta047`** | Nguyễn Thành Lợi | Xưởng sản xuất gối | Nhân viên thổi gối | `VietA#Emp@047*7W` |
| 29 | `VietA 049` | **`vieta049`** | Nguyễn Thị Ngọc | Xưởng sản xuất gối | Nhân viên may gối | `VietA#Emp@049*7W` |
| 30 | `VietA 052` | **`vieta052`** | Nguyễn Minh Văn | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@052*7W` |
| 31 | `VietA 053` | **`vieta053`** | Trịnh Dương Minh Nhựt | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@053*7W` |
| 32 | `VietA 054` | **`vieta054`** | Võ Hoàng Tín | Xưởng sản xuất nệm | Nhân viên may viền | `VietA#Emp@054*7W` |
| 33 | `VietA 055` | **`vieta055`** | Phan Quốc Khôi | Xưởng sản xuất nệm | Tài xế xưởng sản xuất | `VietA#Emp@055*7W` |
| 34 | `VietA 058` | **`vieta058`** | Nguyễn Thị Kim Hòa | Xưởng sản xuất nệm | Nhân viên may tay | `VietA#Emp@058*7W` |
| 35 | `VietA 060` | **`vieta060`** | Trần Thị Kim Quyên | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@060*7W` |
| 36 | `VietA 061` | **`vieta061`** | Lê Thanh Hồng | Xưởng sản xuất nệm | Nhân viên may một kim | `VietA#Emp@061*7W` |
| 37 | `VietA 063` | **`vieta063`** | Lê Ngọc Tuấn | Xưởng sản xuất nệm | Nhân viên vô vali | `VietA#Emp@063*7W` |
| 38 | `VietA 066` | **`vieta066`** | Nguyễn Thị Thùy Trang | Xưởng sản xuất nệm | Kế toán xưởng sản xuất | `VietA#Emp@066*7W` |
| 39 | `VietA 069` | **`vieta069`** | Trương Hồng Quân | Kho Mỹ Tho | Tài xế Mỹ Tho | `VietA#Emp@069*7W` |
| 40 | `VietA 070` | **`vieta070`** | Nguyễn Thanh Hải | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@070*7W` |
| 41 | `VietA 071` | **`vieta071`** | Nguyễn Dương Tiển | Xưởng sản xuất nệm | Nhân viên vô áo | `VietA#Emp@071*7W` |
| 42 | `VietA 074` | **`vieta074`** | Nguyễn Thị Ngọc Huệ | Xưởng sản xuất nệm | Nhân viên cắt vải | `VietA#Emp@074*7W` |
| 43 | `VietA 078` | **`vieta078`** | Cổ Hoàn Lâm | Khối văn phòng | Nhân viên phòng tổ chức | `VietA#Emp@078*7W` |
| 44 | `VietA 080` | **`vieta080`** | Nguyễn Minh Tấn Phát | Xưởng sản xuất nệm | Nhân viên phun keo | `VietA#Emp@080*7W` |
| 45 | `VietA 081` | **`vieta081`** | Trần Gia Khải | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@081*7W` |
| 46 | `VietA 082` | **`vieta082`** | Nguyễn Huỳnh Trung Tín | Kho Mỹ Tho | Nhân viên giao hàng Mỹ Tho | `VietA#Emp@082*7W` |

---

## 🧪 PHẦN V: KỊCH BẢN KIỂM TRA NGHIỆM THU (TEST CASES CHECKLIST)

| STT | Tài khoản đăng nhập thử | Cấp phân quyền | Các bước kiểm tra thực tế | Kết quả mong đợi chuẩn |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`vieta032`**<br>*(Huỳnh Thị Trúc Xinh)* | **CẤP 1 - ADMIN** | 1. Vào `/payroll` kiểm tra bảng lương.<br>2. Vào `/employees` xem danh sách.<br>3. Vào `/attendance` xem bảng công và duyệt đơn. | ✓ Thấy 100% 57 nhân sự và đủ 11 phòng ban.<br>✓ Tính và xuất được Bảng lương toàn công ty.<br>✓ Duyệt được tất cả đơn từ. |
| **2** | **`vieta036`**<br>*(Phạm Tấn Hưng)* | **CẤP 2 - MANAGER** | 1. Vào `/payroll` xem tab *Lương phòng ban*.<br>2. Vào `/payroll` xem tab *Phiếu lương cá nhân*.<br>3. Kiểm tra xem có thấy lương BGĐ hoặc phòng khác không. | ✓ Thấy đúng 7 nhân sự Phòng Kinh doanh.<br>✓ Xem được phiếu lương của chính mình.<br>🔒 **Ẩn hoàn toàn lương Ban Giám Đốc và phòng khác.** |
| **3** | **`vieta003`**<br>*(Nguyễn Thị Thu Tâm)* | **CẤP 2 - MANAGER** | 1. Vào `/attendance` chấm công.<br>2. Vào `/kpi` chấm điểm KPI tháng.<br>3. Vào `/payroll` kiểm tra. | ✓ Quản lý đúng 7 nhân sự Kho Cần Thơ.<br>✓ Chấm điểm KPI đúng nhân viên kho.<br>✓ Chỉ thấy bảng lương Kho Cần Thơ. |
| **4** | **`vieta004`**<br>*(Nguyễn Thị Thúy Vy)* | **CẤP 3 - EMPLOYEE** | 1. Vào `/payroll` xem bảng lương.<br>2. Vào `/attendance` gửi đơn xin nghỉ phép.<br>3. Vào `/employees` tra cứu danh bạ. | ✓ Chỉ hiển thị duy nhất 1 phiếu lương của bản thân.<br>✓ Gửi đơn phép thành công đến Trưởng phòng duyệt.<br>🔒 **Ẩn 100% mức lương của tất cả người khác.** |

---

## 📎 FILE WORD GỐC ĐÍNH KÈM:
* 📄 **File Word duy nhất đã tạo:** [HO_SO_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx](file:///d:/HR%20N%E1%BB%86M%20VI%E1%BB%86T%20%C3%81/HO_SO_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx)
* 📍 **Vị trí lưu file:** `D:\HR NỆM VIỆT Á\HO_SO_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx`
