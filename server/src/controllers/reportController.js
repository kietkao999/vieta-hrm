import { query } from '../config/database.js';

// Báo cáo tổng quan nhân sự
export const getSummaryReport = async (req, res) => {
  try {
    // Tổng nhân sự theo trạng thái
    const statusStats = await query.all(`
      SELECT status, COUNT(*) as count FROM employees GROUP BY status
    `);

    // Phân bổ theo phòng ban
    const deptStats = await query.all(`
      SELECT d.name as department_name, COUNT(e.id) as count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id AND e.status = 'Đang làm việc'
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `);

    // Phân bổ theo chi nhánh
    const branchStats = await query.all(`
      SELECT b.name as branch_name, COUNT(e.id) as count
      FROM branches b
      LEFT JOIN employees e ON e.branch_id = b.id AND e.status = 'Đang làm việc'
      GROUP BY b.id, b.name
      ORDER BY count DESC
    `);

    // Phân bổ theo giới tính
    const genderStats = await query.all(`
      SELECT gender, COUNT(*) as count 
      FROM employees WHERE status = 'Đang làm việc' 
      GROUP BY gender
    `);

    // Thâm niên trung bình
    const seniorityAvg = await query.get(`
      SELECT AVG(CAST((julianday('now') - julianday(join_date)) / 365.25 AS REAL)) as avg_years
      FROM employees WHERE status = 'Đang làm việc' AND join_date IS NOT NULL
    `);

    // Tổng nhân sự đang làm việc
    const totalActive = await query.get(`
      SELECT COUNT(*) as count FROM employees WHERE status = 'Đang làm việc'
    `);

    // Hợp đồng sắp hết hạn (30 ngày tới)
    const expiringContracts = await query.all(`
      SELECT c.*, e.fullname, e.code as employee_code
      FROM contracts c
      JOIN employees e ON c.employee_id = e.id
      WHERE c.status = 'Hiệu lực' 
        AND c.end_date IS NOT NULL
        AND julianday(c.end_date) - julianday('now') BETWEEN 0 AND 30
      ORDER BY c.end_date ASC
    `);

    return res.json({
      totalActive: totalActive?.count || 0,
      statusStats,
      deptStats,
      branchStats,
      genderStats,
      avgSeniority: Math.round((seniorityAvg?.avg_years || 0) * 10) / 10,
      expiringContracts
    });
  } catch (error) {
    console.error('Lỗi báo cáo tổng quan:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Báo cáo quỹ lương
export const getPayrollReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear().toString();

    // Tổng quỹ lương theo tháng
    const monthlyPayroll = await query.all(`
      SELECT month, 
             SUM(net_salary) as total_net_salary,
             SUM(base_salary) as total_base_salary,
             SUM(allowances) as total_allowances,
             SUM(bonus) as total_bonus,
             SUM(deductions) as total_deductions,
             COUNT(*) as employee_count
      FROM payroll
      WHERE month LIKE ?
      GROUP BY month
      ORDER BY month ASC
    `, [`${targetYear}-%`]);

    // Tổng quỹ lương cả năm
    const yearTotal = await query.get(`
      SELECT SUM(net_salary) as total_net, 
             SUM(base_salary) as total_base,
             SUM(allowances) as total_allowances,
             SUM(bonus) as total_bonus,
             SUM(deductions) as total_deductions,
             COUNT(*) as total_records
      FROM payroll WHERE month LIKE ?
    `, [`${targetYear}-%`]);

    // Top 5 lương cao nhất
    const topSalaries = await query.all(`
      SELECT e.fullname, e.code, p.net_salary, p.month, d.name as department_name
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.month LIKE ?
      ORDER BY p.net_salary DESC
      LIMIT 5
    `, [`${targetYear}-%`]);

    return res.json({
      year: targetYear,
      monthlyPayroll,
      yearTotal: yearTotal || {},
      topSalaries
    });
  } catch (error) {
    console.error('Lỗi báo cáo quỹ lương:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Báo cáo chấm công
export const getAttendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year || now.getFullYear().toString();
    const datePrefix = `${targetYear}-${targetMonth.padStart(2, '0')}`;

    // Tổng quan chấm công theo trạng thái
    const statusSummary = await query.all(`
      SELECT status, COUNT(*) as count
      FROM attendance
      WHERE date LIKE ?
      GROUP BY status
    `, [`${datePrefix}%`]);

    // Thống kê đi trễ
    const lateStats = await query.all(`
      SELECT e.fullname, e.code, COUNT(*) as late_count, SUM(a.late_minutes) as total_late_minutes
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date LIKE ? AND a.late_minutes > 0
      GROUP BY a.employee_id
      ORDER BY late_count DESC
    `, [`${datePrefix}%`]);

    // Tổng giờ OT
    const otSummary = await query.get(`
      SELECT SUM(ot_hours) as total_ot, COUNT(DISTINCT employee_id) as ot_employees
      FROM attendance WHERE date LIKE ? AND ot_hours > 0
    `, [`${datePrefix}%`]);

    // Tổng ngày công
    const totalWorkDays = await query.get(`
      SELECT COUNT(*) as total_days, COUNT(DISTINCT employee_id) as total_employees
      FROM attendance WHERE date LIKE ? AND (status = 'Đúng giờ' OR status = 'Đi trễ')
    `, [`${datePrefix}%`]);

    return res.json({
      month: targetMonth,
      year: targetYear,
      statusSummary,
      lateStats,
      otSummary: otSummary || {},
      totalWorkDays: totalWorkDays || {}
    });
  } catch (error) {
    console.error('Lỗi báo cáo chấm công:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

// Báo cáo KPI
export const getKpiReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? month.toString() : (now.getMonth() + 1).toString();
    const targetMonthPadded = targetMonth.padStart(2, '0');
    const targetYear = parseInt(year || now.getFullYear().toString(), 10);

    // Thống kê tổng hợp KPI
    const totalActive = await query.get(
      `SELECT COUNT(*) as count FROM employees WHERE status != 'Đã nghỉ việc'`
    );

    const savedKpis = await query.all(
      `SELECT k.*, e.fullname, e.code, d.name as department_name,
              (MAX(0, k.responsibility_bonus - k.responsibility_penalty) + MAX(0, k.performance_bonus - k.discipline_deduction)) as total_payout
       FROM employee_monthly_kpis k
       JOIN employees e ON k.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE (k.month = ? OR k.month = ?) AND k.year = ?
       ORDER BY total_payout DESC`,
      [targetMonth, targetMonthPadded, targetYear]
    );

    const recordedCount = savedKpis.length;
    const totalPayout = savedKpis.reduce((acc, k) => acc + (k.total_payout || 0), 0);
    const avgPayout = recordedCount > 0 ? Math.round(totalPayout / recordedCount) : 0;

    const kpiSummary = [
      { status: 'Đã thiết lập', count: recordedCount, avg_score: avgPayout, avg_percent: recordedCount > 0 ? 100 : 0 },
      { status: 'Chưa có dữ liệu', count: Math.max(0, (totalActive?.count || 0) - recordedCount), avg_score: 0, avg_percent: 0 }
    ];

    // KPI theo phòng ban
    const deptKpi = await query.all(`
      SELECT COALESCE(d.name, 'Chưa phân bổ') as department_name,
             COUNT(k.id) as kpi_count,
             AVG(MAX(0, k.responsibility_bonus - k.responsibility_penalty) + MAX(0, k.performance_bonus - k.discipline_deduction)) as avg_score,
             100 as avg_percent
      FROM employee_monthly_kpis k
      JOIN employees e ON k.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE (k.month = ? OR k.month = ?) AND k.year = ?
      GROUP BY d.id, d.name
      ORDER BY kpi_count DESC
    `, [targetMonth, targetMonthPadded, targetYear]);

    // Top performers (nhân viên có tổng KPI thực nhận cao nhất)
    const topPerformers = savedKpis.slice(0, 5).map(k => ({
      fullname: k.fullname,
      code: k.code,
      achieved_score: k.total_payout,
      target_score: k.responsibility_bonus + k.performance_bonus,
      criteria: 'Tổng KPI thực nhận',
      department_name: k.department_name,
      percent: k.responsibility_bonus + k.performance_bonus > 0 
        ? Math.round((k.total_payout / (k.responsibility_bonus + k.performance_bonus)) * 100) 
        : 100
    }));

    return res.json({
      month: targetMonthPadded,
      year: targetYear,
      totalActive: totalActive?.count || 0,
      recordedCount,
      totalPayout,
      kpiSummary,
      deptKpi,
      topPerformers
    });
  } catch (error) {
    console.error('Lỗi báo cáo KPI:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
