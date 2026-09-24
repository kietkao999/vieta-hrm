import { query } from './src/config/database.js';

async function check() {
  const depts = await query.all('SELECT * FROM departments');
  console.log('ALL DEPTS:', depts);

  const empsInKhoiVP = await query.all(`
    SELECT e.id, e.code, e.fullname, e.department_id, e.position_id, p.name as pos_name, e.manager_id, m.fullname as manager_name
    FROM employees e
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.department_id = 9
  `);
  console.log('KHỐI VĂN PHÒNG EMPS:');
  console.table(empsInKhoiVP);

  // Check positions in db
  const positions = await query.all('SELECT * FROM positions WHERE department_id = 9');
  console.log('POSITIONS IN DEPT 9:');
  console.table(positions);

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
