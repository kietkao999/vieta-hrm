import { query } from './src/config/database.js';

async function checkAllDeptManagers() {
  const depts = await query.all('SELECT * FROM departments ORDER BY id');
  
  for (const d of depts) {
    const emps = await query.all(`
      SELECT e.id, e.code, e.fullname, p.name as pos, m.fullname as manager
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.department_id = ?
      ORDER BY e.code
    `, [d.id]);

    console.log(`\n=== PHÒNG BAN: ${d.name} (${emps.length} nhân sự) ===`);
    console.table(emps);
  }

  process.exit(0);
}

checkAllDeptManagers().catch(e => { console.error(e); process.exit(1); });
