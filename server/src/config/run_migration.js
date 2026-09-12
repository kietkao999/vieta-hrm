import { query } from './database.js';
import { danhSachNhanVienVaKPI } from '../data/danhSachNhanVienVaKPI.js';
import { danhSachThang8 } from '../data/danhSachThang8.js';
import bcrypt from 'bcryptjs';

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

      const quotaT6 = (code === 'VietA 032') ? 1000000 : kpiBonus;
      const quotaT7 = (code === 'VietA 032') ? 1000000 : kpiBonus;

      const monthlyData = [
        { month: '01', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T1"]) || 0 },
        { month: '02', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T2"]) || 0 },
        { month: '03', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T3"]) || 0 },
        { month: '04', rate: 0, amount: 0, quota: kpiBonus, hq: Number(item["Hiệu quả T4"]) || 0 },
        { month: '05', rate: rateT5, amount: Number(item["KPI T5"]) || 0, quota: kpiBonus, hq: Number(item["Hiệu quả T5"]) || 0 },
        { month: '06', rate: rateT6, amount: Number(item["KPI T6"]) || 0, quota: quotaT6, hq: Number(item["Hiệu quả T6"]) || 0 },
        { month: '07', rate: rateT7, amount: Number(item["KPI T7"]) || 0, quota: quotaT7, hq: Number(item["Hiệu quả T7"]) || 0 }
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

    // 4. Đồng bộ toàn bộ tài khoản đăng nhập theo Mã Nhân viên và phân quyền 3 cấp độ
    const salt = bcrypt.genSaltSync(10);
    const hashAdmin = bcrypt.hashSync('Admin@123', salt);
    const hashManager = bcrypt.hashSync('Manager@123', salt);
    const hashEmployee = bcrypt.hashSync('VietA@2026', salt);

    const adminCodes = ['VietA 002', 'VietA 032', 'VietA 043'];
    const managerCodes = [
      'VietA 003', 'VietA 015', 'VietA 031', 'VietA 035',
      'VietA 036', 'VietA 046', 'VietA 050', 'VietA 056'
    ];

    const currentEmps = await query.all('SELECT id, code, fullname FROM employees');
    for (const emp of currentEmps) {
      const cleanCode = emp.code.trim();
      const username = cleanCode.toLowerCase().replace(/\s+/g, '');

      let roleId = 4; // EMPLOYEE
      let passwordHash = hashEmployee;

      if (adminCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
        roleId = 1; // ADMIN
        passwordHash = hashAdmin;
      } else if (managerCodes.some(c => c.toLowerCase().replace(/\s+/g, '') === username)) {
        roleId = 3; // MANAGER
        passwordHash = hashManager;
      }

      const existingUser = await query.get('SELECT id FROM users WHERE employee_id = ? OR username = ?', [emp.id, username]);
      if (existingUser) {
        await query.run(
          'UPDATE users SET username = ?, password = ?, role_id = ?, employee_id = ?, is_active = 1, updated_at = ? WHERE id = ?',
          [username, passwordHash, roleId, emp.id, now, existingUser.id]
        );
      } else {
        await query.run(
          'INSERT INTO users (username, password, role_id, employee_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
          [username, passwordHash, roleId, emp.id, now, now]
        );
      }
    }

    // Cập nhật các alias admin tiện lợi nếu có
    const adminEmp = await query.get("SELECT id FROM employees WHERE code = 'VietA 032'");
    if (adminEmp) {
      await query.run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'admin'", [hashAdmin, adminEmp.id]);
      await query.run("UPDATE users SET password = ?, role_id = 1, employee_id = ? WHERE username = 'hr_manager'", [hashAdmin, adminEmp.id]);
    }

    await query.run('COMMIT');
    console.log('--- HOÀN TẤT ĐỒNG BỘ 57 NHÂN SỰ VÀ TÀI KHOẢN PHÂN QUYỀN 3 CẤP ĐỘ ---');

    // 5. Đồng bộ dữ liệu KPI & Bảng Lương Tháng 08/2026 chính xác 100% từ danhSachThang8
    if (Array.isArray(danhSachThang8) && danhSachThang8.length > 0) {
      for (const m8 of danhSachThang8) {
        const cleanCode = m8.code.trim();
        const emp = await query.get('SELECT id, base_salary, tier_salary, grade_salary FROM employees WHERE code = ?', [cleanCode]);
        if (!emp) continue;

        const tierSalary = m8.tierSalary || emp.tier_salary || 0;
        const gradeSalary = m8.gradeSalary || emp.grade_salary || 0;
        const totalBase = (tierSalary + gradeSalary) || emp.base_salary || 0;
        const workDays = m8.workDays !== null && m8.workDays !== undefined ? m8.workDays : 26;
        const baseWorkSalary = m8.baseWorkSalary || Math.round((totalBase / 26) * workDays);
        const respBonus = m8.respBonus || 0;
        const respRate = m8.respRate !== undefined && m8.respRate !== null ? m8.respRate : 1.0;
        const respAmount = m8.respAmount || Math.round(respBonus * respRate);
        const perfBonus = m8.perfBonus || 0;
        const otSalary = m8.otSalary || 0;
        const otherBonus = m8.otherBonus || 0;
        const otherAllow = m8.driverAllowance || 0;
        const mealPhone = m8.mealPhoneAllowance || 0;
        const socialIns = m8.socialInsurance || 0;
        const unionFee = m8.unionFee || 0;
        const hrDeduct = m8.hourDeduction || 0;
        const advance = m8.advancePayment || 0;
        const otherDeduct = m8.otherDeductions || 0;
        const discDeduct = m8.disciplineDeduction || 0;
        const uniformRefund = m8.uniformRefund || 0;

        const totalDeductions = socialIns + unionFee + hrDeduct + advance + otherDeduct + discDeduct;
        const netSalary = m8.netSalary || Math.round(baseWorkSalary + respAmount + perfBonus + otSalary + (otherBonus + uniformRefund) + mealPhone + otherAllow - totalDeductions);

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
          'Dữ liệu Tháng 08/2026 chính thức',
          now,
          now
        ]);

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
            other_deductions, net_salary, status, created_at, updated_at
          ) VALUES (?, '08', 2026, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'Đã chốt', ?, ?)
          ON CONFLICT(employee_id, month, year) DO UPDATE SET
            tier_salary = excluded.tier_salary,
            grade_salary = excluded.grade_salary,
            work_days = excluded.work_days,
            base_work_salary = excluded.base_work_salary,
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
            net_salary = excluded.net_salary,
            status = 'Đã chốt',
            updated_at = excluded.updated_at
        `, [
          emp.id,
          tierSalary,
          gradeSalary,
          workDays,
          baseWorkSalary,
          otSalary,
          respBonus,
          1 - respRate,
          respAmount,
          respAmount,
          perfBonus,
          discDeduct,
          Math.max(0, perfBonus - discDeduct),
          perfBonus,
          otherBonus + uniformRefund,
          mealPhone,
          otherAllow,
          socialIns,
          unionFee,
          advance,
          hrDeduct,
          otherDeduct,
          netSalary,
          now,
          now
        ]);
      }
      console.log('✓ Đã đồng bộ thành công dữ liệu Tháng 08/2026 từ danhSachThang8!');
    }

    // 4. KHỞI TẠO VÀ ĐỒNG BỘ BẢNG VĂN BẢN, QUY ĐỊNH & PHÚC LỢI 2026
    await query.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        file_name TEXT,
        file_url TEXT,
        file_size TEXT,
        file_type TEXT,
        effective_date TEXT,
        applicable_to TEXT DEFAULT 'Toàn thể CBNV',
        description TEXT,
        status TEXT DEFAULT 'Đang hiệu lực',
        created_by TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    const docCount = await query.get('SELECT COUNT(*) as total FROM documents');
    if (!docCount || docCount.total === 0) {
      const { DEFAULT_DOCUMENTS } = await import('../controllers/documentController.js');
      for (const d of DEFAULT_DOCUMENTS) {
        await query.run(`
          INSERT INTO documents (
            title, category, file_name, file_url, file_size, file_type,
            effective_date, applicable_to, description, status, created_by,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          d.title, d.category, d.file_name, d.file_url, d.file_size, d.file_type,
          d.effective_date, d.applicable_to, d.description, d.status, d.created_by,
          now, now
        ]);
      }
      console.log('✓ Đã nạp thành công 8 tài liệu Phúc lợi - Quy định & Biểu mẫu 2026.');
    }

  } catch (error) {
    await query.run('ROLLBACK').catch(() => {});
    console.error('Lỗi khi chạy migration:', error);
  }
}
