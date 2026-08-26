import bcrypt from 'bcryptjs';
import { initDatabase, query } from './database.js';

const seed = async () => {
  try {
    console.log('Bắt đầu khởi tạo database và nạp dữ liệu...');
    await initDatabase();

    // Thêm cột kpi_bonus nếu chưa có
    try {
      await query.run('ALTER TABLE employees ADD COLUMN kpi_bonus REAL DEFAULT 0');
      console.log('Đã thêm cột kpi_bonus.');
    } catch (e) {
      // Cột đã tồn tại, bỏ qua
    }

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

    // 3. Seed Departments (thực tế)
    console.log('Nạp dữ liệu bảng departments...');
    const depts = [
      'Ban giám đốc',
      'Kho Cần Thơ',
      'Khối văn phòng',
      'Xưởng sản xuất nệm',
      'Kho Mỹ Tho',
      'Phòng kinh doanh',
      'Phòng Marketing',
      'Xưởng sản xuất gối'
    ];
    for (const name of depts) {
      await query.run('INSERT OR IGNORE INTO departments (name, branch_id) VALUES (?, 1)', [name]);
    }

    // 4. Seed Positions (thực tế)
    console.log('Nạp dữ liệu bảng positions...');
    const positions = [
      'Phó giám đốc', 'Quản Lý', 'Kế toán thu mua', 'Kế Toán Kho',
      'Chuyên viên Tài Xế', 'Nv Kho', 'NV Phụ Xe', 'Phó quản lý kho',
      'Quản lý kho', 'Chuyên viên Kế toán', 'Đội trưởng đội tài xế',
      'Chuyên viên Tài xế', 'Nhân viên giao hàng', 'NV Kinh doanh',
      'Nhân viên kho', 'Trưởng phòng kế toán', 'Trưởng phòng HCNS',
      'Trợ lý TGĐ', 'Chuyên viên kế toán công ty', 'Trưởng phòng R&D',
      'Trưởng phòng KD', 'Kế toán kinh doanh', 'Trưởng phòng MKT',
      'Trưởng nhóm thổi gối', 'Nhân viên thổi gối', 'Chuyên viên may gối',
      'Quản lý', 'Nhân viên may viền', 'Chuyên viên thành phẩm',
      'Chuyên viên Tài xế xưởng sản xuất', 'Nhân viên kế toán xưởng sản xuất',
      'Nhân viên may miệng', 'Nhân viên may một kim', 'Nhân viên vô vali',
      'Nhân viên tài xế', 'Nhân viên vô áo', 'Nhân viên cắt vải',
      'Nhân viên phòng tổ chức', 'Nhân viên phun keo'
    ];
    for (const name of positions) {
      await query.run('INSERT OR IGNORE INTO positions (name) VALUES (?)', [name]);
    }

    // Kiểm tra xem database đã có nhân viên chưa
    const empCount = await query.get('SELECT COUNT(*) as total FROM employees');
    if (empCount.total > 0) {
      console.log(`Database đã có ${empCount.total} nhân viên. Bỏ qua seed nhân viên.`);
    } else {
      console.log('Database trống, nạp dữ liệu nhân viên...');
      // Sẽ seed dữ liệu nhân viên ở đây nếu cần
    }

    // Seed Users (chỉ tạo nếu chưa có)
    console.log('Kiểm tra tài khoản đăng nhập...');
    const userCount = await query.get('SELECT COUNT(*) as total FROM users');
    if (userCount.total === 0) {
      const salt = bcrypt.genSaltSync(10);
      const hashAdmin = bcrypt.hashSync('Admin@123', salt);
      const hashHR = bcrypt.hashSync('Hr@123', salt);
      const hashMgr = bcrypt.hashSync('Manager@123', salt);
      const hashEmp = bcrypt.hashSync('Emp@123', salt);

      const users = [
        { username: 'admin', password: hashAdmin, role_id: 1, employee_id: null },
        { username: 'hr_manager', password: hashHR, role_id: 2, employee_id: null },
        { username: 'dept_manager', password: hashMgr, role_id: 3, employee_id: null },
        { username: 'employee1', password: hashEmp, role_id: 4, employee_id: null }
      ];

      for (const u of users) {
        await query.run(
          'INSERT OR IGNORE INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
          [u.username, u.password, u.role_id, u.employee_id, new Date().toISOString(), new Date().toISOString()]
        );
      }
      console.log('Đã tạo 4 tài khoản đăng nhập mặc định.');
    } else {
      console.log(`Đã có ${userCount.total} tài khoản, bỏ qua.`);
    }

    console.log('Nạp dữ liệu THÀNH CÔNG!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu:', error);
    process.exit(1);
  }
};

seed();
