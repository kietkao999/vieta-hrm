import bcrypt from 'bcryptjs';
import { query } from './src/config/database.js';

async function testLogin() {
  const u003 = await query.get(`
    SELECT u.id, u.username, u.password, u.role_id, r.name as roleName, e.code as employeeCode, e.fullname
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN employees e ON u.employee_id = e.id
    WHERE u.username = 'vieta003'
  `);
  console.log('User 003 info:', u003);
  console.log('Match VietA#Mgr@003$9Q:', bcrypt.compareSync('VietA#Mgr@003$9Q', u003.password));
  console.log('Match VietA#Emp@003*7W:', bcrypt.compareSync('VietA#Emp@003*7W', u003.password));
  process.exit(0);
}

testLogin();
