import { query } from '../config/database.js';

export const getAvailableKpiMonths = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const rows = await query.all(
      `SELECT DISTINCT month FROM employee_monthly_kpis WHERE year = ?`,
      [year]
    );
    const months = rows.map(r => parseInt(r.month, 10));
    return res.json(months);
  } catch (error) {
    return res.json([]);
  }
};

/**
 * Lấy danh sách KPI tháng
 * Query: month, year, department_id, search, employee_id
 */
export const getKpis = async (req, res) => {
  try {
    const { month, year, department_id, search, employee_id } = req.query;
    
    const now = new Date();
    const targetMonth = month ? month.toString() : (now.getMonth() + 1).toString();
    const targetMonthPadded = targetMonth.padStart(2, '0');
    const targetYear = parseInt(year || now.getFullYear().toString(), 10);

    let sql = `
      SELECT 
        k.id as kpi_id,
        e.id as employee_id,
        e.code as employee_code,
        e.fullname,
        e.avatar,
        e.status as employee_status,
        e.kpi_bonus as default_responsibility_bonus,
        COALESCE(p.name, 'Nhân viên') as position_name,
        COALESCE(d.name, 'Chưa phân bổ') as department_name,
        d.id as department_id,
        ? as month,
        ? as year,
        COALESCE(k.responsibility_bonus, e.kpi_bonus, 0) as responsibility_bonus,
        COALESCE(k.responsibility_penalty, 0) as responsibility_penalty,
        COALESCE(k.responsibility_rate, 1.0) as responsibility_rate,
        COALESCE(k.responsibility_amount, 0) as responsibility_amount,
        COALESCE(k.performance_bonus, 0) as performance_bonus,
        COALESCE(k.discipline_deduction, 0) as discipline_deduction,
        COALESCE(k.note, '') as note,
        k.created_at,
        k.updated_at
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_monthly_kpis k ON k.employee_id = e.id 
        AND (k.month = ? OR k.month = ?) 
        AND k.year = ?
      WHERE e.status != 'Đã nghỉ việc'
    `;

    const params = [
      targetMonthPadded,
      targetYear,
      targetMonth,
      targetMonthPadded,
      targetYear
    ];

    // Phân quyền vai trò
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND e.id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND e.id = ?`;
      params.push(employee_id);
    }

    if (department_id) {
      sql += ` AND e.department_id = ?`;
      params.push(department_id);
    }

    if (search && search.trim()) {
      sql += ` AND (e.fullname LIKE ? OR e.code LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY d.name ASC, e.fullname ASC`;
    const rawRecords = await query.all(sql, params);

    // Tính toán công thức thực nhận cho từng bản ghi
    const records = rawRecords.map(item => {
      const respBonus = parseFloat(item.responsibility_bonus) || 0;
      const respRate = item.responsibility_rate !== undefined && item.responsibility_rate !== null 
        ? parseFloat(item.responsibility_rate) 
        : 1.0;
      const respAmount = item.kpi_id && item.responsibility_amount !== null && item.responsibility_amount !== undefined
        ? parseFloat(item.responsibility_amount)
        : Math.round(respBonus * respRate);
      
      const perfBonus = parseFloat(item.performance_bonus) || 0;
      const discDeduction = parseFloat(item.discipline_deduction) || 0;

      const netPerformance = Math.max(0, perfBonus - discDeduction);
      const totalKpi = respAmount + netPerformance;

      return {
        ...item,
        id: item.kpi_id,
        responsibility_bonus: respBonus,
        responsibility_rate: respRate,
        responsibility_amount: respAmount,
        net_responsibility: respAmount,
        performance_bonus: perfBonus,
        discipline_deduction: discDeduction,
        net_performance: netPerformance,
        total_kpi: totalKpi,
        has_saved_record: !!item.kpi_id
      };
    });

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu KPI tháng:', error);
    return res.status(500).json({ message: 'Lỗi tải dữ liệu KPI.' });
  }
};

/**
 * Helper đồng bộ dữ liệu KPI sang bảng Bảng Lương (Payrolls)
 */
export const syncKpiToPayroll = async (employeeId, month, year, kpiData) => {
  try {
    if (!employeeId || !month || !year) return;
    const padMonth = month.toString().padStart(2, '0');
    const rawMonth = parseInt(month, 10).toString();
    const targetYear = parseInt(year, 10);

    const payroll = await query.get(
      `SELECT * FROM payrolls WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?`,
      [employeeId, padMonth, rawMonth, targetYear]
    );

    const respBonus = parseFloat(kpiData.responsibility_bonus || 0);
    const respRate = kpiData.responsibility_rate !== undefined && kpiData.responsibility_rate !== null 
      ? parseFloat(kpiData.responsibility_rate) 
      : 1.0;
    const respAmount = kpiData.responsibility_amount !== undefined && kpiData.responsibility_amount !== null
      ? parseFloat(kpiData.responsibility_amount)
      : Math.round(respBonus * respRate);
    const perfBonus = parseFloat(kpiData.performance_bonus || 0);
    const discDeduct = parseFloat(kpiData.discipline_deduction || 0);
    const perfNet = Math.max(0, perfBonus - discDeduct);
    const deductRate = Math.max(0, 1.0 - respRate);
    const now = new Date().toISOString();

    if (payroll) {
      const totalBase = (payroll.tier_salary || 0) + (payroll.grade_salary || 0);
      const wDays = payroll.work_days ?? 26;
      const baseWork = payroll.base_work_salary !== undefined && payroll.base_work_salary !== null
        ? payroll.base_work_salary
        : Math.round((totalBase / 26) * wDays);
      const otHrs = payroll.ot_hours || 0;
      const otSal = payroll.ot_salary !== undefined && payroll.ot_salary !== null
        ? payroll.ot_salary
        : Math.round((totalBase / 208) * otHrs * 1.5);

      const oBonus = payroll.other_bonus || 0;
      const mealPhone = payroll.meal_phone_allowance || 0;
      const oAllowance = payroll.other_allowance || 0;

      const totalIncome = baseWork + otSal + respAmount + perfBonus + oBonus + mealPhone + oAllowance;

      const socialIns = payroll.social_insurance || 0;
      const uFee = payroll.union_fee || 0;
      const incTax = payroll.income_tax || 0;
      const advPay = payroll.advance_payment || 0;
      const hrDeduct = payroll.hour_deduction || 0;
      const oDeduct = payroll.other_deductions || 0;
      const totalDeductions = socialIns + uFee + incTax + advPay + hrDeduct + oDeduct + discDeduct;
      const uniRefund = payroll.uniform_refund || 0;
      const netSalary = Math.max(0, totalIncome - totalDeductions + uniRefund);

      await query.run(
        `UPDATE payrolls
         SET responsibility_quota = ?, responsibility_deduction_rate = ?, responsibility_net = ?, responsibility_kpi = ?,
             performance_bonus = ?, discipline_deduction = ?, performance_net = ?, performance_kpi = ?,
             net_salary = ?, updated_at = ?
         WHERE id = ?`,
        [respBonus, deductRate, respAmount, respAmount, perfBonus, discDeduct, perfNet, perfBonus, netSalary, now, payroll.id]
      );
    }
  } catch (error) {
    console.error('Lỗi đồng bộ KPI sang Payroll:', error);
  }
};

/**
 * Khởi tạo dữ liệu KPI tháng cho toàn bộ nhân sự đang làm việc
 * Body: { month, year }
 */
export const initMonthlyKpis = async (req, res) => {
  const { month, year } = req.body;
  if (!month || !year) {
    return res.status(400).json({ message: 'Vui lòng cung cấp Tháng và Năm.' });
  }

  const targetMonth = month.toString().padStart(2, '0');
  const targetYear = parseInt(year, 10);
  const now = new Date().toISOString();

  try {
    // Lấy tất cả nhân viên đang hoạt động
    const activeEmployees = await query.all(
      `SELECT id, kpi_bonus FROM employees WHERE status != 'Đã nghỉ việc'`
    );

    let createdCount = 0;
    for (const emp of activeEmployees) {
      const existing = await query.get(
        `SELECT id FROM employee_monthly_kpis WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?`,
        [emp.id, month.toString(), targetMonth, targetYear]
      );

      const defaultBonus = emp.kpi_bonus || 0;

      if (!existing) {
        await query.run(
          `INSERT INTO employee_monthly_kpis (
            employee_id, month, year, responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction, note, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 0, 1.0, ?, 0, 0, '', ?, ?)`,
          [emp.id, targetMonth, targetYear, defaultBonus, defaultBonus, now, now]
        );
        createdCount++;
        
        await syncKpiToPayroll(emp.id, targetMonth, targetYear, {
          responsibility_bonus: defaultBonus,
          responsibility_rate: 1.0,
          responsibility_amount: defaultBonus,
          performance_bonus: 0,
          discipline_deduction: 0
        });
      }
    }

    return res.json({
      message: `Khởi tạo dữ liệu tháng ${targetMonth}/${targetYear} thành công (${createdCount} bản ghi mới).`,
      count: createdCount
    });
  } catch (error) {
    console.error('Lỗi khởi tạo KPI tháng:', error);
    return res.status(500).json({ message: 'Lỗi khởi tạo KPI tháng.' });
  }
};

/**
 * Lưu / Cập nhật hàng loạt KPI tháng
 * Body: { month, year, items: [ { employee_id, responsibility_bonus, responsibility_rate, performance_bonus, discipline_deduction, note } ] }
 */
export const saveBulkKpis = async (req, res) => {
  const { month, year, items } = req.body;
  if (!month || !year || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
  }

  const targetMonth = month.toString().padStart(2, '0');
  const targetYear = parseInt(year, 10);
  const now = new Date().toISOString();

  try {
    for (const item of items) {
      const empId = item.employee_id;
      if (!empId) continue;

      const respBonus = parseFloat(item.responsibility_bonus) || 0;
      const respRate = item.responsibility_rate !== undefined && item.responsibility_rate !== null 
        ? parseFloat(item.responsibility_rate) 
        : 1.0;
      const respAmount = Math.round(respBonus * respRate);

      const perfBonus = parseFloat(item.performance_bonus) || 0;
      const discDeduction = parseFloat(item.discipline_deduction) || 0;
      const note = item.note || '';

      const existing = await query.get(
        `SELECT id FROM employee_monthly_kpis WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?`,
        [empId, month.toString(), targetMonth, targetYear]
      );

      if (existing) {
        await query.run(
          `UPDATE employee_monthly_kpis
           SET responsibility_bonus = ?, responsibility_rate = ?, responsibility_amount = ?, performance_bonus = ?, discipline_deduction = ?, note = ?, updated_at = ?
           WHERE id = ?`,
          [respBonus, respRate, respAmount, perfBonus, discDeduction, note, now, existing.id]
        );
      } else {
        await query.run(
          `INSERT INTO employee_monthly_kpis (
            employee_id, month, year, responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction, note, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
          [empId, targetMonth, targetYear, respBonus, respRate, respAmount, perfBonus, discDeduction, note, now, now]
        );
      }

      await syncKpiToPayroll(empId, targetMonth, targetYear, {
        responsibility_bonus: respBonus,
        responsibility_rate: respRate,
        responsibility_amount: respAmount,
        performance_bonus: perfBonus,
        discipline_deduction: discDeduction
      });
    }

    return res.json({ message: 'Lưu dữ liệu KPI tháng thành công.' });
  } catch (error) {
    console.error('Lỗi lưu hàng loạt KPI:', error);
    return res.status(500).json({ message: 'Lỗi lưu dữ liệu KPI.' });
  }
};

