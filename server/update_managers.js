import { query } from './src/config/database.js';

async function updateManagers() {
  // Lấy ID của Huỳnh Thị Trúc Xinh (VietA 032)
  const trucXinh = await query.get("SELECT id FROM employees WHERE code LIKE '%032%'");
  console.log('ID của Huỳnh Thị Trúc Xinh:', trucXinh?.id);

  if (trucXinh) {
    // Cập nhật người quản lý trực tiếp của các nhân sự trong Khối Văn Phòng (dept 9) sang Huỳnh Thị Trúc Xinh
    // Riêng Huỳnh Thị Trúc Xinh thì quản lý là Ban Giám Đốc (Võ Minh Cường - id 1)
    const cuong = await query.get("SELECT id FROM employees WHERE code LIKE '%002%'");
    
    // Gán các nhân viên trong khối văn phòng (trừ Trúc Xinh) có manager_id = trucXinh.id
    await query.run(
      "UPDATE employees SET manager_id = ? WHERE department_id = 9 AND id != ?",
      [trucXinh.id, trucXinh.id]
    );

    if (cuong) {
      await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, trucXinh.id]);
    }

    console.log('Đã cập nhật manager_id cho Khối văn phòng thành Huỳnh Thị Trúc Xinh.');
  }

  // Hiển thị lại danh sách nhân sự Khối văn phòng sau cập nhật
  const emps = await query.all(`
    SELECT 
      e.id, 
      e.code, 
      e.fullname, 
      p.name as pos_name, 
      d.name as dept_name, 
      m.fullname as manager_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN employees m ON e.manager_id = m.id
    WHERE e.department_id = 9
    ORDER BY e.code ASC
  `);

  console.log('=== DANH SÁCH KHỐI VĂN PHÒNG SAU KHI CẬP NHẬT QUẢN LÝ TRỰC TIẾP ===');
  console.table(emps);

  process.exit(0);
}

updateManagers().catch(e => { console.error(e); process.exit(1); });
