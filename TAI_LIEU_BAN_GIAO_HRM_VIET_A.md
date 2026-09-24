# 📑 TÀI LIỆU BÀN GIAO & HƯỚNG DẪN VẬN HÀNH HỆ THỐNG HRM
**ĐƠN VỊ: CÔNG TY TNHH NỆM VIỆT Á**  
*Ngày bàn giao: 24/09/2026*  
*Bên bàn giao: Bộ phận Kỹ thuật & CNTT (Phan Tuấn Kiệt)*  
*Bên tiếp nhận: Phòng Hành chính - Nhân sự (Huỳnh Thị Trúc Xinh)*  

---

## 🌐 PHẦN 1: THÔNG TIN HỆ THỐNG & ĐƯỜNG DẪN TRUY CẬP

* **Tên phần mềm:** Hệ thống Quản trị Nhân sự & Tiền lương Nệm Việt Á (Viet A HRM).
* **Đường dẫn truy cập Cloud:** [https://hrmvieta.up.railway.app](https://hrmvieta.up.railway.app)
* **Đường dẫn truy cập mạng nội bộ (Local):** `http://localhost:5173`
* **Đối tượng & Quy mô:** Toàn bộ 11 phòng ban, kho, xưởng sản xuất và 57 nhân sự công ty.

---

## 🔐 PHẦN 2: CHUẨN BẢO MẬT MẬT KHẨU ĐỘ PHỨC TẠP CAO (UNIQUE STRONG PASSWORDS)

Nhằm đảm bảo **tính bảo mật tuyệt đối**, không để nhân viên đoán được mật khẩu của nhau, hệ thống đã nâng cấp toàn bộ mật khẩu khởi tạo sang chuẩn độ phức tạp cao (gồm **Chữ HOA + Chữ thường + Số + Ký tự đặc biệt**), được cấp riêng biệt cho từng người:

1. **CẤP 1 - ADMIN (Ban Giám Đốc & HCNS):**
   * Định dạng chuẩn: `VietA#Admin@[MãNV]!8X`
   * Ví dụ: `vieta002` ➔ `VietA#Admin@002!8X` | `vieta032` ➔ `VietA#Admin@032!8X` | `vieta043` ➔ `VietA#Admin@043!8X`
   * Alias: `admin` ➔ `VietA#Admin@Root!9X9` | `hr_manager` ➔ `VietA#HR@Admin!8K8`

2. **CẤP 2 - MANAGER (Trưởng phòng / Quản lý Kho & Xưởng):**
   * Định dạng chuẩn: `VietA#Mgr@[MãNV]$9Q`
   * Ví dụ: `vieta003` (Kho Cần Thơ) ➔ `VietA#Mgr@003$9Q` | `vieta015` (Kho Mỹ Tho) ➔ `VietA#Mgr@015$9Q` | `vieta031` (Kế toán) ➔ `VietA#Mgr@031$9Q` | `vieta036` (Kinh doanh) ➔ `VietA#Mgr@036$9Q` | `vieta050` (Xưởng nệm) ➔ `VietA#Mgr@050$9Q`

3. **CẤP 3 - EMPLOYEE (Nhân viên):**
   * Định dạng chuẩn: `VietA#Emp@[MãNV]*7W`
   * Ví dụ: `vieta004` ➔ `VietA#Emp@004*7W` | `vieta006` ➔ `VietA#Emp@006*7W` | `vieta057` ➔ `VietA#Emp@057*7W`

---

## 📊 PHẦN 3: DANH SÁCH CHI TIẾT TÀI KHOẢN ĐĂNG NHẬP

### 1. CẤP 1 - ADMIN (Toàn quyền quản trị & Tính lương toàn công ty)
| STT | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật cao |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `vieta002` | **Võ Minh Cường** | Ban Giám Đốc | Phó Giám đốc | `VietA#Admin@002!8X` |
| 2 | `vieta032` | **Huỳnh Thị Trúc Xinh** | Khối Văn Phòng | Trưởng phòng HCNS | `VietA#Admin@032!8X` |
| 3 | `vieta043` | **Phan Tuấn Kiệt** | Phòng Marketing | Lập trình / TP Marketing | `VietA#Admin@043!8X` |

### 2. CẤP 2 - MANAGER (Quản lý phòng ban/kho/xưởng & Xem lương bộ phận)
| STT | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu bảo mật cao |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `vieta003` | **Nguyễn Thị Thu Tâm** | Kho Cần Thơ | Quản lý Kho Cần Thơ | `VietA#Mgr@003$9Q` |
| 2 | `vieta015` | **Dương Thị Tuyết Hường** | Kho Mỹ Tho | Quản lý Kho Mỹ Tho | `VietA#Mgr@015$9Q` |
| 3 | `vieta031` | **Nguyễn Quốc Hùng** | Khối Văn Phòng | Trưởng phòng Kế toán | `VietA#Mgr@031$9Q` |
| 4 | `vieta035` | **Lê Huy Hoàng** | Khối Văn Phòng | Trưởng phòng R&D | `VietA#Mgr@035$9Q` |
| 5 | `vieta036` | **Phạm Tấn Hưng** | Phòng Kinh Doanh | Trưởng phòng Kinh doanh | `VietA#Mgr@036$9Q` |
| 6 | `vieta046` | **Nguyễn Thái Cần** | Xưởng Sản Xuất Gối | Trưởng nhóm thổi gối | `VietA#Mgr@046$9Q` |
| 7 | `vieta050` | **Trần Minh Lý** | Xưởng Sản Xuất Nệm | Quản lý Xưởng nệm | `VietA#Mgr@050$9Q` |
| 8 | `vieta056` | **Trần Thị Bảo Châu** | Xưởng Sản Xuất Nệm | Kế toán xưởng sản xuất | `VietA#Mgr@056$9Q` |

### 3. CẤP 3 - EMPLOYEE (Xem duy nhất phiếu lương & thông tin cá nhân)
* Toàn bộ 46 nhân sự còn lại có mật khẩu riêng biệt chuẩn hóa theo dạng: `VietA#Emp@[MãNV]*7W` (được liệt kê đầy đủ từng dòng trong file Word bàn giao).

---

## 📎 FILE VĂN BẢN ĐÍNH KÈM:
* 📄 **File Word chính thức:** [TAI_LIEU_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx](file:///d:/HR%20N%E1%BB%86M%20VI%E1%BB%86T%20%C3%81/TAI_LIEU_BAN_GIAO_VA_HUONG_DAN_SU_DUNG_HRM_VIET_A.docx)
* 📄 **Bảng danh sách tài khoản & phân quyền Word:** [DANH_SACH_TAI_KHOAN_VA_PHAN_QUYEN_HRM_VIET_A.docx](file:///d:/HR%20N%E1%BB%86M%20VI%E1%BB%86T%20%C3%81/DANH_SACH_TAI_KHOAN_VA_PHAN_QUYEN_HRM_VIET_A.docx)
