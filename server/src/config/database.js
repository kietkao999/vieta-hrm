import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lưu file db trong thư mục server hoặc lấy từ cấu hình Cloud (như Railway Volume)
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../hrm.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối cơ sở dữ liệu SQLite:', err.message);
  } else {
    console.log('Đã kết nối thành công đến cơ sở dữ liệu SQLite tại:', dbPath);
    // Bật khóa ngoại và chế độ WAL để tăng hiệu năng ghi đồng thời
    db.run('PRAGMA foreign_keys = ON;');
    db.run('PRAGMA journal_mode = WAL;');
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
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
      )
    `);

    // 4. Positions
    await query.exec(`
      CREATE TABLE IF NOT EXISTS positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        department_id INTEGER,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

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
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

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

    // 10. Payroll
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

    // 11. KPI
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

    // 12. Training Courses
    await query.exec(`
      CREATE TABLE IF NOT EXISTS training (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        description TEXT,
        schedule TEXT,
        created_at TEXT
      )
    `);

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
        decision_maker_id INTEGER,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (decision_maker_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 16. Innovations
    await query.exec(`
      CREATE TABLE IF NOT EXISTS innovations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        date TEXT,
        status TEXT DEFAULT 'Đề xuất',
        efficiency TEXT,
        cost_savings REAL DEFAULT 0,
        productivity_increase TEXT,
        value_created TEXT,
        created_at TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

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

    console.log('Đã tạo tất cả bảng cơ sở dữ liệu quan hệ.');
  } catch (error) {
    console.error('Lỗi khởi tạo cơ sở dữ liệu:', error);
    throw error;
  }
};

export default db;
