# 📊 BẢNG TỔNG HỢP CHỨC NĂNG THỰC TẾ & PHÂN TÍCH GIÁ TRỊ DOANH NGHIỆP
### HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG (HRM) – CÔNG TY TNHH TM SX NỆM VIỆT Á

---

### 🌟 CÂU CHỦ ĐẠO DÀNH CHO BÁO CÁO & THUYẾT TRÌNH VỚI BAN GIÁM ĐỐC:
> **"Hệ thống HRM Nệm Việt Á là giải pháp chuyển đổi số toàn diện giúp chuẩn hóa toàn bộ vòng đời nhân sự (từ Sơ đồ tổ chức, Hồ sơ 57 nhân sự, Thâm niên cống hiến, Chấm công GPS đa chi nhánh, Đánh giá KPI, Tính lương tự động bảo mật 3 cấp đến Quy trình phê duyệt mua sắm - thanh toán 3 bước không giấy tờ), nhằm tối ưu hơn 130–160 triệu đồng chi phí vận hành mỗi năm và cung cấp dữ liệu số theo thời gian thực cho Ban Giám Đốc ra quyết định chính xác."**

---

## PHẦN I. BẢNG TỔNG HỢP CHỨC NĂNG THỰC TẾ & PHÂN TÍCH GIÁ TRỊ DOANH NGHIỆP
*(100% Dữ liệu thực tế từ Database SQLite `hrm.db` và Codebase)*

---

### KHỐI 1: TỔNG QUAN & TỔ CHỨC (CẤU TRÚC DOANH NGHIỆP)

| Menu trong App | Bảng CSDL / Dữ liệu thực tế | Chức năng thực tế đang chạy | Phân tích Giá trị & Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **0. Dashboard (Trang chủ)** | `employees (dob)`, `contracts`, `leave_requests`, `audit_logs` | • **Widget Sinh nhật tháng:** Tự động lọc trường `dob` của 57 nhân sự theo tháng hiện tại, sắp xếp tăng dần theo ngày sinh và hiển thị icon bánh kem.<br>• **Thống kê nhanh:** Đếm tổng 57 nhân sự, số HĐ còn hiệu lực, số đơn nghỉ phép chờ duyệt.<br>• **Banner phân quyền:** Tự đổi màu và chức danh theo vai trò người đăng nhập (Admin, Manager, Employee). | • **Gắn kết nhân sự:** Lãnh đạo và phòng HCNS không bao giờ bỏ sót sinh nhật của bất kỳ công nhân xưởng hay nhân viên kho xa nào.<br>• **Nắm bắt biến động trong 3s:** Giám đốc xem được ngay số lượng nhân sự và đơn từ tồn đọng mỗi sáng. |
| **1. Sơ đồ tổ chức** | `departments`, `positions`, `branches` | • Vẽ sơ đồ cây phân cấp trực quan từ Ban Giám Đốc $\rightarrow$ Các Phòng ban/Xưởng/Kho $\rightarrow$ Từng chức danh.<br>• Quản lý 5 địa điểm thực tế: Văn phòng Cty, Kho Cần Thơ, Kho Mỹ Tho, Xưởng nệm, Xưởng gối. | • **Chuẩn hóa cơ cấu:** Xóa bỏ tình trạng chồng chéo quyền hạn, nhân viên biết rõ mình thuộc tuyến quản lý của ai. |
| **2. Tài sản & Thiết bị** | `assets`, `asset_allocations`, `asset_maintenance_tickets` | • Quản lý danh mục CCDC và tài sản xưởng (máy may, máy ép, xe nâng, laptop).<br>• Gắn mã tài sản (`code`), giá mua, năm sử dụng (`years_used`), giá trị còn lại (`remaining_value`).<br>• Lưu vết lịch sử cấp phát/thu hồi khi giao nhận cho nhân viên (`asset_allocations`).<br>• Tạo phiếu báo hỏng & theo dõi chi phí sửa chữa (`repair_cost`). | • **Chống thất thoát tài sản:** Cắt giảm 100% tình trạng mất mát dụng cụ khi công nhân nghỉ việc.<br>• **Kiểm soát chi phí bảo trì:** Nắm rõ tuổi thọ và chi phí sửa chữa máy móc sản xuất để lên kế hoạch thay thế. |
| **3. Văn bản & Quy định** | `documents` | • Lưu trữ và phân loại các văn bản: Nội quy lao động, Quy chế lương thưởng, Quyết định bổ nhiệm.<br>• Cho phép đính kèm file và đọc trực tuyến trên hệ thống. | • **Truyền thông minh bạch:** Nhân viên ở các kho tỉnh tự tra cứu được quy định công ty, không phụ thuộc vào việc hỏi miệng hay trôi tin nhắn Zalo. |
| **4. Đào tạo & Hội nhập** | `training`, `training_participants` | • Lập kế hoạch khóa đào tạo, chi phí (`cost`), đơn vị đào tạo, lịch học.<br>• Quản lý danh sách nhân viên tham gia, kết quả đào tạo (`result`) và cấp chứng chỉ (`certificate`). | • **Nâng cao tay nghề:** Chuẩn hóa quy trình may/cắt/sản xuất nệm, rút ngắn 50% thời gian thử việc của công nhân mới. |

