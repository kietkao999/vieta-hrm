import { query } from './src/config/database.js';

async function exportTable() {
  const users = await query.all(`
    SELECT 
      e.code,
      u.username,
      e.fullname,
      d.name as dept_name,
      p.name as pos_name,
      r.name as role_name,
      u.role_id
    FROM users u
    JOIN employees e ON u.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC, e.code ASC
  `);

  function getPass(roleId, code) {
    const num = code.replace(/\D/g, '').padStart(3, '0');
    if (roleId === 1) return `VietA#Admin@${num}!8X`;
    if (roleId === 3) return `VietA#Mgr@${num}$9Q`;
    return `VietA#Emp@${num}*7W`;
  }

  console.log(`\n### 1. CẤP 1 - ADMIN (${users.filter(u => u.role_id === 1).length} tài khoản)`);
  console.log('| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban | Chức vụ | Mật khẩu duy nhất |');
  console.log('| :-: | :--- | :--- | :--- | :--- | :--- | :--- |');
  users.filter(u => u.role_id === 1).forEach((u, i) => {
    console.log(`| ${i + 1} | \`${u.code}\` | **\`${u.username}\`** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`);
  });

  console.log(`\n### 2. CẤP 2 - MANAGER (${users.filter(u => u.role_id === 3).length} tài khoản)`);
  console.log('| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu duy nhất |');
  console.log('| :-: | :--- | :--- | :--- | :--- | :--- | :--- |');
  users.filter(u => u.role_id === 3).forEach((u, i) => {
    console.log(`| ${i + 1} | \`${u.code}\` | **\`${u.username}\`** | **${u.fullname}** | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`);
  });

  console.log(`\n### 3. CẤP 3 - EMPLOYEE (${users.filter(u => u.role_id === 4).length} tài khoản)`);
  console.log('| STT | Mã NV | Tên đăng nhập | Họ và Tên | Phòng ban / Đơn vị | Chức vụ | Mật khẩu duy nhất |');
  console.log('| :-: | :--- | :--- | :--- | :--- | :--- | :--- |');
  users.filter(u => u.role_id === 4).forEach((u, i) => {
    console.log(`| ${i + 1} | \`${u.code}\` | **\`${u.username}\`** | ${u.fullname} | ${u.dept_name || '-'} | ${u.pos_name || '-'} | \`${getPass(u.role_id, u.code)}\` |`);
  });

  process.exit(0);
}

exportTable().catch(e => { console.error(e); process.exit(1); });
