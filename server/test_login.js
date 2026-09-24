import bcrypt from 'bcryptjs';
import { query } from './src/config/database.js';

async function testLogin() {
  const user = await query.get(`
    SELECT u.id, u.username, u.password, u.is_active, u.role_id, r.name as roleName,
           e.code as employeeCode, e.fullname
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.username = 'vieta036' OR e.code LIKE '%036%'
  `);

  console.log('USER INFO:', user);

  if (!user) {
    console.log('User vieta036 not found!');
    process.exit(0);
  }

  const pass1 = 'VietA#Mgr@036$9Q';
  const pass2 = 'Manager@123';

  console.log('Testing password 1:', pass1, '=> MATCH?', bcrypt.compareSync(pass1, user.password));
  console.log('Testing password 2:', pass2, '=> MATCH?', bcrypt.compareSync(pass2, user.password));

  // Let's test the exact auth controller query logic:
  const rawInput = 'vieta036';
  const cleanInput = rawInput.toLowerCase().replace(/\s+/g, '');

  const queryUser = await query.get(
    `SELECT u.id, u.username, u.password, u.is_active, u.role_id, r.name as roleName, r.display_name as roleDisplayName,
            e.id as employeeId, e.code as employeeCode, e.fullname, e.email, e.avatar, e.department_id,
            d.name as department_name, p.name as position_name, b.name as branch_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     LEFT JOIN employees e ON u.employee_id = e.id
     LEFT JOIN departments d ON e.department_id = d.id
     LEFT JOIN positions p ON e.position_id = p.id
     LEFT JOIN branches b ON e.branch_id = b.id
     WHERE LOWER(u.username) = LOWER(?)
        OR LOWER(REPLACE(u.username, ' ', '')) = ?
        OR LOWER(e.code) = LOWER(?)
        OR LOWER(REPLACE(e.code, ' ', '')) = ?
        OR LOWER(REPLACE(e.code, 'vieta', '')) = ?
     LIMIT 1`,
    [rawInput, cleanInput, rawInput, cleanInput, cleanInput]
  );

  console.log('Query matches user?:', !!queryUser, queryUser?.username);

  process.exit(0);
}

testLogin().catch(e => { console.error(e); process.exit(1); });
