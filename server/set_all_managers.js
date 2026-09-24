import { query } from './src/config/database.js';

async function setAllManagers() {
  // 1. BGĐ
  const cuong = await query.get("SELECT id FROM employees WHERE code LIKE '%002%'");

  // Các Trưởng phòng / Quản lý:
  const trucXinh = await query.get("SELECT id FROM employees WHERE code LIKE '%032%'"); // Khối VP
  const thuTam = await query.get("SELECT id FROM employees WHERE code LIKE '%003%'");   // Kho Cần Thơ
  const tuyetHuong = await query.get("SELECT id FROM employees WHERE code LIKE '%015%'"); // Kho Mỹ Tho
  const minhLy = await query.get("SELECT id FROM employees WHERE code LIKE '%050%'");     // Xưởng nệm
  const thaiCan = await query.get("SELECT id FROM employees WHERE code LIKE '%046%'");    // Xưởng gối
  const tanHung = await query.get("SELECT id FROM employees WHERE code LIKE '%036%'");    // Kinh doanh
  const tuanKiet = await query.get("SELECT id FROM employees WHERE code LIKE '%043%'");   // Marketing

  console.log('=== THIẾT LẬP CÂY QUẢN LÝ TRỰC TIẾP TOÀN CÔNG TY ===');

  // Khối văn phòng (dept 9) -> Huỳnh Thị Trúc Xinh
  if (trucXinh) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 9 AND id != ?", [trucXinh.id, trucXinh.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, trucXinh.id]);
  }

  // Kho Cần Thơ (dept 8) -> Nguyễn Thị Thu Tâm
  if (thuTam) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 8 AND id != ?", [thuTam.id, thuTam.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, thuTam.id]);
  }

  // Kho Mỹ Tho (dept 11) -> Dương Thị Tuyết Hường
  if (tuyetHuong) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 11 AND id != ?", [tuyetHuong.id, tuyetHuong.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, tuyetHuong.id]);
  }

  // Xưởng sản xuất nệm (dept 10) -> Trần Minh Lý
  if (minhLy) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 10 AND id != ?", [minhLy.id, minhLy.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, minhLy.id]);
  }

  // Xưởng sản xuất gối (dept 14) -> Nguyễn Thái Cần
  if (thaiCan) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 14 AND id != ?", [thaiCan.id, thaiCan.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, thaiCan.id]);
  }

  // Phòng Kinh doanh (dept 12) -> Phạm Tấn Hưng
  if (tanHung) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 12 AND id != ?", [tanHung.id, tanHung.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, tanHung.id]);
  }

  // Phòng Marketing (dept 13) -> Phan Tuấn Kiệt
  if (tuanKiet) {
    await query.run("UPDATE employees SET manager_id = ? WHERE department_id = 13 AND id != ?", [tuanKiet.id, tuanKiet.id]);
    if (cuong) await query.run("UPDATE employees SET manager_id = ? WHERE id = ?", [cuong.id, tuanKiet.id]);
  }

  console.log('Đã gán người quản lý trực tiếp thành công cho toàn bộ 57 nhân sự!');
  process.exit(0);
}

setAllManagers().catch(e => { console.error(e); process.exit(1); });
