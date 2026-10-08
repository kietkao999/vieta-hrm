import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { query } from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1atUB21raRpjsRxq9Lx2IKBGYqkSrdAxazuY0yNEMnCQ/export?format=xlsx';

async function downloadSpreadsheet(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 307) {
        https.get(res.headers.location, (r2) => {
          const file = fs.createWriteStream(dest);
          r2.pipe(file);
          file.on('finish', () => resolve());
          file.on('error', reject);
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => resolve());
        file.on('error', reject);
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

export async function syncOctoberAttendance() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ CHẤM CÔNG THÁNG 10/2026 TỪ GOOGLE SHEETS ===');
  
  const tempFile = path.resolve(__dirname, 'october_sheets_temp.xlsx');
  console.log('Đang tải file Excel mới nhất từ Google Sheets...');
  await downloadSpreadsheet(SHEET_URL, tempFile);
  console.log('Đã tải xong file Excel.');

  const wb = XLSX.readFile(tempFile);
  const now = new Date().toISOString();
  let totalProcessed = 0;
  let totalInserted = 0;

  // Danh sách các sheet cần duyệt (ưu tiên 'VĂN PHÒNG', và tất cả các sheet có dữ liệu)
  const targetSheets = wb.SheetNames; // duyệt tất cả các sheet!

  for (const sheetName of targetSheets) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // Đếm xem sheet có dữ liệu không
    let sheetFilledCount = 0;
    for (let r = 4; r < data.length; r++) {
      const row = data[r];
      if (row && typeof row[0] === 'number') {
        for (let d = 1; d <= 31; d++) {
          if (row[4 + d] !== undefined && row[4 + d] !== null && String(row[4 + d]).trim() !== '') {
            sheetFilledCount++;
          }
        }
      }
    }

    if (sheetFilledCount === 0) {
      console.log(`- Sheet [${sheetName}]: Chưa có dữ liệu chấm công.`);
      continue;
    }

    console.log(`\n>>> ĐANG ĐỒNG BỘ SHEET [${sheetName}] (${sheetFilledCount} ô có dữ liệu)...`);

    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || typeof row[0] !== 'number' || !row[2]) continue;

      const stt = row[0];
      const code = row[1] ? String(row[1]).trim() : '';
      const name = String(row[2]).trim();
      const pos = row[4] ? String(row[4]).trim() : '';

      // Tìm nhân viên trong CSDL bằng code hoặc fullname
      let emp = null;
      if (code) {
        emp = await query.get('SELECT id, code, fullname FROM employees WHERE code = ?', [code]);
      }
      if (!emp && name) {
        emp = await query.get('SELECT id, code, fullname FROM employees WHERE fullname = ?', [name]);
      }

      if (!emp) {
        console.warn(`  [!] Không tìm thấy nhân viên: ${code} - ${name}`);
        continue;
      }

      // Kiểm tra xem dòng dưới có phải là dòng "Tăng ca (giờ)" và "Trễ / Sớm (phút)"
      let otRow = null;
      let lateRow = null;
      if (data[i + 1] && String(data[i + 1][2] || '').includes('Tăng ca')) {
        otRow = data[i + 1];
      }
      if (data[i + 2] && String(data[i + 2][2] || '').includes('Trễ')) {
        lateRow = data[i + 2];
      }

      let empDaysCount = 0;
      for (let day = 1; day <= 31; day++) {
        const dayValRaw = row[4 + day];
        const val = dayValRaw !== undefined && dayValRaw !== null ? String(dayValRaw).trim().toUpperCase() : '';
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `2026-10-${dayStr}`;

        // Lấy số giờ tăng ca (nếu có)
        let otHours = 0;
        if (otRow && otRow[4 + day] !== undefined && otRow[4 + day] !== null) {
          const parsedOt = parseFloat(otRow[4 + day]);
          if (!isNaN(parsedOt)) otHours = parsedOt;
        }

        // Lấy số phút trễ (nếu có)
        let lateMins = 0;
        if (lateRow && lateRow[4 + day] !== undefined && lateRow[4 + day] !== null) {
          const parsedLate = parseInt(lateRow[4 + day], 10);
          if (!isNaN(parsedLate)) lateMins = parsedLate;
        }

        if (!val && otHours === 0 && lateMins === 0) {
          continue;
        }

        let status = 'Có mặt';
        let checkIn = '08:00';
        let checkOut = '17:00';
        let note = '';

        if (val === 'X') {
          status = 'Có mặt';
          checkIn = '08:00';
          checkOut = '17:00';
          note = 'Đi làm cả ngày (1 công)';
        } else if (val === 'NN') {
          status = 'Nghỉ nửa ngày';
          checkIn = '08:00';
          checkOut = '12:00';
          note = 'Làm nửa ngày (0.5 công)';
        } else if (val === 'P') {
          status = 'Nghỉ phép';
          checkIn = null;
          checkOut = null;
          note = 'Nghỉ phép năm';
        } else if (val === 'KL') {
          status = 'Nghỉ không lương';
          checkIn = null;
          checkOut = null;
          note = 'Nghỉ không lương';
        } else if (val === 'CT') {
          status = 'Công tác';
          checkIn = '08:00';
          checkOut = '17:00';
          note = 'Đi công tác';
        } else if (val === 'OFF') {
          status = 'Nghỉ tuần';
          checkIn = null;
          checkOut = null;
          note = 'Nghỉ hằng tuần (OFF)';
        } else if (val === 'L') {
          status = 'Nghỉ lễ';
          checkIn = null;
          checkOut = null;
          note = 'Nghỉ lễ hưởng lương';
        } else if (val === 'TS') {
          status = 'Nghỉ thai sản';
          checkIn = null;
          checkOut = null;
          note = 'Nghỉ thai sản';
        } else {
          status = 'Có mặt';
          note = val;
        }

        await query.run(`
          INSERT INTO attendance (employee_id, date, check_in, check_out, status, ot_hours, late_minutes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(employee_id, date) DO UPDATE SET
            check_in = excluded.check_in,
            check_out = excluded.check_out,
            status = excluded.status,
            ot_hours = excluded.ot_hours,
            late_minutes = excluded.late_minutes
        `, [emp.id, dateStr, checkIn, checkOut, status, otHours, lateMins, now]);

        empDaysCount++;
        totalInserted++;
      }

      console.log(`  ✓ [${emp.code}] ${emp.fullname}: Đã nạp ${empDaysCount} ngày công.`);
      totalProcessed++;
    }
  }

  // Xóa file temp
  if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

  console.log(`\n=== KẾT QUẢ ĐỒNG BỘ: Đã nạp thành công ${totalInserted} lượt chấm công cho ${totalProcessed} nhân viên! ===`);
  return { totalProcessed, totalInserted };
}

// Chạy trực tiếp nếu file được gọi từ CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncOctoberAttendance()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Lỗi khi đồng bộ:', err);
      process.exit(1);
    });
}