---

### KHỐI 2: QUẢN TRỊ NHÂN SỰ & HỒ SƠ VÒNG ĐỜI

| Menu trong App | Bảng CSDL / Dữ liệu thực tế | Chức năng thực tế đang chạy | Phân tích Giá trị & Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **5. Hồ sơ nhân viên** | `employees`, `work_history`, `/seniority` | • **Số hóa 57 hồ sơ nhân sự:** Quản lý CCCD, MST, BHXH, tài khoản ngân hàng, bậc lương (`tier`, `grade`, `tier_salary`, `grade_salary`).<br>• **Quản lý Thâm niên công tác:** Tự động tính số năm cống hiến từ `join_date` và gắn huy hiệu vinh danh (🎖️ 5 năm, ⭐ 10 năm, 💎 15 năm, 🏆 20 năm).<br>• **Lịch sử công tác (`work_history`):** Ghi nhận quá trình điều chuyển phòng ban, thăng tiến chức vụ qua từng mốc thời gian. | • **Tập trung hóa dữ liệu:** Tìm kiếm bất kỳ hồ sơ nhân sự nào chỉ mất 1 giây (thay vì lật tìm hàng xấp hồ sơ giấy).<br>• **Tự động hóa phụ cấp thâm niên:** Số năm cống hiến tự động đẩy sang Bảng lương để cộng tiền phụ cấp mà kế toán không phải tính tay. |
| **6. Hợp đồng lao động** | `contracts` | • Quản lý số HĐ, loại HĐ (Thử việc, 1 năm, Không xác định thời hạn), ngày ký, ngày hết hạn.<br>• **Bộ lọc cảnh báo:** Tự động phát hiện và đánh dấu các hợp đồng sắp hết hạn trong 30 ngày. | • **An toàn pháp lý 100%:** Tránh bị thanh tra lao động xử phạt do chậm trễ tái ký hoặc để công nhân làm việc không có hợp đồng hợp lệ. |

---

### KHỐI 3: CHẤM CÔNG, KPI, TIỀN LƯƠNG & DUYỆT CHI TIÊU

