import { query } from './database.js';
import { danhSachNhanVienVaKPI } from '../data/danhSachNhanVienVaKPI.js';

export const SEED_EMPLOYEES_RAW = danhSachNhanVienVaKPI.map(e => {
  return `${e["Mã NV"]} | ${e["Họ và Tên"]} | ${e["Giới tính"]} | ${e["Ngày sinh"]} | ${e["Số ĐT"]} | ${e["CCCD"]} | ${e["Địa chỉ"]} | ${e["Phòng ban"]} | ${e["Chức vụ"]} | ${e["Chi nhánh"]} | ${e["Ngày vào làm"]} | ${e["Trạng thái"]} | ${e["Loại hợp đồng"]} | ${e["Lương cơ bản"]} | ${e["Phụ cấp"] || 0} | ${e["Thưởng KPI"] || 0}`;
});

async function getOrCreateBranch(branchName) {
  if (!branchName) return 1;
  const name = branchName.trim();
  let row = await query.get('SELECT id FROM branches WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO branches (name, address) VALUES (?, ?)', [name, '']);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreateDepartment(deptName, branchId) {
  if (!deptName) return 1;
  const name = deptName.trim();
  let row = await query.get('SELECT id FROM departments WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO departments (name, branch_id, is_active) VALUES (?, ?, 1)', [name, branchId || 1]);
    return res.lastID;
  }
  return row.id;
}

async function getOrCreatePosition(posName, deptId) {
  if (!posName) return 1;
  const name = posName.trim();
  let row = await query.get('SELECT id FROM positions WHERE name = ?', [name]);
  if (!row) {
    const res = await query.run('INSERT INTO positions (name, department_id, is_active) VALUES (?, ?, 1)', [name, deptId || null]);
    return res.lastID;
  }
  return row.id;
}

