import bcrypt from 'bcryptjs';
import { initDatabase, query } from './database.js';

const seed = async () => {
  try {
    console.log('Bắt đầu khởi tạo database và nạp dữ liệu mẫu...');
    await initDatabase();

    // 1. Seed Roles
    console.log('Nạp dữ liệu bảng roles...');
    const roles = [
      { id: 1, name: 'ADMIN', display_name: 'Quản trị hệ thống' },
      { id: 2, name: 'HR', display_name: 'Phòng Nhân sự' },
      { id: 3, name: 'MANAGER', display_name: 'Trưởng phòng / Quản lý' },
      { id: 4, name: 'EMPLOYEE', display_name: 'Nhân viên' }
    ];
    for (const role of roles) {
      await query.run(
        'INSERT OR IGNORE INTO roles (id, name, display_name) VALUES (?, ?, ?)',
        [role.id, role.name, role.display_name]
      );
    }

    // 2. Seed Branches
    console.log('Nạp dữ liệu bảng branches...');
    const branches = [
      { id: 1, name: 'Văn phòng Trụ sở chính', address: 'Số 12, Đường số 5, KDC Trung Sơn, TP.HCM' },
      { id: 2, name: 'Nhà máy Sản xuất Việt Á', address: 'Lô C-4, Khu Công nghiệp Tân Tạo, TP.HCM' }
    ];
    for (const b of branches) {
      await query.run(
        'INSERT OR IGNORE INTO branches (id, name, address) VALUES (?, ?, ?)',
        [b.id, b.name, b.address]
      );
    }

    // 3. Seed Departments
    console.log('Nạp dữ liệu bảng departments...');
    const depts = [
      { id: 1, name: 'Hội đồng Quản trị & Ban Giám Đốc', branch_id: 1 },
      { id: 2, name: 'Phòng Hành chính Nhân sự', branch_id: 1 },
      { id: 3, name: 'Phòng Kinh doanh & Marketing', branch_id: 1 },
      { id: 4, name: 'Phòng Kế toán Tài chính', branch_id: 1 },
      { id: 5, name: 'Bộ phận Kỹ thuật & R&D', branch_id: 2 },
      { id: 6, name: 'Phân xưởng Sản xuất Nệm', branch_id: 2 }
    ];
    for (const d of depts) {
      await query.run(
        'INSERT OR IGNORE INTO departments (id, name, branch_id) VALUES (?, ?, ?)',
        [d.id, d.name, d.branch_id]
      );
    }

    // 4. Seed Positions
    console.log('Nạp dữ liệu bảng positions...');
    const positions = [
      { id: 1, name: 'Giám đốc Điều hành (CEO)', department_id: 1 },
      { id: 2, name: 'Phó Giám đốc', department_id: 1 },
      { id: 3, name: 'Trưởng phòng Nhân sự', department_id: 2 },
      { id: 4, name: 'Chuyên viên Tuyển dụng & Đào tạo', department_id: 2 },
      { id: 5, name: 'Trưởng phòng Kinh doanh', department_id: 3 },
      { id: 6, name: 'Nhân viên Kinh doanh', department_id: 3 },
      { id: 7, name: 'Kế toán trưởng', department_id: 4 },
      { id: 8, name: 'Quản đốc Phân xưởng', department_id: 6 },
      { id: 9, name: 'Kỹ sư Kỹ thuật', department_id: 5 },
      { id: 10, name: 'Nhân viên Hành chính', department_id: 2 }
    ];
    for (const pos of positions) {
      await query.run(
        'INSERT OR IGNORE INTO positions (id, name, department_id) VALUES (?, ?, ?)',
        [pos.id, pos.name, pos.department_id]
      );
    }

    // Helper: Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashAdmin = bcrypt.hashSync('Admin@123', salt);
    const hashHR = bcrypt.hashSync('Hr@123', salt);
    const hashMgr = bcrypt.hashSync('Manager@123', salt);
    const hashEmp = bcrypt.hashSync('Emp@123', salt);

    // 5. Seed Employees & Users
    console.log('Nạp dữ liệu bảng employees...');
    const now = new Date().toISOString();

    const emps = [
      {
        id: 1,
        code: 'NV0001',
        fullname: 'Huỳnh Thị Xinh (Admin)',
        avatar: '',
        dob: '1985-05-15',
        gender: 'Nam',
        phone: '0901234567',
        email: 'admin@vieta.com.vn',
        cccd: '079085000123',
        address: 'Quận 7, TP.HCM',
        join_date: '2015-01-01',
        branch_id: 1,
        department_id: 1,
        position_id: 1,
        manager_id: null,
        status: 'Đang làm việc',
        contract_type: 'Không xác định thời hạn',
        base_salary: 35000000,
        allowance: 5000000,
        notes: 'Tài khoản admin hệ thống'
      },
      {
        id: 2,
        code: 'NV0002',
        fullname: 'Lê Thị Thu Hương (HR)',
        avatar: '',
        dob: '1990-08-20',
        gender: 'Nữ',
        phone: '0912345678',
        email: 'hr@vieta.com.vn',
        cccd: '079090000456',
        address: 'Quận Bình Thạnh, TP.HCM',
        join_date: '2018-06-01',
        branch_id: 1,
        department_id: 2,
        position_id: 3,
        manager_id: 1,
        status: 'Đang làm việc',
        contract_type: 'Không xác định thời hạn',
        base_salary: 18000000,
        allowance: 2000000,
        notes: 'Phụ trách nhân sự toàn công ty'
      },
      {
        id: 3,
        code: 'NV0003',
        fullname: 'Phạm Tấn Hưng (Manager)',
        avatar: '',
        dob: '1988-12-05',
        gender: 'Nam',
        phone: '0934567890',
        email: 'hung.pham@vieta.com.vn',
        cccd: '079088000789',
        address: 'Quận Phú Nhuận, TP.HCM',
        join_date: '2016-03-15',
        branch_id: 1,
        department_id: 3,
        position_id: 5,
        manager_id: 1,
        status: 'Đang làm việc',
        contract_type: 'Không xác định thời hạn',
        base_salary: 22000000,
        allowance: 3000000,
        notes: 'Quản lý phòng Kinh doanh'
      },
      {
        id: 4,
        code: 'NV0004',
        fullname: 'Nguyễn Hoàng Nam (Employee)',
        avatar: '',
        dob: '1995-10-10',
        gender: 'Nam',
        phone: '0945678901',
        email: 'nam.nguyen@vieta.com.vn',
        cccd: '079095001122',
        address: 'Quận Gò Vấp, TP.HCM',
        join_date: '2021-09-01',
        branch_id: 1,
        department_id: 3,
        position_id: 6,
        manager_id: 3,
        status: 'Đang làm việc',
        contract_type: '1 năm',
        base_salary: 12000000,
        allowance: 1000000,
        notes: 'Nhân viên kinh doanh xuất sắc'
      },
      {
        id: 5,
        code: 'NV0005',
        fullname: 'Võ Minh Cường (Trưởng phòng/Phó Giám Đốc)',
        avatar: '',
        dob: '1982-04-18',
        gender: 'Nam',
        phone: '0987654321',
        email: 'cuong.vo@vieta.com.vn',
        cccd: '079082000999',
        address: 'Quận 2, TP.HCM',
        join_date: '2019-02-15',
        branch_id: 1,
        department_id: 1,
        position_id: 2,
        manager_id: 1,
        status: 'Đang làm việc',
        contract_type: 'Không xác định thời hạn',
        base_salary: 28000000,
        allowance: 4000000,
        notes: 'Thâm niên 7 năm, Phó Giám Đốc'
      }
    ];

    for (const emp of emps) {
      await query.run(
        `INSERT OR IGNORE INTO employees (
          id, code, fullname, avatar, dob, gender, phone, email, cccd, address, join_date,
          branch_id, department_id, position_id, manager_id, status, contract_type, base_salary, allowance, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emp.id, emp.code, emp.fullname, emp.avatar, emp.dob, emp.gender, emp.phone, emp.email, emp.cccd, emp.address, emp.join_date,
          emp.branch_id, emp.department_id, emp.position_id, emp.manager_id, emp.status, emp.contract_type, emp.base_salary, emp.allowance, emp.notes,
          now, now
        ]
      );
    }

    // 6. Seed Users
    console.log('Nạp dữ liệu bảng users...');
    const users = [
      { id: 1, username: 'admin', password: hashAdmin, role_id: 1, employee_id: 1 },
      { id: 2, username: 'hr_manager', password: hashHR, role_id: 2, employee_id: 2 },
      { id: 3, username: 'dept_manager', password: hashMgr, role_id: 3, employee_id: 3 },
      { id: 4, username: 'employee1', password: hashEmp, role_id: 4, employee_id: 4 }
    ];

    for (const u of users) {
      await query.run(
        'INSERT OR IGNORE INTO users (id, username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)',
        [u.id, u.username, u.password, u.role_id, u.employee_id, now, now]
      );
    }

    // Add some default notifications, rewards & innovations to show Giai đoạn 1 works beautifully
    console.log('Nạp một số bản ghi lịch sử, thông báo và sáng kiến mẫu...');
    await query.run(
      'INSERT OR IGNORE INTO notifications (id, employee_id, title, content, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)',
      [1, 4, 'Chào mừng đến với Việt Á HRM', 'Chào mừng bạn tham gia hệ thống Quản lý Nhân sự mới.', now]
    );

    await query.run(
      'INSERT OR IGNORE INTO rewards (id, employee_id, title, content, date, reward_type, value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 4, 'Khen thưởng Quý 2', 'Hoàn thành xuất sắc doanh số bán hàng quý 2', '2026-07-15', 'Tiền mặt', 5000000, now]
    );

    // Seed thâm niên vinh danh mẫu
    await query.run(
      `INSERT OR IGNORE INTO rewards (id, employee_id, title, content, date, reward_type, value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 3, 'Vinh danh thâm niên 10 năm', 'Đóng góp to lớn vào sự phát triển bộ phận Kinh doanh', '2026-03-15', 'Kỷ niệm chương', 10000000, now]
    );
    await query.run(
      `INSERT OR IGNORE INTO rewards (id, employee_id, title, content, date, reward_type, value, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [3, 5, 'Vinh danh thâm niên 7 năm', 'Đóng góp to lớn vào vai trò quản lý điều hành sản xuất', '2026-02-15', 'Kỷ niệm chương', 7000000, now]
    );

    // Seed kỷ luật mẫu
    console.log('Nạp dữ liệu kỷ luật mẫu...');
    await query.run(
      `INSERT OR IGNORE INTO discipline (id, employee_id, content, form, date, decision_maker_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, 4, 'Đi trễ 3 lần trong tháng 6/2026, không báo trước cho quản lý', 'Nhắc nhở', '2026-07-01', 3, now]
    );
    await query.run(
      `INSERT OR IGNORE INTO discipline (id, employee_id, content, form, date, decision_maker_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [2, 4, 'Sử dụng thiết bị cá nhân trong giờ làm việc tại khu vực sản xuất', 'Cảnh cáo bằng văn bản', '2026-05-15', 2, now]
    );

    // Seed sáng kiến mẫu
    console.log('Nạp dữ liệu sáng kiến mẫu...');
    await query.run(
      `INSERT OR IGNORE INTO innovations (id, employee_id, title, content, date, status, efficiency, cost_savings, productivity_increase, value_created, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 4, 'Tối ưu hóa quy trình đóng gói nệm', 'Đề xuất thay đổi thứ tự các bước đóng gói giúp giảm thời gian hoàn thành 1 sản phẩm từ 12 phút xuống 8 phút.', '2026-06-10', 'Chấp nhận', 'Giảm 33% thời gian đóng gói', 15000000, 'Tăng 25% sản lượng đóng gói/ngày', 'Nâng cao năng suất phân xưởng', now]
    );
    await query.run(
      `INSERT OR IGNORE INTO innovations (id, employee_id, title, content, date, status, efficiency, cost_savings, productivity_increase, value_created, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 3, 'Ứng dụng CRM nội bộ cho đội Kinh doanh', 'Phát triển hệ thống quản lý khách hàng nội bộ giúp tracking lead và chăm sóc khách hàng hiệu quả hơn.', '2026-04-20', 'Đang xét duyệt', '', 0, '', '', now]
    );
    await query.run(
      `INSERT OR IGNORE INTO innovations (id, employee_id, title, content, date, status, efficiency, cost_savings, productivity_increase, value_created, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [3, 2, 'Số hóa quy trình nghỉ phép trên HRM', 'Thay thế đơn nghỉ phép giấy bằng quy trình điện tử trên hệ thống HRM, tiết kiệm thời gian xử lý và lưu trữ.', '2026-08-01', 'Đã triển khai', 'Giảm 90% thời gian xử lý đơn', 2000000, 'Giảm 2 ngày xử lý/tháng', 'Nâng cao trải nghiệm nhân viên', now]
    );

    // Seed lịch sử công tác mẫu
    console.log('Nạp dữ liệu lịch sử công tác mẫu...');
    await query.run(
      `INSERT OR IGNORE INTO work_history (id, employee_id, department_id, position_id, start_date, end_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 3, 3, 6, '2016-03-15', '2019-06-01', 'Nhận vào vị trí Nhân viên Kinh doanh', now]
    );
    await query.run(
      `INSERT OR IGNORE INTO work_history (id, employee_id, department_id, position_id, start_date, end_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 3, 3, 5, '2019-06-01', null, 'Thăng chức Trưởng phòng Kinh doanh nhờ KPI xuất sắc', now]
    );
    await query.run(
      `INSERT OR IGNORE INTO work_history (id, employee_id, department_id, position_id, start_date, end_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [3, 2, 2, 4, '2018-06-01', '2020-12-01', 'Khởi đầu tại vị trí Chuyên viên Tuyển dụng', now]
    );
    await query.run(
      `INSERT OR IGNORE INTO work_history (id, employee_id, department_id, position_id, start_date, end_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [4, 2, 2, 3, '2020-12-01', null, 'Thăng chức Trưởng phòng Nhân sự', now]
    );

    console.log('Nạp dữ liệu mẫu THÀNH CÔNG!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu mẫu:', error);
    process.exit(1);
  }
};

seed();