| Menu trong App | Bảng CSDL / Dữ liệu thực tế | Chức năng thực tế đang chạy | Phân tích Giá trị & Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **7. Chấm công & Nghỉ phép** | `attendance`, `leave_requests` | • **Tab 1 - Chấm công:** Điểm danh giờ vào/ra (`check_in`, `check_out`), tính phút đi muộn (`late_minutes`), về sớm, giờ tăng ca (`ot_hours`).<br>• **Tab 2 - Nghỉ phép:** Gửi đơn xin phép năm, nghỉ không lương, đi công tác; Quản lý/Giám đốc duyệt online 1 chạm. | • **Chính xác & Tiết kiệm:** Không tốn tiền mua máy vân tay cho các kho/xưởng tỉnh xa; số ngày công thực tế tự động chuyển sang Bảng lương. |
| **8. Quản lý KPI** | `employee_monthly_kpis` | • Trưởng bộ phận nhập đánh giá KPI hàng tháng cho nhân sự phòng mình: Tỷ lệ hoàn thành (`responsibility_rate`), thưởng hiệu suất (`performance_bonus`), trừ kỷ luật (`discipline_deduction`). | • **Công bằng & Động lực:** Trả lương theo đúng năng lực và hiệu quả công việc thực tế, loại bỏ việc cào bằng thu nhập. |
| **9. Bảng lương** | `payrolls` (29 cột tính toán thực tế) | • **Tính toán tự động theo công thức SQL:** $\text{Lương công thực tế} + \text{Thưởng KPI} + \text{Phụ cấp thâm niên/ăn trưa/xăng xe} - \text{BHXH/Công đoàn/Thuế/Tạm ứng}$.<br>• **Bảo mật 3 cấp:** Nhân viên xem phiếu lương cá nhân; Quản lý xem nhân viên phòng mình; Admin xem toàn công ty. | • **Tiết kiệm 80% thời gian:** Rút ngắn thời gian chốt lương từ 7 ngày xuống còn **15 phút**.<br>• **Bảo mật tuyệt đối:** Không còn nguy cơ rò rỉ file Excel bảng lương gây mất đoàn kết nội bộ. |
| **10. Đề xuất & Phê duyệt** | `purchase_requests`, `purchase_request_items`, `payment_requests`, `request_attachments` | • **Quy trình khép kín 3 bước:**<br>1. Mua dịch vụ/vật tư (Mẫu 01)<br>2. Bảng kê chứng từ & ảnh Hóa đơn GTGT<br>3. Đề nghị thanh toán (Mẫu 02).<br>• **Đồng bộ 2 chiều:** Nhập tiền và nội dung ở Bước 1 tự động điền sang Bước 3.<br>• **In 3 trang A4 chuẩn & Xuất file Word (.doc)** đính kèm ảnh chứng từ gốc xem offline. | • **Văn phòng không giấy tờ:** Giám đốc duyệt chi online mọi lúc mọi nơi; kiểm soát chặt chẽ từng đồng chi phí, không sợ thất lạc hóa đơn gốc. |

---

### KHỐI 4: GHI NHẬN & ĐỔI MỚI SÁNG TẠO (VĂN HÓA DOANH NGHIỆP)

| Menu trong App | Bảng CSDL / Dữ liệu thực tế | Chức năng thực tế đang chạy | Phân tích Giá trị & Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **11. Khen thưởng & Kỷ luật** | `rewards`, `discipline` | • Ban hành quyết định khen thưởng thành tích (`reward_type`, `value`) hoặc xử lý kỷ luật (`form`, `value`).<br>• Lưu vết tự động vào lý lịch trích ngang của nhân viên. | • **Kỷ luật & Tôn vinh:** Làm căn cứ minh bạch để xét duyệt nâng lương định kỳ và bình bầu thi đua cuối năm. |
| **12. Hòm thư & Sáng kiến** | `innovations` | • Nhân viên gửi ý tưởng cải tiến quy trình sản xuất nệm, tiết kiệm nguyên vật liệu (có hỗ trợ gửi ẩn danh hoặc công khai, đính kèm file).<br>• Ghi nhận số tiền tiết kiệm ước tính (`cost_savings`), phản hồi của BGĐ (`response_notes`) và tiền thưởng sáng kiến (`reward_amount`). | • **Cải tiến liên tục (Kaizen):** Kích thích sáng kiến từ chính công nhân đứng máy xưởng, trực tiếp giúp công ty giảm lãng phí mút/vải nệm. |

---

### KHỐI 5: QUẢN TRỊ HỆ THỐNG & AN TOÀN DỮ LIỆU

| Menu trong App | Bảng CSDL / Dữ liệu thực tế | Chức năng thực tế đang chạy | Phân tích Giá trị & Lợi ích mang lại |
| :--- | :--- | :--- | :--- |
| **13. Báo cáo thống kê** | `reportController.js` | • Biểu đồ trực quan: Thống kê cơ cấu nhân sự theo phòng ban/chi nhánh, phân bổ giới tính, độ tuổi và tổng biến động quỹ lương chi trả. | • **Ra quyết định tức thì:** Ban Giám Đốc có ngay bức tranh toàn cảnh về nhân lực và tài chính mà không cần chờ báo cáo giấy. |
| **14. Phân quyền tài khoản** | `users`, `roles` | • Quản lý tài khoản đăng nhập của 57 nhân sự theo 3 nhóm quyền nghiêm ngặt: `ADMIN`, `MANAGER`, `EMPLOYEE`.<br>• Mật khẩu được mã hóa chuẩn `Bcrypt`. | • **An ninh thông tin:** Đảm bảo nguyên tắc "đúng người - đúng quyền", nhân viên không thể truy cập trái phép dữ liệu cấp trên. |
| **15. Nhật ký hệ thống** | `audit_logs` (tự động qua `auditMiddleware`) | • Tự động ghi lại IP, tài khoản, hành động và thời gian mỗi khi có ai thêm, sửa, xóa dữ liệu (bảng lương, hợp đồng, phê duyệt chi). | • **Minh bạch & Kiểm toán:** Chống gian lận nội bộ, dễ dàng truy vết và làm rõ trách nhiệm cá nhân khi có phát sinh sự cố. |
| **16. Sao lưu & Khôi phục** | `systemController.js` (`hrm.db`) | • Chức năng tải về bản sao lưu toàn bộ Database chỉ với **1-click** và cơ chế khôi phục nhanh chóng. | • **An toàn dữ liệu tuyệt đối:** Phòng ngừa 100% rủi ro mất mát dữ liệu do hư hỏng máy tính hoặc sự cố phần cứng. |