export async function runMigration() {
  try {
    console.log('--- KHỞI CHẠY ĐỒNG BỘ 57 NHÂN SỰ CHÍNH THỨC & DỮ LIỆU LƯƠNG/KPI KÈM % TRÁCH NHIỆM ---');

    const now = new Date().toISOString();
    const validCodes = danhSachNhanVienVaKPI.map(e => e["Mã NV"].trim());

    await query.run('BEGIN TRANSACTION');

    // 1. DỌN DẸP SẠCH: Xóa tất cả nhân sự ngoài 57 mã chuẩn
    const allEmps = await query.all('SELECT id, code FROM employees');
    if (allEmps && allEmps.length > 0) {
      const invalidIds = allEmps.filter(e => !validCodes.includes(e.code)).map(e => e.id);
      if (invalidIds.length > 0) {
        for (const invId of invalidIds) {
          await query.run('DELETE FROM employee_monthly_kpis WHERE employee_id = ?', [invId]);
          await query.run('DELETE FROM payrolls WHERE employee_id = ?', [invId]);
          await query.run('DELETE FROM payroll WHERE employee_id = ?', [invId]);
          await query.run('DELETE FROM contracts WHERE employee_id = ?', [invId]);
          await query.run('DELETE FROM attendance WHERE employee_id = ?', [invId]);
          await query.run('DELETE FROM employees WHERE id = ?', [invId]);
        }
        console.log(`✓ Đã xóa ${invalidIds.length} nhân sự tạo thừa ngoài danh sách.`);
      }
    }

    // 2. Nạp/Cập nhật chính xác 57 nhân sự chính thức
    for (const item of danhSachNhanVienVaKPI) {
      const code = item["Mã NV"].trim();
      const fullname = item["Họ và Tên"].trim();
      const gender = item["Giới tính"] || 'Nam';
      const dob = item["Ngày sinh"] || '';
      const phone = item["Số ĐT"] ? String(item["Số ĐT"]).trim() : '';
      const cccd = item["CCCD"] ? String(item["CCCD"]).trim() : '';
      const email = item["Email"] ? item["Email"].trim() : '';
      const address = item["Địa chỉ"] || '';
      const deptName = item["Phòng ban"] || 'Khối văn phòng';
      const posName = item["Chức vụ"] || 'Nhân viên';
      const branchName = item["Chi nhánh"] || 'Văn phòng Trụ sở chính';
      const joinDate = item["Ngày vào làm"] || '2024-01-01';
      const status = item["Trạng thái"] || 'Đang làm việc';
      const contractType = item["Loại hợp đồng"] || 'Không xác định thời hạn';
      const baseSalary = Number(item["Lương cơ bản"]) || 0;
      const bac = Number(item["Bậc"]) || 0;
      const gradeSalary = bac * 400000;
      const tierSalary = baseSalary;
      const totalBaseSalary = tierSalary + gradeSalary;
      const allowance = Number(item["Phụ cấp"]) || 0;
      const kpiBonus = Number(item["Thưởng KPI"]) || 0;

      const branchId = await getOrCreateBranch(branchName);
      const departmentId = await getOrCreateDepartment(deptName, branchId);
      const positionId = await getOrCreatePosition(posName, departmentId);

      const sql = `
        INSERT INTO employees (
          code, fullname, gender, dob, phone, cccd, email, address,
          branch_id, department_id, position_id, join_date,
          status, contract_type, base_salary, allowance, kpi_bonus,
          tier, grade, tier_salary, grade_salary,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET
          fullname = excluded.fullname,
          gender = excluded.gender,
          dob = excluded.dob,
          phone = excluded.phone,
          cccd = excluded.cccd,
          email = excluded.email,
          address = excluded.address,
          branch_id = excluded.branch_id,
          department_id = excluded.department_id,
          position_id = excluded.position_id,
          join_date = excluded.join_date,
          status = excluded.status,
          contract_type = excluded.contract_type,
          base_salary = excluded.base_salary,
          tier = excluded.tier,
          grade = excluded.grade,
          tier_salary = excluded.tier_salary,
          grade_salary = excluded.grade_salary,
          allowance = excluded.allowance,
          kpi_bonus = excluded.kpi_bonus,
          updated_at = excluded.updated_at
      `;

      await query.run(sql, [
        code,
        fullname,
        gender,
        dob,
        phone,
        cccd,
        email,
        address,
        branchId,
        departmentId,
        positionId,
        joinDate,
        status,
        contractType,
        totalBaseSalary,
        allowance,
        kpiBonus,
        'Tầng tiêu chuẩn',
        `Bậc ${bac}`,
        tierSalary,
        gradeSalary,
        now,
        now
      ]);

      const emp = await query.get('SELECT id FROM employees WHERE code = ?', [code]);
      if (!emp) continue;

      // 3. Đồng bộ dữ liệu KPI & Hiệu quả từng tháng (T1 đến T7 và T9) kèm % trách nhiệm
      const rateT5 = item["Tỷ lệ T5"] !== undefined ? item["Tỷ lệ T5"] : 0;
      const rateT6 = item["Tỷ lệ T6"] !== undefined ? item["Tỷ lệ T6"] : 0;
      const rateT7 = item["Tỷ lệ T7"] !== undefined ? item["Tỷ lệ T7"] : 0;

      const monthlyData = [
        { month: '01', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T1"]) || 0 },
        { month: '02', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T2"]) || 0 },
        { month: '03', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T3"]) || 0 },
        { month: '04', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T4"]) || 0 },
        { month: '05', rate: rateT5, amount: Number(item["KPI T5"]) || 0, quota: kpiBonus, hq: Number(item["Hiệu quả T5"]) || 0 },
        { month: '06', rate: rateT6, amount: Number(item["KPI T6"]) || 0, quota: kpiBonus, hq: Number(item["Hiệu quả T6"]) || 0 },
        { month: '07', rate: rateT7, amount: Number(item["KPI T7"]) || 0, quota: kpiBonus, hq: Number(item["Hiệu quả T7"]) || 0 },
        { month: '09', rate: 1.0, amount: kpiBonus, quota: kpiBonus, hq: kpiBonus }
      ];

      for (const m of monthlyData) {
        await query.run(`
          INSERT INTO employee_monthly_kpis (
            employee_id, month, year,
            responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount,
            performance_bonus, discipline_deduction, note, created_at, updated_at
          ) VALUES (?, ?, 2026, ?, 0, ?, ?, ?, 0, ?, ?, ?)
          ON CONFLICT(employee_id, month, year) DO UPDATE SET
            responsibility_bonus = excluded.responsibility_bonus,
            responsibility_rate = excluded.responsibility_rate,
            responsibility_amount = excluded.responsibility_amount,
            performance_bonus = excluded.performance_bonus,
            updated_at = excluded.updated_at
        `, [
          emp.id,
          m.month,
          m.quota,
          m.rate,
          m.amount,
          m.hq,
          `Đồng bộ chuẩn T${m.month}/2026`,
          now,
          now
        ]);

        const responsibilityNet = m.amount;
        const performanceNet = m.hq;
        const netSalary = tierSalary + gradeSalary + responsibilityNet + performanceNet;

        await query.run(`
          INSERT INTO payrolls (
            employee_id, month, year,
            tier_salary, grade_salary,
            responsibility_quota, responsibility_deduction_rate, responsibility_net,
            performance_bonus, discipline_deduction, performance_net,
            other_deductions, net_salary, status, created_at, updated_at
          ) VALUES (?, ?, 2026, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, 'Đã chốt', ?, ?)
          ON CONFLICT(employee_id, month, year) DO UPDATE SET
            tier_salary = excluded.tier_salary,
            grade_salary = excluded.grade_salary,
            responsibility_quota = excluded.responsibility_quota,
            responsibility_deduction_rate = excluded.responsibility_deduction_rate,
            responsibility_net = excluded.responsibility_net,
            performance_bonus = excluded.performance_bonus,
            performance_net = excluded.performance_net,
            net_salary = excluded.net_salary,
            updated_at = excluded.updated_at
        `, [
          emp.id,
          m.month,
          tierSalary,
          gradeSalary,
          m.quota,
          1 - m.rate,
          responsibilityNet,
          m.hq,
          performanceNet,
          netSalary,
          now,
          now
        ]);
      }
    }

    // 4. Cập nhật tài khoản admin mapping
    const adminEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 032'");
    if (adminEmp) {
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'admin']);
      await query.run('UPDATE users SET employee_id = ? WHERE username = ?', [adminEmp.id, 'hr_manager']);
    }

    await query.run('COMMIT');
    console.log('--- HOÀN TẤT ĐỒNG BỘ 57 NHÂN SỰ CHUẨN VÀ DỮ LIỆU KPI/LƯƠNG KÈM % TRÁCH NHIỆM ---');
  } catch (error) {
    await query.run('ROLLBACK').catch(() => {});
    console.error('Lỗi khi chạy migration:', error);
  }
}
