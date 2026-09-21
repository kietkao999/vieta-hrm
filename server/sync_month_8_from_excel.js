import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function syncMonth8Data() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ BẢNG LƯƠNG THÁNG 8/2026 TỪ FILE EXCEL GỐC ===');

  const excelPath = path.resolve(__dirname, '../BẢNG LƯƠNG CÔNG TY THÁNG 8.2026.xlsx');
  const wb = XLSX.readFile(excelPath);
  const sheet = wb.Sheets['Sheet1'] || wb.Sheets[wb.SheetNames[0]];
  if (!sheet) {
    console.error('Không tìm thấy sheet dữ liệu trong file BẢNG LƯƠNG CÔNG TY THÁNG 8.2026.xlsx');
    return;
  }

  // Đọc file tăng ca tháng 8
  const otMap = new Map();
  try {
    const otPath = path.resolve(__dirname, '../TĂNG CA THÁNG 8.2026.xlsx');
    const otWb = XLSX.readFile(otPath);
    const otSheet = otWb.Sheets[otWb.SheetNames[0]];
    const otData = XLSX.utils.sheet_to_json(otSheet, { header: 1 });
    for (let r = 2; r < otData.length; r++) {
      const row = otData[r];
      if (row && row[1] && typeof row[1] === 'string') {
        const c = row[1].trim();
        const otHours = parseFloat(row[5]) || 0;
        otMap.set(c, otHours);
      }
    }
    console.log(`✓ Đã nạp dữ liệu tăng ca cho ${otMap.size} nhân sự.`);
  } catch (err) {
    console.warn('Không thể đọc file TĂNG CA THÁNG 8.2026.xlsx:', err.message);
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (let r = 5; r < data.length; r++) {
    const row = data[r];
    if (!row) continue;
    const code = row[1];
    const name = row[2];
    if (!code || typeof code !== 'string' || !code.includes('VietA')) continue;

    const cleanCode = code.trim();
    if (cleanCode === 'VietA 001' || cleanCode === 'VietA 072') {
      continue; // Bỏ qua 2 nhân sự đã nghỉ việc
    }

    const emp = await query.get('SELECT id, base_salary, tier_salary, grade_salary, department_id, position_id FROM employees WHERE code = ?', [cleanCode]);
    if (!emp) {
      console.log(`[Bỏ qua - Không có trong danh sách nhân viên] ${cleanCode} - ${name}`);
      continue;
    }

    const tierSalary = row[6] !== undefined && row[6] !== null ? (parseFloat(row[6]) || 0) : (cleanCode === 'VietA 001' ? 0 : (emp.tier_salary || 0));
    const gradeLevel = parseFloat(row[7]) || 0;
    const gradeSalary = gradeLevel * 400000;
    const totalBase = (tierSalary + gradeSalary) || (row[8] !== undefined && row[8] !== null ? (parseFloat(row[8]) || 0) : (emp.base_salary || 0));
    const workDays = row[10] !== undefined && row[10] !== null ? (parseFloat(row[10]) || 0) : (cleanCode === 'VietA 001' ? 0 : 26);
    const baseWorkSalary = row[11] !== undefined && row[11] !== null ? (parseFloat(row[11]) || 0) : Math.round((totalBase / 26) * workDays);
    const respBonus = parseFloat(row[12]) || 0;
    const respRate = row[13] !== undefined && row[13] !== null ? parseFloat(row[13]) : 1.0;
    const respAmount = parseFloat(row[14]) !== undefined && row[14] !== null ? parseFloat(row[14]) : Math.round(respBonus * respRate);
    const perfBonus = parseFloat(row[15]) || 0;
    const otSalary = parseFloat(row[16]) || 0;
    const otHours = otMap.get(cleanCode) || 0;
    const otherBonus = parseFloat(row[17]) || 0;
    const otherAllow = parseFloat(row[18]) || 0; // Phụ cấp tài xế
    const mealPhone = parseFloat(row[19]) || 0; // Phụ cấp cơm / ĐT
    const socialIns = parseFloat(row[22]) || 0;
    const unionFee = parseFloat(row[23]) || 0;
    const hrDeduct = parseFloat(row[24]) || 0;
    const advance = parseFloat(row[25]) || 0;
    const otherDeduct = parseFloat(row[26]) || 0;
    const discDeduct = parseFloat(row[27]) || 0;
    const uniformRefund = parseFloat(row[29]) || 0;

    const totalIncome = baseWorkSalary + respAmount + perfBonus + otSalary + otherBonus + mealPhone + otherAllow;
    const totalDeductions = socialIns + unionFee + hrDeduct + advance + otherDeduct + discDeduct;
    const netSalary = parseFloat(row[30]) !== undefined && row[30] !== null 
      ? Math.round(parseFloat(row[30])) 
      : Math.round(totalIncome - totalDeductions + uniformRefund);

    // 1. Lưu chính xác vào employee_monthly_kpis cho Tháng 08/2026
    await query.run(`
      INSERT INTO employee_monthly_kpis (
        employee_id, month, year,
        responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount,
        performance_bonus, discipline_deduction, note, created_at, updated_at
      ) VALUES (?, '08', 2026, ?, 0, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, month, year) DO UPDATE SET
        responsibility_bonus = excluded.responsibility_bonus,
        responsibility_rate = excluded.responsibility_rate,
        responsibility_amount = excluded.responsibility_amount,
        performance_bonus = excluded.performance_bonus,
        discipline_deduction = excluded.discipline_deduction,
        note = excluded.note,
        updated_at = excluded.updated_at
    `, [
      emp.id,
      respBonus,
      respRate,
      respAmount,
      perfBonus,
      discDeduct,
      'Cập nhật từ Bảng lương Tháng 8.2026 chính thức',
      now,
      now
    ]);

    // 2. Lưu chính xác vào payrolls cho Tháng 08/2026
    await query.run(`
      INSERT INTO payrolls (
        employee_id, month, year,
        tier_salary, grade_salary,
        work_days, base_work_salary,
        ot_hours, ot_salary,
        responsibility_quota, responsibility_deduction_rate, responsibility_net, responsibility_kpi,
        performance_bonus, discipline_deduction, performance_net, performance_kpi,
        other_bonus, meal_phone_allowance, other_allowance,
        social_insurance, union_fee, income_tax, advance_payment, hour_deduction,
        other_deductions, uniform_refund, net_salary, status, created_at, updated_at
      ) VALUES (?, '08', 2026, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'Đã chốt', ?, ?)
      ON CONFLICT(employee_id, month, year) DO UPDATE SET
        tier_salary = excluded.tier_salary,
        grade_salary = excluded.grade_salary,
        work_days = excluded.work_days,
        base_work_salary = excluded.base_work_salary,
        ot_hours = excluded.ot_hours,
        ot_salary = excluded.ot_salary,
        responsibility_quota = excluded.responsibility_quota,
        responsibility_deduction_rate = excluded.responsibility_deduction_rate,
        responsibility_net = excluded.responsibility_net,
        responsibility_kpi = excluded.responsibility_kpi,
        performance_bonus = excluded.performance_bonus,
        discipline_deduction = excluded.discipline_deduction,
        performance_net = excluded.performance_net,
        performance_kpi = excluded.performance_kpi,
        other_bonus = excluded.other_bonus,
        meal_phone_allowance = excluded.meal_phone_allowance,
        other_allowance = excluded.other_allowance,
        social_insurance = excluded.social_insurance,
        union_fee = excluded.union_fee,
        advance_payment = excluded.advance_payment,
        hour_deduction = excluded.hour_deduction,
        other_deductions = excluded.other_deductions,
        uniform_refund = excluded.uniform_refund,
        net_salary = excluded.net_salary,
        status = 'Đã chốt',
        updated_at = excluded.updated_at
    `, [
      emp.id,
      tierSalary,
      gradeSalary,
      workDays,
      baseWorkSalary,
      otHours,
      otSalary,
      respBonus,
      1 - respRate,
      respAmount,
      respAmount,
      perfBonus,
      discDeduct,
      Math.max(0, perfBonus - discDeduct),
      perfBonus,
      otherBonus,
      mealPhone,
      otherAllow,
      socialIns,
      unionFee,
      advance,
      hrDeduct,
      otherDeduct,
      uniformRefund,
      netSalary,
      now,
      now
    ]);

    updatedCount++;
  }

  console.log(`✓ Đã đồng bộ thành công dữ liệu Tháng 08/2026 từ file Excel chính thức cho toàn bộ ${updatedCount} nhân sự!`);
}

// Chạy trực tiếp nếu gọi từ command line
if (process.argv[1] && process.argv[1].endsWith('sync_month_8_from_excel.js')) {
  syncMonth8Data().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