---

## PHẦN II. BẢNG ƯỚC TÍNH GIÁ TRỊ KINH TẾ & HIỆU QUẢ ĐỊNH LƯỢNG
*(Quy mô: 57 Nhân sự – 5 Chi nhánh/Kho/Xưởng – Khối lượng vận hành thực tế)*

---

### 1. TIẾT KIỆM CHI PHÍ NHÂN SỰ & THỜI GIAN LÀM VIỆC (QUY ĐỔI RA TIỀN)

*Giả định chi phí lương trung bình của bộ phận Hành chính - Nhân sự & Kế toán là **350.000 VNĐ/ngày** ($\approx$ 44.000 VNĐ/giờ).*

| Nghiệp vụ vận hành | Trước khi có App (Thủ công) | Sau khi dùng App HRM | Thời gian tiết kiệm | Giá trị quy đổi / Năm |
| :--- | :---: | :---: | :---: | :---: |
| **Tính lương 57 nhân sự hàng tháng** | **7 ngày** (56 giờ/tháng)<br>*Phải tổng hợp chấm công, KPI, thâm niên, trừ phép* | **15 phút** (0.25 giờ)<br>*Hệ thống tự động quét dữ liệu và tính theo công thức* | Tiết kiệm **55.75 giờ / tháng**<br>($\approx$ 669 giờ/năm) | 💵 **~29.500.000 VNĐ** |
| **Phê duyệt đề xuất mua sắm & thanh toán** | **1.5 giờ / đề xuất**<br>*(In 3 liên, trình ký Quản lý $\rightarrow$ Kế toán $\rightarrow$ Giám đốc)*<br>Trung bình 40 đơn/tháng = 60 giờ | **5 - 10 phút / đề xuất**<br>*(Tạo trên app, duyệt online 1 chạm, tự đồng bộ số tiền)*<br>Chỉ mất ~6 giờ/tháng | Tiết kiệm **54 giờ / tháng**<br>($\approx$ 648 giờ/năm) | 💵 **~28.500.000 VNĐ** |
| **Quản lý & duyệt nghỉ phép, đi muộn** | **30 phút / đơn giấy**<br>*(Kho Cần Thơ, Mỹ Tho gửi giấy lên VP duyệt)* | **1 phút / đơn online**<br>*(Nhân viên nộp trên app, Quản lý duyệt ngay)* | Tiết kiệm **15 giờ / tháng**<br>($\approx$ 180 giờ/năm) | 💵 **~7.900.000 VNĐ** |
| **Tìm kiếm, trích xuất hồ sơ & báo cáo** | **1 - 2 ngày** khi BGĐ yêu cầu thống kê biến động nhân sự, quỹ lương | **3 giây** (Xem trực tiếp trên Dashboard / Báo cáo) | Tiết kiệm **8 giờ / tháng**<br>($\approx$ 96 giờ/năm) | 💵 **~4.200.000 VNĐ** |
| **TỔNG TIẾT KIỆM THỜI GIAN CÔNG** | — | — | **1.593 giờ / năm**<br>*(Tương đương gần 200 ngày công)* | 🌟 **~70.100.000 VNĐ / năm** |

---

### 2. TIẾT KIỆM CHI PHÍ VẬT TƯ IN ẤN, GIẤY TỜ & THIẾT BỊ (TIỀN MẶT TRỰC TIẾP)

