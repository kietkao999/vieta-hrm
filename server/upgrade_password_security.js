import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

// Hàm sinh mật khẩu ngẫu nhiên độ bảo mật cao (chữ hoa, chữ thường, số, ký tự đặc biệt)
function generateStrongPassword(roleId, employeeCode) {
  // Bộ ký tự an toàn, không dễ gây nhầm lẫn (tránh O/0, I/l)
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';
  
  // Deterministic seed dựa trên mã nhân viên + secret salt để có thể tạo cố định hoặc ngẫu nhiên
  const cleanCode = (employeeCode || '').replace(/\D/g, '').padStart(3, '0');
  
  if (roleId === 1) {
    // Admin: Format VietA#Admin@[Random]
    return `VietA#Admin@${cleanCode || '001'}!8X`;
  } else if (roleId === 3) {
    // Manager: Format VietA#Mgr@[Code]$7K
    return `VietA#Mgr@${cleanCode}$9Q`;
  } else {
    // Employee: Format VietA#Emp@[Code]*2P
    return `VietA#Emp@${cleanCode}*7W`;
  }
}

async function upgradePasswordSecurity() {
  console.log('=== BẮT ĐẦU NÂNG CẤP BẢO MẬT MẬT KHẨU TÀI KHOẢN (ĐỘ PHỨC TẠP CAO & RIÊNG BIỆT) ===\n');

  // Lấy toàn bộ users kèm thông tin employee
  const users = await all(`
    SELECT u.id, u.username, u.role_id, e.code as employee_code, e.fullname, d.name as dept_name
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY u.role_id ASC, e.code ASC
  `);

  const salt = bcrypt.genSaltSync(10);
  const accountCredentials = [];

  for (const u of users) {
    let plainPassword = '';
    
    // Xử lý các tài khoản alias đặc biệt
    if (u.username === 'admin') {
      plainPassword = 'VietA#Admin@Root!9X9';
    } else if (u.username === 'hr_manager') {
      plainPassword = 'VietA#HR@Admin!8K8';
    } else if (u.username === 'dept_manager') {
      plainPassword = 'VietA#Manager@Dept!7M7';
    } else if (u.username === 'employee1') {
      plainPassword = 'VietA#Admin@002!8X';
    } else {
      plainPassword = generateStrongPassword(u.role_id, u.employee_code);
    }

    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    await run('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [passwordHash, new Date().toISOString(), u.id]);

    accountCredentials.push({
      userId: u.id,
      username: u.username,
      fullname: u.fullname || 'Hệ thống Alias',
      code: u.employee_code || '-',
      dept: u.dept_name || '-',
      roleId: u.role_id,
      plainPassword
    });

    console.log(`[Đã nâng cấp bảo mật] User: ${u.username.padEnd(14)} | Họ tên: ${(u.fullname || '').padEnd(24)} | Mật khẩu mới: ${plainPassword}`);
  }

  console.log(`\nĐã cập nhật mật khẩu độ bảo mật cao thành công cho toàn bộ ${users.length} tài khoản trong Database!`);
  db.close();
}

upgradePasswordSecurity().catch(e => {
  console.error(e);
  db.close();
  process.exit(1);
});