/**
 * Thêm hoặc Cập nhật KPI đơn lẻ
 */
export const createOrUpdateKpi = async (req, res) => {
  const { id } = req.params;
  const { employee_id, month, year, responsibility_bonus, responsibility_rate, performance_bonus, discipline_deduction, note } = req.body;

  const now = new Date().toISOString();
  const respBonus = parseFloat(responsibility_bonus) || 0;
  const respRate = responsibility_rate !== undefined && responsibility_rate !== null 
    ? parseFloat(responsibility_rate) 
    : 1.0;
  const respAmount = Math.round(respBonus * respRate);

  const perfBonus = parseFloat(performance_bonus) || 0;
  const discDeduction = parseFloat(discipline_deduction) || 0;

  try {
    if (id) {
      const existing = await query.get('SELECT * FROM employee_monthly_kpis WHERE id = ?', [id]);
      if (!existing) return res.status(404).json({ message: 'Không tìm thấy bản ghi KPI.' });

      await query.run(
        `UPDATE employee_monthly_kpis
         SET responsibility_bonus = ?, responsibility_rate = ?, responsibility_amount = ?, performance_bonus = ?, discipline_deduction = ?, note = ?, updated_at = ?
         WHERE id = ?`,
        [respBonus, respRate, respAmount, perfBonus, discDeduction, note || '', now, id]
      );

      const targetEmpId = employee_id || existing.employee_id;
      const targetM = month || existing.month;
      const targetY = year || existing.year;

      await syncKpiToPayroll(targetEmpId, targetM, targetY, {
        responsibility_bonus: respBonus,
        responsibility_rate: respRate,
        responsibility_amount: respAmount,
        performance_bonus: perfBonus,
        discipline_deduction: discDeduction
      });

      return res.json({ message: 'Cập nhật KPI thành công.' });
    }

    if (!employee_id || !month || !year) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Tháng, Năm).' });
    }

    const targetMonth = month.toString().padStart(2, '0');
    const targetYear = parseInt(year, 10);

    const existing = await query.get(
      `SELECT id FROM employee_monthly_kpis WHERE employee_id = ? AND (month = ? OR month = ?) AND year = ?`,
      [employee_id, month.toString(), targetMonth, targetYear]
    );

    let savedId = existing?.id;
    if (existing) {
      await query.run(
        `UPDATE employee_monthly_kpis
         SET responsibility_bonus = ?, responsibility_rate = ?, responsibility_amount = ?, performance_bonus = ?, discipline_deduction = ?, note = ?, updated_at = ?
         WHERE id = ?`,
        [respBonus, respRate, respAmount, perfBonus, discDeduction, note || '', now, existing.id]
      );
    } else {
      const result = await query.run(
        `INSERT INTO employee_monthly_kpis (
          employee_id, month, year, responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction, note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, targetMonth, targetYear, respBonus, respRate, respAmount, perfBonus, discDeduction, note || '', now, now]
      );
      savedId = result.lastID;
    }

    await syncKpiToPayroll(employee_id, targetMonth, targetYear, {
      responsibility_bonus: respBonus,
      responsibility_rate: respRate,
      responsibility_amount: respAmount,
      performance_bonus: perfBonus,
      discipline_deduction: discDeduction
    });

    return res.status(existing ? 200 : 201).json({ message: 'Lưu KPI thành công.', id: savedId });
  } catch (error) {
    console.error('Lỗi lưu KPI:', error);
    return res.status(500).json({ message: 'Lỗi lưu dữ liệu KPI.' });
  }
};

/**
 * Lấy lịch sử KPI các tháng của 1 nhân viên
 */
export const getEmployeeKpiHistory = async (req, res) => {
  try {
    const { employee_id } = req.params;
    if (!employee_id) return res.status(400).json({ message: 'Thiếu mã nhân viên.' });

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE' && req.user.employeeId !== parseInt(employee_id, 10)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem lịch sử KPI này.' });
    }

    const sql = `
      SELECT 
        k.*,
        e.code as employee_code,
        e.fullname,
        COALESCE(k.responsibility_bonus, e.kpi_bonus, 0) as responsibility_bonus,
        COALESCE(k.responsibility_rate, 1.0) as responsibility_rate,
        COALESCE(k.responsibility_amount, 0) as responsibility_amount,
        COALESCE(k.performance_bonus, 0) as performance_bonus,
        COALESCE(k.discipline_deduction, 0) as discipline_deduction,
        COALESCE(k.note, '') as note
      FROM employee_monthly_kpis k
      JOIN employees e ON k.employee_id = e.id
      WHERE k.employee_id = ?
      ORDER BY k.year DESC, CAST(k.month AS INTEGER) DESC
    `;

    const raw = await query.all(sql, [employee_id]);
    const records = raw.map(item => {
      const respBonus = parseFloat(item.responsibility_bonus) || 0;
      const respRate = item.responsibility_rate !== undefined && item.responsibility_rate !== null ? parseFloat(item.responsibility_rate) : 1.0;
      const respAmount = Math.round(respBonus * respRate);
      const perfBonus = parseFloat(item.performance_bonus) || 0;
      const discDeduction = parseFloat(item.discipline_deduction) || 0;
      const netPerf = Math.max(0, perfBonus - discDeduction);
      const totalKpi = respAmount + netPerf;

      return {
        ...item,
        responsibility_bonus: respBonus,
        responsibility_rate: respRate,
        responsibility_amount: respAmount,
        net_responsibility: respAmount,
        net_performance: netPerf,
        total_kpi: totalKpi
      };
    });

    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy lịch sử KPI nhân viên:', error);
    return res.status(500).json({ message: 'Lỗi tải lịch sử KPI.' });
  }
};

/**
 * Xóa bản ghi KPI
 */
export const deleteKpi = async (req, res) => {
  const { id } = req.params;
  try {
    const kpi = await query.get('SELECT * FROM employee_monthly_kpis WHERE id = ?', [id]);
    if (!kpi) return res.status(404).json({ message: 'Không tìm thấy bản ghi KPI.' });

    await query.run('DELETE FROM employee_monthly_kpis WHERE id = ?', [id]);

    if (kpi.employee_id && kpi.month && kpi.year) {
      await syncKpiToPayroll(kpi.employee_id, kpi.month, kpi.year, {
        responsibility_bonus: kpi.responsibility_bonus || 0,
        responsibility_rate: 1.0,
        responsibility_amount: kpi.responsibility_bonus || 0,
        performance_bonus: 0,
        discipline_deduction: 0
      });
    }

    return res.json({ message: 'Đã xóa bản ghi KPI.' });
  } catch (error) {
    console.error('Lỗi xóa KPI:', error);
    return res.status(500).json({ message: 'Lỗi xóa KPI.' });
  }
};
