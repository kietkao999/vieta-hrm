import { query } from '../config/database.js';

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
      const respAmount = Math.round(respBonus * respRate);
      
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

    if (existing) {
      await query.run(
        `UPDATE employee_monthly_kpis
         SET responsibility_bonus = ?, responsibility_rate = ?, responsibility_amount = ?, performance_bonus = ?, discipline_deduction = ?, note = ?, updated_at = ?
         WHERE id = ?`,
        [respBonus, respRate, respAmount, perfBonus, discDeduction, note || '', now, existing.id]
      );
      return res.json({ message: 'Cập nhật KPI thành công.' });
    } else {
      const result = await query.run(
        `INSERT INTO employee_monthly_kpis (
          employee_id, month, year, responsibility_bonus, responsibility_penalty, responsibility_rate, responsibility_amount, performance_bonus, discipline_deduction, note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, targetMonth, targetYear, respBonus, respRate, respAmount, perfBonus, discDeduction, note || '', now, now]
      );
      return res.status(201).json({ message: 'Thêm KPI thành công.', id: result.lastID });
    }
  } catch (error) {
    console.error('Lỗi lưu KPI:', error);
    return res.status(500).json({ message: 'Lỗi lưu dữ liệu KPI.' });
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
    return res.json({ message: 'Đã xóa bản ghi KPI.' });
  } catch (error) {
    console.error('Lỗi xóa KPI:', error);
    return res.status(500).json({ message: 'Lỗi xóa KPI.' });
  }
};
