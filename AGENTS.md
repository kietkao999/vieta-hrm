# HỆ THỐNG QUẢN TRỊ NHÂN SỰ & TIỀN LƯƠNG - NỆM VIỆT Á (HRM)

## 📌 QUY TẮC CỐT LÕI (CORE RULES)

### 1. Phân quyền 3 Cấp độ & Bảo mật Lương Tuyệt đối:
- **CẤP 1 - ADMIN (Toàn quyền quản trị hệ thống):**
  - **Võ Minh Cường** (Phó Giám đốc)
  - **Huỳnh Thị Trúc Xinh** (Trưởng phòng HCNS)
  - **Phan Tuấn Kiệt** (Lập trình hệ thống)
  - *Mật khẩu mặc định:* `Admin@123`
  - *Quyền hạn:* Toàn quyền quản trị toàn bộ hệ thống, nhân sự, xem và tính bảng lương toàn công ty, KPI, hợp đồng, khen thưởng/kỷ luật, cấu hình và phân quyền.

- **CẤP 2 - MANAGER (Trưởng phòng / Quản lý kho & xưởng):**
  - Quản lý các phòng ban/kho/xưởng: Nguyễn Thị Thu Tâm (Kho Cần Thơ), Dương Thị Tuyết Hường (Kho Mỹ Tho), Trần Minh Lý (Xưởng nệm), Phạm Tấn Hưng (Kinh doanh), Nguyễn Quốc Hùng (Kế toán), Lê Huy Hoàng (R&D), Nguyễn Thái Cần (Xưởng gối), Trần Thị Bảo Châu (Xưởng gối).
  - *Mật khẩu mặc định:* `Manager@123`
  - *Quyền hạn:* Xem được thông tin phòng ban của mình, quản lý và theo dõi danh sách nhân viên trực thuộc, chấm công, KPI phòng ban.
  - ⚠️ **Bảo mật Lương:** **Chỉ xem được phiếu lương của chính mình, tuyệt đối KHÔNG được xem chéo lương của nhân viên khác hoặc phòng ban khác.**

- **CẤP 3 - EMPLOYEE (Nhân viên):**
  - Toàn bộ nhân viên còn lại trong công ty.
  - *Mật khẩu mặc định:* `VietA@2026`
  - *Quyền hạn:* Chỉ xem được thông tin hồ sơ của chính mình, tra cứu phiếu lương cá nhân, chấm công, KPI của bản thân và xem Sơ đồ tổ chức & Danh bạ công ty.
  - ⚠️ **Bảo mật Lương:** **Ẩn toàn bộ mức lương của tất cả người khác.**

### 2. Tính toán & Báo cáo Lương:
- Sử dụng 100% dữ liệu thực tế từ Database (`payrolls`, `employees`, `employee_monthly_kpis`, `departments`).
- Mọi bộ lọc phòng ban và tháng phải được xử lý trực tiếp từ câu truy vấn SQL Backend.
- Tuyệt đối không sử dụng công thức giả lập hoặc chia trung bình trên giao diện Frontend.

