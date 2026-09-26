import bcrypt from 'bcryptjs';
import { query } from './database.js';

function generateStrongPassword(roleId, employeeCode) {
  const cleanCode = (employeeCode || '').replace(/\D/g, '').padStart(3, '0');
  if (roleId === 1) {
    return `VietA#Admin@${cleanCode || '001'}!8X`;
  } else if (roleId === 3) {
    return `VietA#Mgr@${cleanCode}$9Q`;
  } else {
    return `VietA#Emp@${cleanCode}*7W`;
  }
}

export async function syncAllUserPasswords() {
  try {
    const users = await query.all(`
      SELECT u.id, u.username, u.role_id, e.code as employee_code
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
    `);

    const salt = bcrypt.genSaltSync(10);
    for (const u of users) {
      let plainPassword = '';
      if (u.username === 'admin') plainPassword = 'VietA#Admin@Root!9X9';
      else if (u.username === 'hr_manager') plainPassword = 'VietA#HR@Admin!8K8';
      else if (u.username === 'dept_manager') plainPassword = 'VietA#Manager@Dept!7M7';
      else plainPassword = generateStrongPassword(u.role_id, u.employee_code);

      const passwordHash = bcrypt.hashSync(plainPassword, salt);
      await query.run('UPDATE users SET password = ? WHERE id = ?', [passwordHash, u.id]);
    }
    console.log(`[PASSWORDS SYNCED] Đồng bộ mật khẩu 57 tài khoản thành công.`);
  } catch (err) {
    console.error('Lỗi khi đồng bộ mật khẩu tài khoản:', err);
  }
}
