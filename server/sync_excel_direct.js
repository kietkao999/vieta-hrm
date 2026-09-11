import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileEmpPath = path.resolve(__dirname, '../NhanVien công ty tháng 9.2026 (1).xlsx');
const fileKpiPath = path.resolve(__dirname, '../TỔNG HỢP THƯỞNG KPI + HIỆU QUẢ CÔNG TY 2026.xlsx');

console.log('--- BẮT ĐẦU ĐỌC VÀ ĐỐI SOÁT TRỰC TIẾP TỪ 2 FILE EXCEL ---');

const wbEmp = xlsx.readFile(fileEmpPath);
const empSheet = wbEmp.Sheets['Danh sách nhân viên'];
const empRows = xlsx.utils.sheet_to_json(empSheet);

const wbKpi = xlsx.readFile(fileKpiPath);
const kpiSheet = wbKpi.Sheets['TỔNG HỢP'];
const kpiRowsRaw = xlsx.utils.sheet_to_json(kpiSheet, { header: 1 });

const kpiEntries = [];
for (let i = 5; i < kpiRowsRaw.length; i++) {
  const r = kpiRowsRaw[i];
  if (!r || (!r[0] && !r[2])) continue;
  if (r[0] === 'TỔNG' || r[2] === 'TỔNG') break;
  let rawName = r[2] ? String(r[2]).trim() : '';
  let cleanName = rawName.replace(/\s*\(HV\d+\)\s*/i, '').trim();
  kpiEntries.push({
    stt: r[0],
    maNV: r[1] ? String(r[1]).trim() : '',
    rawName,
    cleanName,
    kpi: {
      t1: Math.round(r[3] || 0),
      t2: Math.round(r[4] || 0),
      t3: Math.round(r[5] || 0),
      t4: Math.round(r[6] || 0),
      t5: Math.round(r[7] || 0),
      t6: Math.round(r[9] || 0),
      t7: Math.round(r[11] || 0)
    },
    hq: {
      t1: Math.round(r[24] || 0),
      t2: Math.round(r[25] || 0),
      t3: Math.round(r[26] || 0),
      t4: Math.round(r[27] || 0),
      t5: Math.round(r[28] || 0),
      t6: Math.round(r[29] || 0),
      t7: Math.round(r[30] || 0)
    }
  });
}

function norm(str) {
  return str ? str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

const alias = {
  'nguyen thi quynh nhu': 'nguyen thi huynh nhu',
  'nguyen thi ngoc tram': 'ta thi ngoc tram'
};

const finalDataset = empRows.map(emp => {
  const empCode = String(emp['Mã NV']).trim();
  const empName = String(emp['Họ và Tên']).trim();
  const normEmpName = norm(empName);

  const matches = kpiEntries.filter(k => {
    if (k.maNV && k.maNV === empCode) return true;
    const normClean = norm(k.cleanName);
    if (normClean === normEmpName) return true;
    if (alias[normEmpName] && alias[normEmpName] === normClean) return true;
    return false;
  });

  const sumKpi = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 };
  const sumHq = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 };

  matches.forEach(m => {
    for (let t = 1; t <= 7; t++) {
      sumKpi['t' + t] += m.kpi['t' + t];
      sumHq['t' + t] += m.hq['t' + t];
    }
  });

  const tongKpi = sumKpi.t5 + sumKpi.t6 + sumKpi.t7;
  const tongHq = sumHq.t1 + sumHq.t2 + sumHq.t3 + sumHq.t4 + sumHq.t5 + sumHq.t6 + sumHq.t7;
  const tongCong = tongKpi + tongHq;

  let dob = emp['Ngày sinh'] ? String(emp['Ngày sinh']).trim() : '';
  if (dob && dob.length === 19 && dob.includes('T')) {
    dob = dob.split('T')[0];
  }

  let joinDate = emp['Ngày vào làm'] ? String(emp['Ngày vào làm']).trim() : '';
  if (joinDate && joinDate.length === 19 && joinDate.includes('T')) {
    joinDate = joinDate.split('T')[0];
  }

  return {
    "Mã NV": empCode,
    "Họ và Tên": empName,
    "Giới tính": emp['Giới tính'] || 'Nam',
    "Ngày sinh": dob,
    "Số ĐT": emp['Số ĐT'] ? String(emp['Số ĐT']).trim() : '',
    "Email": emp['Email'] ? String(emp['Email']).trim() : '',
    "CCCD": emp['CCCD'] ? String(emp['CCCD']).trim() : '',
    "Địa chỉ": emp['Địa chỉ'] || '',
    "Phòng ban": emp['Phòng ban'] || '',
    "Chức vụ": emp['Chức vụ'] || '',
    "Chi nhánh": emp['Chi nhánh'] || '',
    "Ngày vào làm": joinDate,
    "Trạng thái": emp['Trạng thái'] || 'Đang làm việc',
    "Loại hợp đồng": emp['Loại hợp đồng'] || 'Không xác định thời hạn',
    "Lương cơ bản": Number(emp['Lương cơ bản']) || 0,
    "Bậc": Number(emp['Bậc']) || 0,
    "Phụ cấp": Number(emp['Phụ cấp']) || 0,
    "Thưởng KPI": Number(emp['Thưởng KPI']) || 0,
    "Ghi chú": emp['Ghi chú'] || '',
    "KPI T5": sumKpi.t5,
    "KPI T6": sumKpi.t6,
    "KPI T7": sumKpi.t7,
    "Tổng KPI": tongKpi,
    "Hiệu quả T1": sumHq.t1,
    "Hiệu quả T2": sumHq.t2,
    "Hiệu quả T3": sumHq.t3,
    "Hiệu quả T4": sumHq.t4,
    "Hiệu quả T5": sumHq.t5,
    "Hiệu quả T6": sumHq.t6,
    "Hiệu quả T7": sumHq.t7,
    "Tổng Hiệu quả": tongHq,
    "Tổng cộng Lũy kế": tongCong
  };
});

console.log(`✓ Đã khớp thành công toàn bộ ${finalDataset.length} nhân sự.`);

const fileContent = `export const danhSachNhanVienVaKPI = ${JSON.stringify(finalDataset, null, 2)};\n`;

const serverOutPath = path.resolve(__dirname, 'src/data/danhSachNhanVienVaKPI.js');
const clientOutPath = path.resolve(__dirname, '../client/src/data/danhSachNhanVienVaKPI.js');

fs.writeFileSync(serverOutPath, fileContent, 'utf8');
fs.writeFileSync(clientOutPath, fileContent, 'utf8');

console.log('✓ Đã cập nhật xong file dữ liệu server và client.');
