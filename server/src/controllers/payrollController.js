import { query } from '../config/database.js';
import {
  calculateSeniority,
  calculateTierAndResponsibility,
  calculateGradeSalary,
  calculateFullPayroll
} from '../utils/salaryCalculator.js';

export const getPayroll = async (req, res) => {
  try {
    const { month, year, employee_id, department_id } = req.query;
    
    let sql = `
      SELECT p.*, e.fullname, e.code as employee_code, e.grade as employee_grade, e.tier as employee_tier, 
             e.join_date, e.department_id, d.name as department_name, pos.name as position_name,
             k.responsibility_bonus as kpi_responsibility_bonus,
             k.responsibility_rate as kpi_responsibility_rate,
             k.responsibility_amount as kpi_responsibility_amount,
             k.performance_bonus as kpi_performance_bonus,
             k.discipline_deduction as kpi_discipline_deduction,
             k.note as kpi_note
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions pos ON e.position_id = pos.id
      LEFT JOIN employee_monthly_kpis k ON k.employee_id = p.employee_id
        AND (k.month = p.month OR CAST(k.month AS INTEGER) = CAST(p.month AS INTEGER))
        AND k.year = p.year
      WHERE 1=1
    `;
    const params = [];

    if (month && year) {
      const mStr = month.toString();
      const mPad = mStr.padStart(2, '0');
      sql += ` AND (p.month = ? OR p.month = ?) AND p.year = ?`;
      params.push(mStr, mPad, year);
    } else if (year) {
      sql += ` AND p.year = ?`;
      params.push(year);
    }

    // Lọc theo phòng ban (Backend SQL Filter 100% chính xác)
    if (department_id && department_id !== 'all') {
      sql += ` AND e.department_id = ?`;
      params.push(department_id);
    }

    // Phân quyền bảo mật lương 3 cấp độ chặt chẽ:
    if (req.user.roleName === 'ADMIN' || req.user.roleName === 'HR') {
      // CẤP 1 - ADMIN / HR: Xem toàn bộ công ty hoặc lọc theo phòng ban / nhân viên
      if (employee_id) {
        sql += ` AND p.employee_id = ?`;
        params.push(employee_id);
      }
    } else if (req.user.roleName === 'MANAGER') {
      // CẤP 2 - MANAGER: Xem được lương của chính mình VÀ các nhân viên trực thuộc phòng ban mình quản lý
      // Tuyệt đối KHÔNG xem được lương của cấp trên (Admin/Ban Giám Đốc) hoặc phòng ban khác
      const currentManager = await query.get('SELECT department_id FROM employees WHERE id = ?', [req.user.employeeId]);
      const deptId = currentManager?.department_id;
      
      if (deptId) {
        sql += ` AND e.department_id = ? AND (p.employee_id = ? OR e.id NOT IN (SELECT employee_id FROM users WHERE role_id = 1 AND employee_id IS NOT NULL))`;
        params.push(deptId, req.user.employeeId);
        
        if (employee_id) {
          sql += ` AND p.employee_id = ?`;
          params.push(employee_id);
        }
      } else {
        sql += ` AND p.employee_id = ?`;
        params.push(req.user.employeeId);
      }
    } else {
      // CẤP 3 - EMPLOYEE: Chỉ xem duy nhất phiếu lương của chính mình
      sql += ` AND p.employee_id = ?`;
      params.push(req.user.employeeId);
    }

    sql += ` ORDER BY p.year DESC, p.month DESC, e.fullname ASC`;
    const records = await query.all(sql, params);

    // Tính toán bổ sung thông tin thâm niên tự động và đồng bộ KPI cho từng bản ghi
    const enrichedRecords = (records || []).map(r => {
      const seniority = calculateSeniority(r.join_date, r.month || month || 8, r.year || year || 2026);
      
      const hasKpi = r.kpi_responsibility_amount !== null && r.kpi_responsibility_amount !== undefined;
      const respQuota = hasKpi ? parseFloat(r.kpi_responsibility_bonus || 0) : (r.responsibility_quota || 0);
      const respRate = r.kpi_responsibility_rate !== undefined && r.kpi_responsibility_rate !== null 
        ? parseFloat(r.kpi_responsibility_rate) 
        : (r.responsibility_deduction_rate !== undefined && r.responsibility_deduction_rate !== null ? 1 - parseFloat(r.responsibility_deduction_rate) : 1.0);
      const respAmount = hasKpi ? parseFloat(r.kpi_responsibility_amount) : (r.responsibility_kpi || r.responsibility_net || Math.round(respQuota * respRate));
      const perfBonus = r.kpi_performance_bonus !== undefined && r.kpi_performance_bonus !== null ? parseFloat(r.kpi_performance_bonus) : (r.performance_kpi || r.performance_bonus || 0);
      const discDeduct = r.kpi_discipline_deduction !== undefined && r.kpi_discipline_deduction !== null ? parseFloat(r.kpi_discipline_deduction) : (r.discipline_deduction || 0);

      const totalBase = (r.tier_salary || 0) + (r.grade_salary || 0);
      const wDays = r.work_days ?? 26;
      const baseWork = r.base_work_salary !== undefined && r.base_work_salary !== null ? r.base_work_salary : Math.round((totalBase / 26) * wDays);
      const otHrs = r.ot_hours || 0;
      const otSal = r.ot_salary !== undefined && r.ot_salary !== null ? r.ot_salary : Math.round((totalBase / 208) * otHrs * 1.5);
      const otherBonus = r.other_bonus || 0;
      const mealPhone = r.meal_phone_allowance || 0;
      const otherAllowance = r.other_allowance || 0;
      const totalIncome = baseWork + otSal + respAmount + perfBonus + otherBonus + mealPhone + otherAllowance;

      const socialIns = r.social_insurance || 0;
      const uFee = r.union_fee || 0;
      const incTax = r.income_tax || 0;
      const advPay = r.advance_payment || 0;
      const hrDeduct = r.hour_deduction || 0;
      const otherDeduct = r.other_deductions || 0;
      const totalDeductions = socialIns + uFee + incTax + advPay + hrDeduct + otherDeduct + discDeduct;
      const uniformRefund = r.uniform_refund || 0;
      const netSalary = Math.max(0, totalIncome - totalDeductions + uniformRefund);

      return {
        ...r,
        responsibility_quota: respQuota,
        responsibility_deduction_rate: 1 - respRate,
        responsibility_rate: respRate,
        responsibility_net: respAmount,
        responsibility_kpi: respAmount,
        performance_bonus: perfBonus,
        performance_kpi: perfBonus,
        discipline_deduction: discDeduct,
        total_income: totalIncome,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        seniority_text: seniority.seniorityText,
        seniority_years: seniority.years
      };
    });
    
    return res.json(enrichedRecords);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu bảng lương:', error);
    return res.json([]);
  }
};

