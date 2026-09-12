import { query } from '../config/database.js';

// Tự động khởi tạo dữ liệu bảng lương và KPI chuẩn nếu tháng được chọn chưa có dữ liệu
export const ensurePayrollData = async (month, year) => {
  if (!month || !year) return;
  const mStr = month.toString();
  const mPad = mStr.padStart(2, '0');
  
  try {
    const existingCount = await query.get(
      `SELECT COUNT(*) as count FROM payrolls WHERE (month = ? OR month = ?) AND year = ?`,
      [mStr, mPad, year]
    );
    
    if (existingCount && existingCount.count > 0) return;
    
    // Lấy danh sách toàn bộ nhân viên đang làm việc
    const employees = await query.all(`
      SELECT id, tier_salary, grade_salary, base_salary, kpi_bonus, allowance 
      FROM employees 
      WHERE status = 'Đang làm việc' OR status = 'Thử việc'
    `);
    
    if (!employees || employees.length === 0) return;
    
    const now = new Date().toISOString();
    for (const emp of employees) {
      // 1. Kiểm tra / khởi tạo KPI tháng nếu chưa có
      let kpi = await query.get(`
        SELECT responsibility_bonus, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction
        FROM employee_monthly_kpis
        WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?
      `, [emp.id, mPad, mStr, year]);
      
      if (!kpi) {
        const respBonus = emp.kpi_bonus || 0;
        await query.run(`
          INSERT INTO employee_monthly_kpis (
            employee_id, month, year,
            responsibility_bonus, responsibility_rate, responsibility_amount,
            performance_bonus, discipline_deduction, note, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 1.0, ?, 0, 0, ?, ?, ?)
        `, [emp.id, mPad, year, respBonus, respBonus, `Tự động khởi tạo T${mPad}/${year}`, now, now]);
        kpi = { responsibility_bonus: respBonus, responsibility_rate: 1.0, responsibility_amount: respBonus, performance_bonus: 0, discipline_deduction: 0 };
      }
      
      const respQuota = parseFloat(kpi.responsibility_bonus || 0);
      const respRate = parseFloat(kpi.responsibility_rate ?? 1.0);
      const respKpi = kpi.responsibility_amount !== undefined && kpi.responsibility_amount !== null
        ? parseFloat(kpi.responsibility_amount)
        : Math.round(respQuota * respRate);
      const deductRate = 1.0 - respRate;
      const perfKpi = parseFloat(kpi.performance_bonus || 0);
      const discDeduct = parseFloat(kpi.discipline_deduction || 0);
      
      const tierSalary = parseFloat(emp.tier_salary || 0);
      const gradeSalary = parseFloat(emp.grade_salary || 0);
      const totalBase = tierSalary + gradeSalary || parseFloat(emp.base_salary || 0);
      const workDays = 26;
      const baseWorkSalary = Math.round((totalBase / 26) * workDays);
      const otSalary = 0;
      const otherBonus = 0;
      const mealPhone = 0;
      const otherAllow = parseFloat(emp.allowance || 0);
      const performanceNet = Math.max(0, perfKpi - discDeduct);
      const netSalary = Math.round(baseWorkSalary + otSalary + respKpi + perfKpi + otherBonus + mealPhone + otherAllow - discDeduct);
      
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0, 0, 0, 0, 0, ?, ?, 'Dự thảo', ?, ?)
      `, [
        emp.id, mPad, year,
        tierSalary, gradeSalary,
        workDays, baseWorkSalary,
        respQuota, deductRate, respKpi, respKpi,
        perfKpi, discDeduct, performanceNet, perfKpi,
        mealPhone, otherAllow,
        discDeduct, netSalary,
        now, now
      ]);
    }
  } catch (err) {
    console.error(`Lỗi tự động khởi tạo dữ liệu tháng ${month}/${year}:`, err);
  }
};

export const getPayroll = async (req, res) => {
  try {
    const { month, year, employee_id, department_id } = req.query;
    
    // Tự động kiểm tra và khởi tạo dữ liệu bảng lương nếu tháng mới được gọi
    if (month && year) {
      await ensurePayrollData(month, year);
    }
    
    let sql = `
      SELECT p.*, e.fullname, e.code as employee_code, e.grade as employee_grade, e.tier as employee_tier, e.department_id, d.name as department_name
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
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

    // Phân quyền bảo mật lương tuyệt đối: Chỉ ADMIN mới được xem toàn bộ bảng lương
    if (req.user.roleName !== 'ADMIN') {
      sql += ` AND p.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (employee_id) {
      sql += ` AND p.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY p.year DESC, p.month DESC, e.fullname ASC`;
    const records = await query.all(sql, params);
    
    return res.json(records || []);
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
    // 1. Lấy danh sách nhân viên đang làm việc
    const employees = await query.all(`
      SELECT id, tier_salary, grade_salary
      FROM employees 
      WHERE status = 'Đang làm việc' OR status = 'Thử việc'
    `);

    if (!employees || employees.length === 0) {
      return res.status(400).json({ message: 'Không có nhân viên nào đang làm việc.' });
    }

    let successCount = 0;
    const now = new Date().toISOString();
    const padMonth = month.toString().padStart(2, '0');

    // 2. Với mỗi nhân viên, tính lương theo công thức chuẩn:
    // Tổng thực lĩnh = [((Lương tầng + Lương bậc) / 26) * Ngày công] 
    //                + [((Lương tầng + Lương bậc) / 208) * Giờ tăng ca * 1.5] 
    //                + Thưởng KPI trách nhiệm + Thưởng KPI hiệu quả + Thưởng khác 
    //                + Phụ cấp cơm & điện thoại + Phụ cấp khác 
    //                - Bảo hiểm xã hội - Đoàn phí - Thuế TNCN - Tạm ứng - Trừ cắt giờ - Trừ khác
    for (const emp of employees) {
      // 2.1 Lấy KPI tháng của nhân viên
      const kpi = await query.get(`
        SELECT responsibility_bonus, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction
        FROM employee_monthly_kpis
        WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?
      `, [emp.id, padMonth, month.toString(), year]);

      // Các giá trị mặc định KPI
      const respQuota = kpi ? parseFloat(kpi.responsibility_bonus || 0) : 0;
      const respRate = kpi ? parseFloat(kpi.responsibility_rate ?? 1.0) : 1.0;
      const respKpi = kpi?.responsibility_amount !== undefined && kpi.responsibility_amount !== null
        ? parseFloat(kpi.responsibility_amount)
        : Math.round(respQuota * respRate);
      const deductRate = 1.0 - respRate;

      const perfKpi = kpi ? parseFloat(kpi.performance_bonus || 0) : 0;
      const discDeduct = kpi ? parseFloat(kpi.discipline_deduction || 0) : 0;

      // 2.2 Thành phần lương cơ sở
      const tierSalary = parseFloat(emp.tier_salary || 0);
      const gradeSalary = parseFloat(emp.grade_salary || 0);
      const totalBase = tierSalary + gradeSalary;

      // Kiểm tra xem đã có phiếu lương chưa để giữ lại các khoản điều chỉnh nếu có
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

      // Tính toán công thức
      const baseWorkSalary = Math.round((totalBase / 26) * workDays);
      const otSalary = Math.round((totalBase / 208) * otHours * 1.5);
      const performanceNet = Math.max(0, perfKpi - discDeduct);

      const netSalary = Math.round(
        baseWorkSalary +
        otSalary +
        respKpi +
        perfKpi +
        otherBonus +
        mealPhoneAllowance +
        otherAllowance -
        socialInsurance -
        unionFee -
        incomeTax -
        advancePayment -
        hourDeduction -
        otherDeductions
      );

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
              other_deductions = ?, net_salary = ?, updated_at = ?
          WHERE id = ?
        `, [
          tierSalary, gradeSalary,
          workDays, baseWorkSalary,
          otHours, otSalary,
          respQuota, deductRate, respKpi, respKpi,
          perfKpi, discDeduct, performanceNet, perfKpi,
          otherBonus, mealPhoneAllowance, otherAllowance,
          socialInsurance, unionFee, incomeTax, advancePayment, hourDeduction,
          otherDeductions, netSalary, now,
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
            other_deductions, net_salary, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dự thảo', ?, ?)
        `, [
          emp.id, padMonth, year,
          tierSalary, gradeSalary,
          workDays, baseWorkSalary,
          otHours, otSalary,
          respQuota, deductRate, respKpi, respKpi,
          perfKpi, discDeduct, performanceNet, perfKpi,
          otherBonus, mealPhoneAllowance, otherAllowance,
          socialInsurance, unionFee, incomeTax, advancePayment, hourDeduction,
          otherDeductions, netSalary, now, now
        ]);
      }
      successCount++;
    }

    return res.json({ message: `Đã tính lương thành công cho ${successCount} nhân sự theo công thức mới.` });
  } catch (error) {
    console.error('Lỗi tính lương:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tính lương.' });
  }
};

export const createPayroll = async (req, res) => {
  return res.status(400).json({ message: 'API cũ không còn sử dụng. Vui lòng dùng Tính Lương Tự Động.' });
};

export const updatePayroll = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    tier_salary,
    grade_salary,
    work_days,
    ot_hours,
    responsibility_quota,
    responsibility_deduction_rate,
    responsibility_kpi,
    performance_bonus,
    performance_kpi,
    discipline_deduction,
    other_bonus,
    meal_phone_allowance,
    other_allowance,
    social_insurance,
    union_fee,
    income_tax,
    advance_payment,
    hour_deduction,
    other_deductions
  } = req.body;
  
  try {
    const payroll = await query.get('SELECT * FROM payrolls WHERE id = ?', [id]);
    if (!payroll) return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });

    const now = new Date().toISOString();

    // If only status is provided (for approve/pay actions)
    if (status && tier_salary === undefined) {
      await query.run(`
        UPDATE payrolls SET status = ?, updated_at = ? WHERE id = ?
      `, [status, now, id]);
      return res.json({ message: 'Cập nhật trạng thái thành công.' });
    }

    // Parsing components
    const tSalary = parseFloat(tier_salary !== undefined ? tier_salary : payroll.tier_salary || 0);
    const gSalary = parseFloat(grade_salary !== undefined ? grade_salary : payroll.grade_salary || 0);
    const totalBase = tSalary + gSalary;

    const wDays = parseFloat(work_days !== undefined ? work_days : payroll.work_days ?? 26);
    const otHrs = parseFloat(ot_hours !== undefined ? ot_hours : payroll.ot_hours ?? 0);

    const baseWorkSalary = Math.round((totalBase / 26) * wDays);
    const otSalary = Math.round((totalBase / 208) * otHrs * 1.5);

    const respQuota = parseFloat(responsibility_quota !== undefined ? responsibility_quota : payroll.responsibility_quota || 0);
    const respDeductRate = parseFloat(responsibility_deduction_rate !== undefined ? responsibility_deduction_rate : payroll.responsibility_deduction_rate || 0);
    
    // Responsibility KPI
    let respKpiVal;
    if (responsibility_kpi !== undefined) {
      respKpiVal = parseFloat(responsibility_kpi || 0);
    } else {
      respKpiVal = Math.round(respQuota * (1 - respDeductRate));
    }

    // Performance KPI
    const perfKpiVal = parseFloat(performance_kpi !== undefined ? performance_kpi : (performance_bonus !== undefined ? performance_bonus : payroll.performance_kpi || payroll.performance_bonus || 0));
    const discDeduct = parseFloat(discipline_deduction !== undefined ? discipline_deduction : payroll.discipline_deduction || 0);
    const perfNet = Math.max(0, perfKpiVal - discDeduct);

    // Other additions
    const oBonus = parseFloat(other_bonus !== undefined ? other_bonus : payroll.other_bonus || 0);
    const mealPhone = parseFloat(meal_phone_allowance !== undefined ? meal_phone_allowance : payroll.meal_phone_allowance || 0);
    const oAllowance = parseFloat(other_allowance !== undefined ? other_allowance : payroll.other_allowance || 0);

    // Deductions
    const socialIns = parseFloat(social_insurance !== undefined ? social_insurance : payroll.social_insurance || 0);
    const uFee = parseFloat(union_fee !== undefined ? union_fee : payroll.union_fee || 0);
    const incTax = parseFloat(income_tax !== undefined ? income_tax : payroll.income_tax || 0);
    const advPay = parseFloat(advance_payment !== undefined ? advance_payment : payroll.advance_payment || 0);
    const hrDeduct = parseFloat(hour_deduction !== undefined ? hour_deduction : payroll.hour_deduction || 0);
    const oDeduct = parseFloat(other_deductions !== undefined ? other_deductions : payroll.other_deductions || 0);

    // Total Net Salary calculation:
    // [((Lương tầng + Lương bậc) / 26) * Ngày công thực tế] 
    // + [((Lương tầng + Lương bậc) / 208) * Giờ tăng ca * 1.5] 
    // + Thưởng KPI trách nhiệm + Thưởng KPI hiệu quả + Thưởng khác 
    // + Phụ cấp cơm & điện thoại + Phụ cấp khác 
    // - Bảo hiểm xã hội - Đoàn phí - Thuế TNCN - Tạm ứng - Trừ cắt giờ - Trừ khác
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
      oDeduct
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
          other_deductions = ?, net_salary = ?, updated_at = ?
      WHERE id = ?
    `, [
      tSalary, gSalary,
      wDays, baseWorkSalary,
      otHrs, otSalary,
      respQuota, respDeductRate, respKpiVal, respKpiVal,
      perfKpiVal, discDeduct, perfNet, perfKpiVal,
      oBonus, mealPhone, oAllowance,
      socialIns, uFee, incTax, advPay, hrDeduct,
      oDeduct, netSalary, now, id
    ]);

    return res.json({ message: 'Cập nhật phiếu lương thành công.' });
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
