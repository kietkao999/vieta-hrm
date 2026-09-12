import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'hrm.db');

const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

async function syncUsers() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ TÀI KHOẢN ĐĂNG NHẬP THEO MÃ NHÂN VIÊN & PHÂN QUYỀN ===\n');

  const salt = bcrypt.genSaltSync(10);
  const hashAdmin = bcrypt.hashSync('Admin@123', salt);
  const hashManager = bcrypt.hashSync('Manager@123', salt);
  const hashEmployee = bcrypt.hashSync('VietA@2026', salt);

  const adminCodes = ['VietA 002', 'VietA 032', 'VietA 043'];
  const managerCodes = [
    'VietA 003', // Thu Tâm - Kho Cần Thơ
    'VietA 015', // Tuyết Hường - Kho Mỹ Tho
    'VietA 031', // Quốc Hùng - Kế toán
    'VietA 035', // Huy Hoàng - R&D
    'VietA 036', // Tấn Hưng - Kinh doanh
    'VietA 046', // Thái Cần - Thổi gối
    'VietA 050', // Minh Lý - Xưởng nệm
    'VietA 056'  // Bảo Châu - Xưởng gối
  ];

  // Lấy toàn bộ danh sách nhân viên
  const employees = await all('SELECT id, code, fullname, department_id, position_id FROM employees ORDER BY code ASC');
  console.log(`Tìm thấy ${employees.length} nhân viên trong cơ sở dữ liệu.`);

  const now = new Date().toISOString();

  for (const emp of employees) {
    const cleanCode = emp.code.trim();
    // Tạo username chuẩn hóa: vieta002, vieta032,...
    const username = cleanCode.toLowerCase().replace(/\s+/g, '');

    let roleId = 4; // EMPLOYEE
    let passwordHash = hashEmployee;
    let roleLabel = 'EMPLOYEE';

    if (adminCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
      roleId = 1; // ADMIN
      passwordHash = hashAdmin;
      roleLabel = 'ADMIN';
    } else if (managerCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
      roleId = 3; // MANAGER
      passwordHash = hashManager;
      roleLabel = 'MANAGER';
    }

    // Kiểm tra xem đã có user cho employee_id này chưa hoặc theo username
    const existingUser = await get('SELECT id FROM users WHERE employee_id = ? OR username = ?', [emp.id, username]);

    if (existingUser) {
      await run(
        'UPDATE users SET username = ?, password = ?, role_id = ?, employee_id = ?, is_active = 1, updated_at = ? WHERE id = ?',
        [username, passwordHash, roleId, emp.id, now, existingUser.id]
      );
      console.log(`[Cập nhật] [${roleLabel}] Mã NV: ${cleanCode} -> Username: ${username} | Họ tên: ${emp.fullname}`);
    } else {
      await run(
        'INSERT INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [username, passwordHash, roleId, emp.id, now, now]
      );
      console.log(`[Tạo mới] [${roleLabel}] Mã NV: ${cleanCode} -> Username: ${username} | Họ tên: ${emp.fullname}`);
    }
  }

  // Cập nhật các alias tiện lợi: admin, hr_manager, dept_manager, employee1
  const uAdmin = await get("SELECT id FROM employees WHERE code LIKE '%032%'");
  if (uAdmin) {
    await run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'admin'", [hashAdmin, uAdmin.id]);
    await run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'hr_manager'", [hashAdmin, uAdmin.id]);
  }
  const uDept = await get("SELECT id FROM employees WHERE code LIKE '%036%'");
  if (uDept) {
    await run("UPDATE users SET password = ?, role_id = 3, employee_id = ? WHERE username = 'dept_manager'", [hashManager, uDept.id]);
  }
  const uEmp = await get("SELECT id FROM employees WHERE code LIKE '%002%'");
  if (uEmp) {
    await run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'employee1'", [hashAdmin, uEmp.id]);
  }

  console.log('\n=== ĐỒNG BỘ HOÀN TẤT THÀNH CÔNG! ===');
  db.close();
}

syncUsers().catch(err => {
  console.error('Lỗi:', err);
  db.close();
  process.exit(1);
});
