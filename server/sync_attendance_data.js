import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

export async function syncAttendanceData() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ DỮ LIỆU CHẤM CÔNG & TĂNG CA TỪ FILE EXCEL VÀO HỆ THỐNG ===');

  const now = new Date().toISOString();
  let totalInserted = 0;

  // 1. Đồng bộ Bảng Chấm Công Tháng 7/2026
  try {
    const f7 = path.join(rootDir, 'bảng chấm công tháng 7).xlsx');
    const wb7 = XLSX.readFile(f7);
    const s7 = wb7.Sheets[wb7.SheetNames[0]];
    const d7 = XLSX.utils.sheet_to_json(s7, { header: 1 });

    console.log(`Đang đọc file Chấm công Tháng 7 (${d7.length} dòng)...`);

    for (let r = 4; r < d7.length; r++) {
      const row = d7[r];
      if (!row || !row[1] || typeof row[1] !== 'string') continue;
      const code = row[1].trim();
      const emp = await query.get('SELECT id FROM employees WHERE code = ?', [code]);
      if (!emp) continue;

      // Đọc từng ngày từ 1 đến 31
      for (let day = 1; day <= 31; day++) {
        const colIdx = 3 + day; // Ngày 1 là cột 4 (index 4)
        const cellVal = row[colIdx] ? String(row[colIdx]).trim() : '';
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `2026-07-${dayStr}`;

        let status = 'Có mặt';
        let checkIn = '08:00';
        let checkOut = '17:00';
        let note = '';

        if (cellVal === 'OFF') {
          status = 'Nghỉ tuần (OFF)';
          checkIn = null;
          checkOut = null;
        } else if (cellVal === 'P') {
          status = 'Nghỉ phép năm (P)';
          checkIn = null;
          checkOut = null;
        } else if (cellVal === 'KL') {
          status = 'Nghỉ không lương (KL)';
          checkIn = null;
          checkOut = null;
        } else if (cellVal === 'NN') {
          status = 'Nghỉ nửa ngày (NN)';
          checkIn = '08:00';
          checkOut = '12:00';
        } else if (cellVal === 'TS') {
          status = 'Nghỉ thai sản (TS)';
          checkIn = null;
          checkOut = null;
        } else if (cellVal === 'X' || cellVal === 'x') {
          status = 'Có mặt (X)';
          checkIn = '08:00';
          checkOut = '17:00';
        } else if (!cellVal) {
          continue;
        }

        await query.run(`
          INSERT INTO attendance (employee_id, date, check_in, check_out, status, ot_hours, created_at)
          VALUES (?, ?, ?, ?, ?, 0, ?)
          ON CONFLICT(employee_id, date) DO UPDATE SET
            check_in = excluded.check_in,
            check_out = excluded.check_out,
            status = excluded.status
        `, [emp.id, dateStr, checkIn, checkOut, status, now]);
        totalInserted++;
      }
    }
    console.log(`✓ Đã nạp dữ liệu chấm công chi tiết Tháng 07/2026.`);
  } catch (err) {
    console.warn('Lỗi đồng bộ chấm công Tháng 7:', err.message);
  }

  // 2. Đồng bộ Tăng Ca & Chấm công Tháng 8/2026
  try {
    const f8 = path.join(rootDir, 'TĂNG CA THÁNG 8.2026.xlsx');
    const wb8 = XLSX.readFile(f8);
    const s8 = wb8.Sheets[wb8.SheetNames[0]];
    const d8 = XLSX.utils.sheet_to_json(s8, { header: 1 });

    console.log(`Đang đọc file Tăng ca Tháng 8 (${d8.length} dòng)...`);

    for (let r = 3; r < d8.length; r++) {
      const row = d8[r];
      if (!row || !row[1] || typeof row[1] !== 'string') continue;
      const code = row[1].trim();
      const otHours = parseFloat(row[5]) || 0;

      const emp = await query.get('SELECT id FROM employees WHERE code = ?', [code]);
      if (!emp) continue;

      // Cập nhật giờ tăng ca vào payrolls
      await query.run(`
        UPDATE payrolls SET ot_hours = ? WHERE employee_id = ? AND (month = '08' OR month = '8') AND year = 2026
      `, [otHours, emp.id]);

      // Thêm bản ghi tổng kết tăng ca cuối tháng 8 vào attendance
      if (otHours > 0) {
        await query.run(`
          INSERT INTO attendance (employee_id, date, check_in, check_out, status, ot_hours, created_at)
          VALUES (?, '2026-08-31', '08:00', '17:00', 'Tăng ca tháng 8', ?, ?)
          ON CONFLICT(employee_id, date) DO UPDATE SET
            ot_hours = excluded.ot_hours,
            status = excluded.status
        `, [emp.id, otHours, now]);
      }
    }
    console.log(`✓ Đã nạp và cập nhật dữ liệu tăng ca Tháng 08/2026.`);
  } catch (err) {
    console.warn('Lỗi đồng bộ tăng ca Tháng 8:', err.message);
  }

  console.log(`=== HOÀN TẤT ĐỒNG BỘ CHẤM CÔNG & TĂNG CA ===\n`);
}

if (process.argv[1] && process.argv[1].endsWith('sync_attendance_data.js')) {
  syncAttendanceData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
