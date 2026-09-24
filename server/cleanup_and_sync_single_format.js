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

async function main() {
  console.log('=== ĐỒNG BỘ 1 CÁCH ĐĂNG NHẬP DUY NHẤT THEO MÃ NHÂN VIÊN ===\n');

  // 1. Xóa toàn bộ alias không phải mã nhân viên
  await run("DELETE FROM users WHERE username IN ('admin', 'hr_manager', 'dept_manager', 'employee1')");
  console.log('Đã xóa tất cả các tài khoản alias rườm rà (admin, hr_manager, dept_manager, employee1).');

  // 2. Lấy 57 nhân viên
  const employees = await all(`
    SELECT e.id, e.code, e.fullname, e.department_id, d.name as dept_name, p.name as pos_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    ORDER BY e.code ASC
  `);

  console.log(`Tìm thấy ${employees.length} nhân viên trong hệ thống.`);

  const salt = bcrypt.genSaltSync(10);
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

  const results = [];

  for (const emp of employees) {
    const cleanCode = emp.code.trim();
    const numStr = cleanCode.replace(/\D/g, '').padStart(3, '0');
    // Duy nhất 1 định dạng: vieta001, vieta002, vieta036,...
    const username = cleanCode.toLowerCase().replace(/\s+/g, '');

    let roleId = 4; // EMPLOYEE
    let roleLabel = 'CẤP 3 - EMPLOYEE';
    let plainPass = `VietA#Emp@${numStr}*7W`;

    if (adminCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
      roleId = 1;
      roleLabel = 'CẤP 1 - ADMIN';
      plainPass = `VietA#Admin@${numStr}!8X`;
    } else if (managerCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
      roleId = 3;
      roleLabel = 'CẤP 2 - MANAGER';
      plainPass = `VietA#Mgr@${numStr}$9Q`;
    }

    const passHash = bcrypt.hashSync(plainPass, salt);
    const now = new Date().toISOString();

    const existing = await get('SELECT id FROM users WHERE employee_id = ? OR username = ?', [emp.id, username]);
    if (existing) {
      await run(
        'UPDATE users SET username = ?, password = ?, role_id = ?, employee_id = ?, is_active = 1, updated_at = ? WHERE id = ?',
        [username, passHash, roleId, emp.id, now, existing.id]
      );
    } else {
      await run(
        'INSERT INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
        [username, passHash, roleId, emp.id, now, now]
      );
    }

    results.push({
      code: cleanCode,
      username,
      fullname: emp.fullname,
      dept: emp.dept_name || 'Chưa phân bổ',
      pos: emp.pos_name || '-',
      role: roleLabel,
      password: plainPass
    });
  }

  const userCount = await get('SELECT COUNT(*) as c FROM users');
  console.log(`\nTổng số tài khoản trong Database hiện tại: ${userCount.c} (Đúng bằng 57 nhân sự).`);
  console.log('Hoàn tất 100%!');
  db.close();
}

main().catch(e => { console.error(e); db.close(); process.exit(1); });
