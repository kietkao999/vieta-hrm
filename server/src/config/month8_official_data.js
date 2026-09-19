import * as xlsx from '../../node_modules/xlsx/xlsx.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

export function getMonth8OfficialData() {
  const tcPath = path.join(rootDir, 'TĂNG CA THÁNG 8.2026.xlsx');
  const luongPath = path.join(rootDir, 'BẢNG LƯƠNG CÔNG TY THÁNG 8.2026.xlsx');

  if (!fs.existsSync(tcPath) || !fs.existsSync(luongPath)) {
    return null;
  }

  const bufTc = fs.readFileSync(tcPath);
  const wbTc = xlsx.read(bufTc, { type: 'buffer' });
  const sheetTc = wbTc.Sheets[wbTc.SheetNames[0]];
  const rowsTc = xlsx.utils.sheet_to_json(sheetTc, { header: 1 });
  
  const otMap = new Map();
  rowsTc.slice(3).forEach(row => {
    if (row && row[1]) {
      const code = String(row[1]).trim();
      const hours = parseFloat(row[5]) || 0;
      otMap.set(code, hours);
    }
  });

  const bufLuong = fs.readFileSync(luongPath);
  const wbLuong = xlsx.read(bufLuong, { type: 'buffer' });
  const sheetLuong = wbLuong.Sheets[wbLuong.SheetNames[0]];
  const rowsLuong = xlsx.utils.sheet_to_json(sheetLuong, { header: 1 });

  const result = [];
  for (let i = 5; i < rowsLuong.length; i++) {
    const row = rowsLuong[i];
    if (!row || !row[1]) continue;

    const code = String(row[1]).trim();
    if (code === 'VietA 001' || code === 'VietA 072') continue; // Bỏ Tổng Giám đốc & nhân viên đã nghỉ

    const tierName = row[5] ? String(row[5]).trim() : 'Tầng 1';
    const tierSalary = parseFloat(row[6]) || 0;
    const gradeLevel = row[7] !== undefined && row[7] !== null ? parseInt(row[7], 10) : 0;
    const totalBase = parseFloat(row[8]) || (tierSalary + gradeLevel * 400000);
    const gradeSalary = Math.max(0, totalBase - tierSalary);

    const workDays = row[10] !== undefined && row[10] !== null ? parseFloat(row[10]) : 26;
    const baseWorkSalary = parseFloat(row[11]) || Math.round((totalBase / 26) * workDays);

    const kpiQuota = parseFloat(row[12]) || 0;
    const kpiRate = row[13] !== undefined && row[13] !== null ? parseFloat(row[13]) : 1.0;
    const kpiAmount = parseFloat(row[14]) || Math.round(kpiQuota * kpiRate);

    const perfBonus = parseFloat(row[15]) || 0;
    const otSalary = parseFloat(row[16]) || 0;
    const otHours = otMap.get(code) || 0;

    const otherBonus = parseFloat(row[17]) || 0;
    const driverAllowance = parseFloat(row[18]) || 0;
    const mealPhoneAllowance = parseFloat(row[19]) || 0;
    const otherAllowance = driverAllowance;

    const socialInsurance = parseFloat(row[22]) || 0;
    const unionFee = parseFloat(row[23]) || 0;
    const hourDeduction = parseFloat(row[24]) || 0;
    const advancePayment = parseFloat(row[25]) || 0;
    const otherDeductions = parseFloat(row[26]) || 0;
    const discDeduct = parseFloat(row[27]) || 0;
    const uniformRefund = parseFloat(row[29]) || 0;
    const netSalary = parseFloat(row[30]) || 0;

    result.push({
      code,
      name: row[2],
      dept: row[3],
      pos: row[4],
      tierName,
      tierSalary,
      gradeLevel,
      gradeSalary,
      totalBase,
      workDays,
      baseWorkSalary,
      kpiQuota,
      kpiRate,
      kpiAmount,
      perfBonus,
      otHours,
      otSalary,
      otherBonus,
      mealPhoneAllowance,
      otherAllowance,
      socialInsurance,
      unionFee,
      hourDeduction,
      advancePayment,
      otherDeductions,
      discDeduct,
      uniformRefund,
      netSalary
    });
  }

  return result;
}
