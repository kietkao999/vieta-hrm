import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lưu file db trong thư mục server hoặc lấy từ cấu hình Cloud (như Railway Volume)
export const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../hrm.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối cơ sở dữ liệu SQLite:', err.message);
  } else {
    console.log('Đã kết nối thành công đến cơ sở dữ liệu SQLite tại:', dbPath);
    // Bật khóa ngoại và chế độ WAL để tăng tối đa hiệu năng ghi & đọc đồng thời
    db.run('PRAGMA foreign_keys = ON;');
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA synchronous = NORMAL;');
    db.run('PRAGMA cache_size = -64000;'); // 64MB RAM Cache
    db.run('PRAGMA temp_store = MEMORY;');
    db.run('PRAGMA mmap_size = 268435456;'); // 256MB memory mapped I/O
  }
});

// Wrapper helper để hỗ trợ Async/Await
export const query = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

export const initDatabase = async () => {
  try {
    // 1. Roles
    await query.exec(`
      CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL
      )
    `);

    // 2. Branches
    await query.exec(`
      CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        address TEXT
      )
    `);

    // 3. Departments
    await query.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        branch_id INTEGER,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      )
    `);

    // 4. Positions
    await query.exec(`
      CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        department_id INTEGER,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

    // Migrate existing DBs:
    try {
      await query.run('ALTER TABLE departments ADD COLUMN is_active INTEGER DEFAULT 1');
      console.log('Đã thêm cột is_active vào bảng departments.');
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await query.run('ALTER TABLE positions ADD COLUMN is_active INTEGER DEFAULT 1');
      console.log('Đã thêm cột is_active vào bảng positions.');
    } catch (e) {
      // Ignored if column already exists
    }

    // 5. Employees
    await query.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        fullname TEXT NOT NULL,
        avatar TEXT,
        dob TEXT,
        gender TEXT,
        phone TEXT,
        email TEXT,
        cccd TEXT,
        address TEXT,
        join_date TEXT,
        branch_id INTEGER,
        department_id INTEGER,
        position_id INTEGER,
        manager_id INTEGER,
        status TEXT NOT NULL DEFAULT 'Thử việc',
        contract_type TEXT,
        base_salary REAL DEFAULT 0,
        allowance REAL DEFAULT 0,
        kpi_bonus REAL DEFAULT 0,
        notes TEXT,
        tier TEXT,
        grade TEXT,
        tier_salary REAL DEFAULT 0,
        grade_salary REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // Migrate employees columns:
    try { await query.run('ALTER TABLE employees ADD COLUMN tier TEXT'); } catch (e) {}
    try { await query.run('ALTER TABLE employees ADD COLUMN grade TEXT'); } catch (e) {}
    try { await query.run('ALTER TABLE employees ADD COLUMN tier_salary REAL DEFAULT 0'); } catch (e) {}
    try { await query.run('ALTER TABLE employees ADD COLUMN grade_salary REAL DEFAULT 0'); } catch (e) {}

    // 6. Users
    await query.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role_id INTEGER NOT NULL,
        employee_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 7. Contracts
    await query.exec(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        contract_number TEXT UNIQUE,
        type TEXT NOT NULL,
        sign_date TEXT,
        start_date TEXT,
        end_date TEXT,
        file_url TEXT,
        document_url TEXT,
        basic_salary REAL DEFAULT 0,
        status TEXT DEFAULT 'Hiệu lực',
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 8. Attendance
    await query.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        status TEXT NOT NULL,
        late_minutes INTEGER DEFAULT 0,
        early_minutes INTEGER DEFAULT 0,
        ot_hours REAL DEFAULT 0,
        created_at TEXT,
        UNIQUE(employee_id, date),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 9. Leave Requests
    await query.exec(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        days_count REAL NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'Chờ duyệt',
        approver_id INTEGER,
        approver_notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (approver_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 10. Payroll (Old)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS payroll (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        base_salary REAL DEFAULT 0,
        work_days REAL DEFAULT 0,
        ot_hours REAL DEFAULT 0,
        allowances REAL DEFAULT 0,
        bonus REAL DEFAULT 0,
        penalty REAL DEFAULT 0,
        deductions REAL DEFAULT 0,
        net_salary REAL DEFAULT 0,
        is_locked INTEGER DEFAULT 0,
        created_at TEXT,
        UNIQUE(employee_id, month),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 10b. Payrolls (New Schema)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS payrolls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        tier_salary REAL DEFAULT 0,
        grade_salary REAL DEFAULT 0,
        work_days REAL DEFAULT 26,
        base_work_salary REAL DEFAULT 0,
        ot_hours REAL DEFAULT 0,
        ot_salary REAL DEFAULT 0,
        responsibility_quota REAL DEFAULT 0,
        responsibility_deduction_rate REAL DEFAULT 0,
        responsibility_net REAL DEFAULT 0,
        responsibility_kpi REAL DEFAULT 0,
        performance_bonus REAL DEFAULT 0,
        discipline_deduction REAL DEFAULT 0,
        performance_net REAL DEFAULT 0,
        performance_kpi REAL DEFAULT 0,
        other_bonus REAL DEFAULT 0,
        meal_phone_allowance REAL DEFAULT 0,
        other_allowance REAL DEFAULT 0,
        social_insurance REAL DEFAULT 0,
        union_fee REAL DEFAULT 0,
        income_tax REAL DEFAULT 0,
        advance_payment REAL DEFAULT 0,
        hour_deduction REAL DEFAULT 0,
        other_deductions REAL DEFAULT 0,
        uniform_refund REAL DEFAULT 0,
        net_salary REAL DEFAULT 0,
        status TEXT DEFAULT 'Dự thảo',
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(employee_id, month, year),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 11. KPI (Legacy & Monthly KPI)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS kpi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        period_type TEXT NOT NULL,
        period TEXT NOT NULL,
        target TEXT,
        result TEXT,
        score REAL DEFAULT 0,
        manager_comment TEXT,
        classification TEXT,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 11b. Monthly KPI (Quản lý KPI Tháng)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS employee_monthly_kpis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        responsibility_bonus REAL DEFAULT 0,
        responsibility_penalty REAL DEFAULT 0,
        responsibility_rate REAL DEFAULT 1.0,
        responsibility_amount REAL DEFAULT 0,
        performance_bonus REAL DEFAULT 0,
        discipline_deduction REAL DEFAULT 0,
        note TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT,
        UNIQUE(employee_id, month, year),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Migration for existing tables:
    const payrollNewCols = [
      'work_days REAL DEFAULT 26',
      'base_work_salary REAL DEFAULT 0',
      'ot_hours REAL DEFAULT 0',
      'ot_salary REAL DEFAULT 0',
      'responsibility_kpi REAL DEFAULT 0',
      'performance_kpi REAL DEFAULT 0',
      'other_bonus REAL DEFAULT 0',
      'meal_phone_allowance REAL DEFAULT 0',
      'other_allowance REAL DEFAULT 0',
      'social_insurance REAL DEFAULT 0',
      'union_fee REAL DEFAULT 0',
      'income_tax REAL DEFAULT 0',
      'advance_payment REAL DEFAULT 0',
      'hour_deduction REAL DEFAULT 0',
      'other_deductions REAL DEFAULT 0',
      'uniform_refund REAL DEFAULT 0'
    ];

    for (const colDef of payrollNewCols) {
      try {
        await query.run(`ALTER TABLE payrolls ADD COLUMN ${colDef}`);
      } catch (e) {}
    }

    try {
      await query.run('ALTER TABLE employee_monthly_kpis ADD COLUMN responsibility_rate REAL DEFAULT 1.0');
    } catch (e) {}

    try {
      await query.run('ALTER TABLE employee_monthly_kpis ADD COLUMN responsibility_amount REAL DEFAULT 0');
    } catch (e) {}

    // 12. Training Courses
    await query.exec(`
      CREATE TABLE IF NOT EXISTS training (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        provider TEXT,
        start_date TEXT,
        end_date TEXT,
        cost REAL DEFAULT 0,
        status TEXT DEFAULT 'Lên kế hoạch',
        notes TEXT,
        description TEXT,
        schedule TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    const trainingNewCols = [
      'provider TEXT',
      'start_date TEXT',
      'end_date TEXT',
      'cost REAL DEFAULT 0',
      "status TEXT DEFAULT 'Lên kế hoạch'",
      'notes TEXT',
      'updated_at TEXT'
    ];
    for (const c of trainingNewCols) {
      try {
        await query.run(`ALTER TABLE training ADD COLUMN ${c}`);
      } catch (e) {}
    }

    // 12b. Training Participants
    await query.exec(`
      CREATE TABLE IF NOT EXISTS training_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        training_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Đăng ký',
        result TEXT,
        certificate TEXT,
        FOREIGN KEY (training_id) REFERENCES training(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 13. Career Paths
    await query.exec(`
      CREATE TABLE IF NOT EXISTS career_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        current_position_id INTEGER,
        target_position_id INTEGER,
        skills_to_develop TEXT,
        training_plan TEXT,
        promotion_history TEXT,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (current_position_id) REFERENCES positions(id) ON DELETE SET NULL,
        FOREIGN KEY (target_position_id) REFERENCES positions(id) ON DELETE SET NULL
      )
    `);

    // 14. Rewards
    await query.exec(`
      CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        date TEXT,
        reward_type TEXT,
        value REAL DEFAULT 0,
        decision_file TEXT,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 15. Discipline
    await query.exec(`
      CREATE TABLE IF NOT EXISTS discipline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        form TEXT NOT NULL,
        date TEXT,
        value REAL DEFAULT 0,
        decision_maker_id INTEGER,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (decision_maker_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    try {
      await query.run('ALTER TABLE discipline ADD COLUMN value REAL DEFAULT 0');
    } catch (e) {}

    // 16. Innovations
    await query.exec(`
      CREATE TABLE IF NOT EXISTS innovations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        date TEXT,
        category TEXT DEFAULT 'Sản xuất',
        target_unit TEXT DEFAULT 'Toàn công ty',
        is_anonymous INTEGER DEFAULT 0,
        attachment_url TEXT,
        status TEXT DEFAULT 'Chờ tiếp nhận',
        efficiency TEXT,
        cost_savings REAL DEFAULT 0,
        productivity_increase TEXT,
        value_created TEXT,
        response_notes TEXT,
        response_by TEXT,
        response_date TEXT,
        reward_amount REAL DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    const innovationNewCols = [
      "category TEXT DEFAULT 'Sản xuất'",
      "target_unit TEXT DEFAULT 'Toàn công ty'",
      "is_anonymous INTEGER DEFAULT 0",
      "attachment_url TEXT",
      "response_notes TEXT",
      "response_by TEXT",
      "response_date TEXT",
      "reward_amount REAL DEFAULT 0",
      "likes_count INTEGER DEFAULT 0",
      "updated_at TEXT"
    ];

    for (const colDef of innovationNewCols) {
      try {
        await query.run(`ALTER TABLE innovations ADD COLUMN ${colDef}`);
      } catch (e) {}
    }

    // 17. Work History
    await query.exec(`
      CREATE TABLE IF NOT EXISTS work_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        department_id INTEGER,
        position_id INTEGER,
        start_date TEXT,
        end_date TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
      )
    `);

    // 18. Audit Logs
    await query.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        details TEXT,
        created_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // 19. Notifications
    await query.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 20. Assets (Công cụ dụng cụ & Tài sản)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        department_id INTEGER,
        assigned_to INTEGER,
        serial_number TEXT,
        purchase_date TEXT,
        purchase_price REAL DEFAULT 0,
        status TEXT DEFAULT 'Đang sử dụng',
        specifications TEXT,
        next_maintenance_date TEXT,
        location TEXT,
        image_url TEXT,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 21. Asset Allocations (Lịch sử cấp phát & Bàn giao)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS asset_allocations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        allocated_date TEXT NOT NULL,
        returned_date TEXT,
        condition_on_alloc TEXT,
        condition_on_return TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 22. Asset Maintenance Tickets (Phiếu báo hỏng & Sửa chữa)
    await query.exec(`
      CREATE TABLE IF NOT EXISTS asset_maintenance_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        reported_by INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'Trung bình',
        status TEXT DEFAULT 'Chờ tiếp nhận',
        repair_cost REAL DEFAULT 0,
        repair_date TEXT,
        repaired_by TEXT,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_by) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    const assetNewCols = [
      'quantity INTEGER DEFAULT 1',
      "asset_type TEXT DEFAULT 'CCDC'",
      'years_used REAL DEFAULT 0',
      'lifespan_years REAL DEFAULT 0',
      'remaining_value REAL DEFAULT 0'
    ];

    for (const colDef of assetNewCols) {
      try {
        await query.run(`ALTER TABLE assets ADD COLUMN ${colDef}`);
      } catch (e) {}
    }

    console.log('Đã tạo tất cả bảng cơ sở dữ liệu quan hệ (bao gồm quản lý tài sản & thiết bị).');

    // Tự động nạp dữ liệu cơ bản nếu bảng roles trống
    const roleCount = await query.get('SELECT COUNT(*) as total FROM roles');
    if (roleCount.total === 0) {
      console.log('Cơ sở dữ liệu mới phát hiện. Đang tự động nạp dữ liệu mặc định...');
      
      // 1. Seed Roles
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

      // 4. Seed Users
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
      console.log('Đã nạp thành công các vai trò và tài khoản đăng nhập mặc định.');
    }

    // Tự động tạo Indexes để tăng tốc độ truy vấn gấp 10-20 lần
    await query.exec(`
      CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
      CREATE INDEX IF NOT EXISTS idx_employees_pos ON employees(position_id);
      CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
      CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(code);
      CREATE INDEX IF NOT EXISTS idx_payrolls_month_emp ON payrolls(month, employee_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_date_emp ON attendance(date, employee_id);
      CREATE INDEX IF NOT EXISTS idx_kpis_month_emp ON employee_monthly_kpis(month, employee_id);
      CREATE INDEX IF NOT EXISTS idx_assets_dept ON assets(department_id);
      CREATE INDEX IF NOT EXISTS idx_assets_assigned ON assets(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_contracts_emp ON contracts(employee_id);
      CREATE INDEX IF NOT EXISTS idx_leave_emp ON leave_requests(employee_id);
      CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);
    `);

    // Đồng bộ chuẩn hóa tài khoản & bảo mật mật khẩu tự động khi khởi động
    try {
      const salt = bcrypt.genSaltSync(10);
      const employees = await query.all('SELECT id, code, fullname FROM employees');
      
      const adminCodes = ['VietA 002', 'VietA 032', 'VietA 043'];
      const managerCodes = [
        'VietA 003', 'VietA 015', 'VietA 031', 'VietA 035', 
        'VietA 036', 'VietA 046', 'VietA 050', 'VietA 056'
      ];

      for (const emp of employees) {
        const cleanCode = emp.code.trim();
        const numStr = (cleanCode || '').replace(/\D/g, '').padStart(3, '0');
        const username = cleanCode.toLowerCase().replace(/\s+/g, '');
        
        let roleId = 4; // EMPLOYEE
        let plainPass = `VietA#Emp@${numStr}*7W`;

        if (adminCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
          roleId = 1;
          plainPass = `VietA#Admin@${numStr}!8X`;
        } else if (managerCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
          roleId = 3;
          plainPass = `VietA#Mgr@${numStr}$9Q`;
        }

        const passHash = bcrypt.hashSync(plainPass, salt);
        const existing = await query.get('SELECT id FROM users WHERE employee_id = ? OR username = ?', [emp.id, username]);
        if (existing) {
          await query.run('UPDATE users SET username = ?, password = ?, role_id = ?, employee_id = ?, is_active = 1 WHERE id = ?', [username, passHash, roleId, emp.id, existing.id]);
        } else {
          await query.run('INSERT INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)', [username, passHash, roleId, emp.id, new Date().toISOString(), new Date().toISOString()]);
        }
      }

      // Cập nhật các alias tiện ích
      const uAdmin = await query.get("SELECT id FROM employees WHERE code LIKE '%032%'");
      if (uAdmin) {
        await query.run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'admin'", [bcrypt.hashSync('VietA#Admin@Root!9X9', salt), uAdmin.id]);
        await query.run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'hr_manager'", [bcrypt.hashSync('VietA#HR@Admin!8K8', salt), uAdmin.id]);
      }
      const uDept = await query.get("SELECT id FROM employees WHERE code LIKE '%036%'");
      if (uDept) {
        await query.run("UPDATE users SET password = ?, role_id = 3, employee_id = ? WHERE username = 'dept_manager'", [bcrypt.hashSync('VietA#Manager@Dept!7M7', salt), uDept.id]);
      }
      const uEmp = await query.get("SELECT id FROM employees WHERE code LIKE '%002%'");
      if (uEmp) {
        await query.run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'employee1'", [bcrypt.hashSync('VietA#Admin@002!8X', salt), uEmp.id]);
      }
    } catch (syncErr) {
      console.error('Lỗi đồng bộ users lúc init:', syncErr);
    }
  } catch (error) {
    console.error('Lỗi khởi tạo cơ sở dữ liệu:', error);
    throw error;
  }
};

export default db;
