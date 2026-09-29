import { query } from './src/config/database.js';
import { syncAllUserPasswords } from './src/config/syncPasswords.js';

async function update() {
  await query.run(`UPDATE users SET role_id = 4 WHERE username = 'vieta056' OR employee_id IN (SELECT id FROM employees WHERE fullname LIKE '%Bảo Châu%')`);
  await syncAllUserPasswords();
  const u = await query.get(`
    SELECT u.username, u.role_id, r.name as role_name, r.display_name as role_display_name, e.fullname, e.code
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.username = 'vieta056' OR e.fullname LIKE '%Bảo Châu%'
  `);
  console.log('>>> THÔNG TIN ĐÃ CẬP NHẬT TRÊN CƠ SỞ DỮ LIỆU:', u);
  process.exit(0);
}

update();