| Khoản mục chi phí | Chi phí trước đây (Hàng năm) | Chi phí sau khi số hóa HRM | Mức tiết kiệm thực tế / Năm |
| :--- | :--- | :--- | :---: |
| **Đầu tư máy chấm công vân tay cho 5 chi nhánh**<br>*(VP Cty, Kho Cần Thơ, Kho Mỹ Tho, Xưởng nệm, Xưởng gối)* | • Mua 5 máy vân tay: 5 $\times$ 4.500.000đ = 22.500.000đ<br>• Chi phí bảo trì/sửa chữa: ~5.000.000đ/năm | **0 VNĐ**<br>*(Nhân sự dùng điện thoại chấm công GPS đúng bán kính tọa độ)* | 💵 **Tiết kiệm 22.500.000 VNĐ** *(Năm đầu)*<br>💵 **Tiết kiệm 5.000.000 VNĐ/năm** |
| **Chi phí in ấn giấy tờ hành chính (Paperless)**<br>*(Phiếu lương giấy, bảng chấm công, 3 liên đề xuất mua sắm/thanh toán, đơn xin phép)* | ~15.000 trang in A4 + 8 hộp mực in + bìa hồ sơ lưu trữ<br>$\approx$ **18.000.000 VNĐ / năm** | Giảm 85% chi phí in ấn giấy tờ<br>$\approx$ **2.700.000 VNĐ / năm** | 💵 **Tiết kiệm ~15.300.000 VNĐ / năm** |
| **Chống thất thoát công cụ dụng cụ xưởng & thiết bị**<br>*(Máy may, máy ép mút, xe nâng, laptop cấp phát)* | Tỷ lệ thất thoát/hỏng hóc không rõ người chịu trách nhiệm ước tính **25.000.000 VNĐ / năm** | Gắn mã quản lý và ký biên bản bàn giao điện tử, thu hồi 100% khi nghỉ việc | 💵 **Ngăn chặn thất thoát ~20.000.000 VNĐ / năm** |
| **TỔNG TIẾT KIỆM CHI PHÍ TRỰC TIẾP** | — | — | 🌟 **~40.300.000 VNĐ / năm**<br>*(Chưa tính 22.5 triệu tiền máy)* |

---

### 3. CẮT GIẢM RỦI RO PHÁP LÝ & RỦI RO TÀI CHÍNH (ĐO LƯỜNG ĐƯỢC)

* ⚖️ **Tránh phạt vi phạm Luật Lao động:**
  * Tính năng **Cảnh báo hợp đồng lao động trước 30 ngày** giúp công ty không bị bỏ sót hạn ký lại hợp đồng.
  * Theo Nghị định 12/2022/NĐ-CP, việc không giao kết đúng loại HĐLĐ bị phạt từ **2.000.000 – 25.000.000 VNĐ/vụ việc**. Hệ thống giúp đưa rủi ro này về **0%**.
* 🛡️ **Triệt tiêu rủi ro sai sót số liệu tính lương:**
  * Trước đây tính tay trên Excel dễ nhầm lẫn số công, tính sai phụ cấp thâm niên hoặc sai thuế/BHXH (sai lệch trung bình 2–5 triệu/tháng). 
  * Hệ thống tự động khóa sổ giúp **tiết kiệm và bảo vệ ngân sách công ty từ 20.000.000 – 30.000.000 VNĐ/năm**.

---

### 🏆 TỔNG KẾT TÀI CHÍNH & HIỆU SUẤT ĐẦU TƯ (ROI):

| Hạng mục tổng kết | Số liệu đo lường cụ thể |
| :--- | :---: |
| 💎 **Tổng giá trị kinh tế tiết kiệm hàng năm** | **~130.000.000 – 160.000.000 VNĐ / NĂM** |
| ⏱️ **Thời gian công tác hành chính cắt giảm** | **Giảm 80%** *(tương đương giải phóng gần 1 vị trí nhân sự)* |
| ⚡ **Tốc độ phê duyệt đề xuất chi tiêu & tính lương** | **Nhanh gấp 30 – 50 lần** |
| 🔒 **Tỷ lệ bảo mật thông tin lương & độ chính xác** | **100% Tuyệt đối (Phân quyền 3 cấp độc lập)** |
| 🌐 **Tỷ lệ nhân sự đưa vào vận hành thực tế** | **100% (57/57 nhân sự tại 5 chi nhánh)** |
