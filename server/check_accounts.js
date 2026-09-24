import { query } from './src/config/database.js';

async function check() {
  const sql = `
    SELECT 
      u.id as user_id,
      u.username,
      u.role_id,
      r.name as role_name,
      e.id as employee_id,
      e.code as employee_code,
      e.fullname,
      p.name as position_name,
      d.name as department_name,
      e.email,
      e.phone,
      u.is_active
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC, d.name ASC, e.code ASC
  `;

  const users = await query.all(sql);
  console.log('=== TỔNG QUAN TÀI KHOẢN TRONG HỆ THỐNG ===');
  console.log(`Tổng số user accounts: ${users.length}`);

  const admins = users.filter(u => u.role_id === 1);
  const managers = users.filter(u => u.role_id === 3);
  const employees = users.filter(u => u.role_id === 4);
  const others = users.filter(u => ![1, 3, 4].includes(u.role_id));

  console.log(`\n1. CẤP 1 - ADMIN: ${admins.length} tài khoản`);
  admins.forEach(a => console.log(`   - [${a.username}] ${a.fullname || 'Alias'} (${a.employee_code || '-'}) | Phòng: ${a.department_name || '-'} | Chức vụ: ${a.position_name || '-'}`));

  console.log(`\n2. CẤP 2 - MANAGER: ${managers.length} tài khoản`);
  managers.forEach(m => console.log(`   - [${m.username}] ${m.fullname || 'Alias'} (${m.employee_code || '-'}) | Phòng: ${m.department_name || '-'} | Chức vụ: ${m.position_name || '-'}`));

  console.log(`\n3. CẤP 3 - EMPLOYEE: ${employees.length} tài khoản`);
  console.log(`\n4. KHÁC / CHƯA XÁC ĐỊNH: ${others.length}`);

  // Kiểm tra nhân viên chưa có tài khoản
  const unlinkedEmps = await query.all(`
    SELECT e.id, e.code, e.fullname, d.name as dept_name
    FROM employees e
    LEFT JOIN users u ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE u.id IS NULL
  `);
  console.log(`\n5. Nhân viên CHƯA có tài khoản user: ${unlinkedEmps.length}`);
  if (unlinkedEmps.length > 0) {
    unlinkedEmps.forEach(e => console.log(`   - ${e.code} - ${e.fullname} (${e.dept_name})`));
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