export const generatePayroll = async (req, res) => {
  const { month, year } = req.body;
  
  if (!month || !year) {
    return res.status(400).json({ message: 'Vui lòng cung cấp tháng và năm.' });
  }

  try {
    // 1. Lấy danh sách nhân viên đang làm việc kèm chức danh và ngày vào làm
    const employees = await query.all(`
      SELECT e.id, e.code, e.fullname, e.join_date as start_date, e.tier, e.tier_salary, e.grade, e.grade_salary,
             pos.name as position_name
      FROM employees e
      LEFT JOIN positions pos ON e.position_id = pos.id
      WHERE e.status = 'Đang làm việc' OR e.status = 'Thử việc'
    `);

    if (!employees || employees.length === 0) {
      return res.status(400).json({ message: 'Không có nhân viên nào đang làm việc.' });
    }

    let successCount = 0;
    const now = new Date().toISOString();
    const padMonth = month.toString().padStart(2, '0');

    // 2. Tính lương theo cơ chế Tầng - Bậc - Thâm niên (Thông báo số 18)
    for (const emp of employees) {
      // 2.1 Tính toán Tầng tự động theo thâm niên / chức vụ
      const autoTier = calculateTierAndResponsibility(emp.position_name, emp.start_date, month, year, emp.tier);
      const autoGrade = calculateGradeSalary(emp.grade || 0);

      const tierSalary = emp.tier_salary ? parseFloat(emp.tier_salary) : autoTier.tierSalary;
      const gradeSalary = emp.grade_salary ? parseFloat(emp.grade_salary) : autoGrade.gradeSalary;
      const defaultRespQuota = autoTier.respQuota;

      // 2.2 Lấy KPI tháng của nhân viên
      const kpi = await query.get(`
        SELECT responsibility_bonus, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction
        FROM employee_monthly_kpis
        WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?
      `, [emp.id, padMonth, month.toString(), year]);

      const respQuota = kpi && kpi.responsibility_bonus ? parseFloat(kpi.responsibility_bonus) : defaultRespQuota;
      const respRate = kpi ? parseFloat(kpi.responsibility_rate ?? 1.0) : 1.0;
      const respAmount = kpi?.responsibility_amount !== undefined && kpi.responsibility_amount !== null
        ? parseFloat(kpi.responsibility_amount)
        : Math.round(respQuota * respRate);
      const deductRate = 1.0 - respRate;

      const perfBonus = kpi ? parseFloat(kpi.performance_bonus || 0) : 0;
      const discDeduct = kpi ? parseFloat(kpi.discipline_deduction || 0) : 0;

      // 2.3 Kiểm tra xem đã có phiếu lương chưa để giữ lại các khoản điều chỉnh nếu có
      const exist = await query.get(`
        SELECT * FROM payrolls WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?
      `, [emp.id, padMonth, month.toString(), year]);

      const workDays = exist ? parseFloat(exist.work_days ?? 26) : 26;
      const otHours = exist ? parseFloat(exist.ot_hours ?? 0) : 0;
      const otherBonus = exist ? parseFloat(exist.other_bonus ?? 0) : 0;
      const mealPhoneAllowance = exist ? parseFloat(exist.meal_phone_allowance ?? 0) : 0;
      const otherAllowance = exist ? parseFloat(exist.other_allowance ?? 0) : 0;
      const socialInsurance = exist ? parseFloat(exist.social_insurance ?? 0) : 0;
      const unionFee = exist ? parseFloat(exist.union_fee ?? 0) : 0;
      const incomeTax = exist ? parseFloat(exist.income_tax ?? 0) : 0;
      const advancePayment = exist ? parseFloat(exist.advance_payment ?? 0) : 0;
      const hourDeduction = exist ? parseFloat(exist.hour_deduction ?? 0) : 0;
      const otherDeductions = exist ? parseFloat(exist.other_deductions ?? 0) : discDeduct;
      const uniformRefund = exist ? parseFloat(exist.uniform_refund ?? 0) : 0;

      const fullPayroll = calculateFullPayroll({
        tierSalary,
        gradeSalary,
        workDays,
        standardDays: 26,
        otHours,
        respQuota,
        respRate,
        respPenalty: 0,
        perfBonus,
        perfDeduct: discDeduct,
        otherBonus,
        mealPhoneAllowance,
        otherAllowance,
        socialInsurance,
        unionFee,
        incomeTax,
        advancePayment,
        hourDeduction,
        otherDeduction: otherDeductions,
        uniformRefund
      });

      if (exist) {
        await query.run(`
          UPDATE payrolls 
          SET tier_salary = ?, grade_salary = ?, 
              work_days = ?, base_work_salary = ?,
              ot_hours = ?, ot_salary = ?,
              responsibility_quota = ?, responsibility_deduction_rate = ?, responsibility_net = ?, responsibility_kpi = ?,
              performance_bonus = ?, discipline_deduction = ?, performance_net = ?, performance_kpi = ?,
              other_bonus = ?, meal_phone_allowance = ?, other_allowance = ?,
              social_insurance = ?, union_fee = ?, income_tax = ?, advance_payment = ?, hour_deduction = ?,
              other_deductions = ?, uniform_refund = ?, net_salary = ?, updated_at = ?
          WHERE id = ?
        `, [
          tierSalary, gradeSalary,
          workDays, fullPayroll.baseWorkSalary,
          otHours, fullPayroll.otSalary,
          respQuota, deductRate, fullPayroll.respNet, fullPayroll.respNet,
          perfBonus, discDeduct, fullPayroll.perfNet, perfBonus,
          otherBonus, mealPhoneAllowance, otherAllowance,
          socialInsurance, unionFee, incomeTax, advancePayment, hourDeduction,
          otherDeductions, uniformRefund, fullPayroll.netSalary, now,
          exist.id
        ]);
      } else {
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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dự thảo', ?, ?)
        `, [
          emp.id, padMonth, year,
          tierSalary, gradeSalary,
          workDays, fullPayroll.baseWorkSalary,
          otHours, fullPayroll.otSalary,
          respQuota, deductRate, fullPayroll.respNet, fullPayroll.respNet,
          perfBonus, discDeduct, fullPayroll.perfNet, perfBonus,
          otherBonus, mealPhoneAllowance, otherAllowance,
          socialInsurance, unionFee, incomeTax, advancePayment, hourDeduction,
          otherDeductions, uniformRefund, fullPayroll.netSalary, now, now
        ]);
      }
      successCount++;
    }

    res.json({
      message: `Đã khởi tạo và tính lương thành công cho ${successCount} nhân sự theo Quy chế số 18/2026/TB-VA.`,
      count: successCount
    });
  } catch (err) {
    console.error('Lỗi tính bảng lương tự động:', err);
    res.status(500).json({ message: 'Lỗi tính toán bảng lương tự động.', error: err.message });
  }
};

export const createPayroll = async (req, res) => {
  return res.status(400).json({ message: 'Vui lòng sử dụng chức năng Tính Lương Tự Động.' });
};

// Cập nhật chi tiết bảng lương từng nhân viên
export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tier_salary,
      grade_salary,
      grade_level,
      sync_to_employee,
      work_days,
      ot_hours,
      responsibility_quota,
      responsibility_deduction_rate,
      responsibility_kpi,
      performance_bonus,
      discipline_deduction,
      performance_kpi,
      other_bonus,
      meal_phone_allowance,
      other_allowance,
      social_insurance,
      union_fee,
      income_tax,
      advance_payment,
      hour_deduction,
      other_deductions,
      uniform_refund,
      status
    } = req.body;

    const payroll = await query.get('SELECT p.*, e.tier as employee_tier FROM payrolls p JOIN employees e ON p.employee_id = e.id WHERE p.id = ?', [id]);
    if (!payroll) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }

    const now = new Date().toISOString();

    // Nếu chỉ cập nhật trạng thái
    if (status && Object.keys(req.body).length === 1) {
      await query.run('UPDATE payrolls SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);
      return res.json({ message: 'Cập nhật trạng thái thành công.' });
    }

    // Xử lý Lương Tầng & Lương Bậc
    let gSalary = payroll.grade_salary || 0;
    if (grade_level !== undefined) {
      const gInfo = calculateGradeSalary(grade_level);
      gSalary = gInfo.gradeSalary;
    } else if (grade_salary !== undefined) {
      gSalary = parseFloat(grade_salary || 0);
    }

    const tSalary = parseFloat(tier_salary !== undefined ? tier_salary : payroll.tier_salary || 4500000);
    const totalBase = tSalary + gSalary;

    const wDays = parseFloat(String(work_days !== undefined ? work_days : payroll.work_days ?? 26).replace(',', '.')) || 0;
    const otHrs = parseFloat(String(ot_hours !== undefined ? ot_hours : payroll.ot_hours ?? 0).replace(',', '.')) || 0;

    const baseWorkSalary = Math.round((totalBase / 26) * wDays);
    const otSalary = Math.round((totalBase / 208) * otHrs * 1.5);

    const respQuota = parseFloat(responsibility_quota !== undefined ? responsibility_quota : payroll.responsibility_quota || 1000000);
    const respDeductRate = parseFloat(responsibility_deduction_rate !== undefined ? responsibility_deduction_rate : payroll.responsibility_deduction_rate || 0);
    
    let respKpiVal = responsibility_kpi !== undefined ? parseFloat(responsibility_kpi || 0) : Math.round(respQuota * (1 - respDeductRate));

    const perfKpiVal = parseFloat(performance_kpi !== undefined ? performance_kpi : (performance_bonus !== undefined ? performance_bonus : payroll.performance_kpi || payroll.performance_bonus || 0));
    const discDeduct = parseFloat(discipline_deduction !== undefined ? discipline_deduction : payroll.discipline_deduction || 0);
    const perfNet = Math.max(0, perfKpiVal - discDeduct);

    const oBonus = parseFloat(other_bonus !== undefined ? other_bonus : payroll.other_bonus || 0);
    const mealPhone = parseFloat(meal_phone_allowance !== undefined ? meal_phone_allowance : payroll.meal_phone_allowance || 0);
    const oAllowance = parseFloat(other_allowance !== undefined ? other_allowance : payroll.other_allowance || 0);

    const socialIns = parseFloat(social_insurance !== undefined ? social_insurance : payroll.social_insurance || 0);
    const uFee = parseFloat(union_fee !== undefined ? union_fee : payroll.union_fee || 0);
    const incTax = parseFloat(income_tax !== undefined ? income_tax : payroll.income_tax || 0);
    const advPay = parseFloat(advance_payment !== undefined ? advance_payment : payroll.advance_payment || 0);
    const hrDeduct = parseFloat(hour_deduction !== undefined ? hour_deduction : payroll.hour_deduction || 0);
    const oDeduct = parseFloat(other_deductions !== undefined ? other_deductions : payroll.other_deductions || 0);
    const uniformRefund = parseFloat(String(uniform_refund !== undefined ? uniform_refund : payroll.uniform_refund || 0).replace(',', '.')) || 0;

    const netSalary = Math.round(
      baseWorkSalary +
      otSalary +
      respKpiVal +
      perfKpiVal +
      oBonus +
      mealPhone +
      oAllowance -
      socialIns -
      uFee -
      incTax -
      advPay -
      hrDeduct -
      oDeduct +
      uniformRefund
    );

    await query.run(`
      UPDATE payrolls 
      SET tier_salary = ?, grade_salary = ?, 
          work_days = ?, base_work_salary = ?,
          ot_hours = ?, ot_salary = ?,
          responsibility_quota = ?, responsibility_deduction_rate = ?, responsibility_net = ?, responsibility_kpi = ?,
          performance_bonus = ?, discipline_deduction = ?, performance_net = ?, performance_kpi = ?,
          other_bonus = ?, meal_phone_allowance = ?, other_allowance = ?,
          social_insurance = ?, union_fee = ?, income_tax = ?, advance_payment = ?, hour_deduction = ?,
          other_deductions = ?, uniform_refund = ?, net_salary = ?, updated_at = ?
      WHERE id = ?
    `, [
      tSalary, gSalary,
      wDays, baseWorkSalary,
      otHrs, otSalary,
      respQuota, respDeductRate, respKpiVal, respKpiVal,
      perfKpiVal, discDeduct, perfNet, perfKpiVal,
      oBonus, mealPhone, oAllowance,
      socialIns, uFee, incTax, advPay, hrDeduct,
      oDeduct, uniformRefund, netSalary, now, id
    ]);

    // Nếu có tùy chọn đồng bộ sang hồ sơ nhân viên để lưu vĩnh viễn
    if (sync_to_employee) {
      let tierName = payroll.employee_tier || 'Tầng 1';
      if (tSalary === 4500000) tierName = 'Tầng 1';
      else if (tSalary === 5000000) tierName = 'Tầng 2';
      else if (tSalary === 5500000) tierName = 'Tầng 3';
      else if (tSalary === 6000000) tierName = 'Tầng 4';
      else if (tSalary === 6500000) tierName = 'Tầng 5';
      else if (tSalary === 8000000) tierName = 'Tầng 6';
      else if (tSalary === 9500000) tierName = 'Tầng 7';

      const gradeNum = Math.round(gSalary / 400000);
      const gradeName = gradeNum > 0 ? `Bậc ${gradeNum}` : 'Bậc 0';

      await query.run(`
        UPDATE employees 
        SET tier_salary = ?, grade_salary = ?, base_salary = ?, tier = ?, grade = ?
        WHERE id = ?
      `, [tSalary, gSalary, totalBase, tierName, gradeName, payroll.employee_id]);
    }

    return res.json({
      message: 'Cập nhật và tính lại phiếu lương thành công.',
      data: {
        netSalary,
        baseWorkSalary,
        tierSalary: tSalary,
        gradeSalary: gSalary
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật phiếu lương:', error);
    return res.status(500).json({ message: 'Lỗi cập nhật phiếu lương.' });
  }
};

export const deletePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    const payroll = await query.get('SELECT * FROM payrolls WHERE id = ?', [id]);
    if (!payroll) return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });

    await query.run('DELETE FROM payrolls WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa phiếu lương.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa phiếu lương.' });
  }
};
