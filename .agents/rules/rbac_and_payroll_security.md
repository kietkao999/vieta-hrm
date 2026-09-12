# NỆM VIỆT Á HRM - QUY TẮC BẢO MẬT & PHÂN QUYỀN 3 CẤP ĐỘ

Tài liệu quy chuẩn bảo mật, phân quyền và dữ liệu lương cho toàn bộ hệ thống HRM Công ty Nệm Việt Á.

---

## 1. PHÂN QUYỀN 3 CẤP ĐỘ (3-TIER RBAC)

### Cấp 1: Toàn quyền hệ thống (ADMIN)
- **Danh sách nhân sự:**
  - `VietA 002` - Võ Minh Cường (Phó Giám đốc) -> username: `vieta002` / `employee1`
  - `VietA 032` - Huỳnh Thị Trúc Xinh (Trưởng phòng HCNS) -> username: `vieta032` / `admin` / `hr_manager`
  - `VietA 043` - Phan Tuấn Kiệt (Phát triển phần mềm / Marketing) -> username: `vieta043`
- **Mật khẩu chuẩn:** `Admin@123`
- **Quyền hạn:**
  - Quản trị toàn diện nhân sự (thêm, sửa, xóa, hợp đồng, chức vụ).
  - Xem toàn bộ bảng lương toàn công ty (57 nhân sự).
  - Khởi tạo, tính lương tự động hàng tháng, phê duyệt và xuất chi trả.
  - Quản lý định mức KPI & thưởng hiệu quả.
  - Xem toàn bộ báo cáo tài chính & quỹ lương `/api/reports/*`.
  - Phân quyền tài khoản và xem nhật ký hệ thống (Audit Logs).

---

### Cấp 2: Trưởng phòng / Quản lý kho & xưởng (MANAGER)
- **Danh sách quản lý:**
  - `VietA 003` - Nguyễn Thị Thu Tâm (Quản lý kho Cần Thơ) -> username: `vieta003`
  - `VietA 015` - Dương Thị Tuyết Hường (Quản lý kho Mỹ Tho) -> username: `vieta015`
  - `VietA 050` - Trần Minh Lý (Quản lý xưởng nệm) -> username: `vieta050`
  - `VietA 036` - Phạm Tấn Hưng (Trưởng phòng Kinh doanh) -> username: `vieta036` / `dept_manager`
  - `VietA 031` - Nguyễn Quốc Hùng (Trưởng phòng Kế toán) -> username: `vieta031`
  - `VietA 035` - Lê Huy Hoàng (Trưởng phòng R&D) -> username: `vieta035`
  - `VietA 046` - Nguyễn Thái Cần (Trưởng nhóm thổi gối) -> username: `vieta046`
  - `VietA 056` - Trần Thị Bảo Châu (Quản lý xưởng gối) -> username: `vieta056`
- **Mật khẩu chuẩn:** `Manager@123`
- **Quyền hạn:**
  - Quản lý nhân viên, theo dõi chấm công và đánh giá KPI của phòng ban/kho/xưởng mình.
  - Xem sơ đồ cơ cấu tổ chức và danh bạ nội bộ công ty.
- **🔒 BẢO MẬT LƯƠNG TUYỆT ĐỐI:**
  - **Chỉ xem được duy nhất phiếu lương của chính mình.**
  - Không được xem lương, mức thưởng KPI hay bậc lương của nhân viên khác (kể cả cấp dưới).
  - Server Backend chặn cứng mọi truy vấn lương người khác.

---

### Cấp 3: Nhân viên thông thường (EMPLOYEE)
- **Danh sách:** Toàn bộ nhân sự còn lại trong 57 nhân sự.
- **Tên đăng nhập:** `vieta` + mã số nhân viên (vd `vieta004`, `vieta006`, ..., `vieta082`).
- **Mật khẩu chuẩn:** `VietA@2026`
- **Quyền hạn:**
  - Xem chấm công, lịch sử đánh giá KPI và **Phiếu lương cá nhân của chính mình**.
  - Được xem sơ đồ cơ cấu tổ chức & danh bạ nhân sự các phòng ban (chế độ bảo mật: Họ tên, Mã NV, Phòng ban, Chức vụ, Chi nhánh, Email/SĐT công việc).
- **🔒 BẢO MẬT DỮ LIỆU:**
  - Toàn bộ mức lương (`tier_salary`, `grade_salary`, `base_salary`, `kpi_bonus`, `bank_account`, `cccd`) của đồng nghiệp bị server xóa/ẩn trước khi trả về client.

---

## 2. NGUYÊN TẮC DỮ LIỆU & BÁO CÁO
1. **Dữ liệu thực tế 100%:** Luôn truy vấn từ cơ sở dữ liệu SQLite `payrolls`, `employees`, `departments`, tuyệt đối không dùng code chia trung bình hoặc dữ liệu giả lập.
2. **Bộ lọc phòng ban:** Mọi API báo cáo (`/api/reports/summary`, `/api/reports/payroll`, `/api/reports/kpi`, `/api/reports/attendance`) đều nhận và xử lý tham số `department_id` chuẩn xác theo SQL.
3. **Thanh công cụ lọc:** Tinh gọn, tối ưu trải nghiệm với dropdown Mốc nhanh và dải 12 tháng trực quan.
