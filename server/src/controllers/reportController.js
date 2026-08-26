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
    const targetMonth = month || (now.getMonth() + 1).toString().padStart(2, '0');
    const targetYear = year || now.getFullYear().toString();

    // Phân loại KPI
    const kpiSummary = await query.all(`
      SELECT status, COUNT(*) as count, 
             AVG(achieved_score) as avg_score,
             AVG(CASE WHEN target_score > 0 THEN (achieved_score * 100.0 / target_score) ELSE 0 END) as avg_percent
      FROM kpi
      WHERE month = ? AND year = ?
      GROUP BY status
    `, [targetMonth.padStart(2, '0'), targetYear]);

    // KPI theo phòng ban
    const deptKpi = await query.all(`
      SELECT d.name as department_name,
             COUNT(k.id) as kpi_count,
             AVG(k.achieved_score) as avg_score,
             AVG(CASE WHEN k.target_score > 0 THEN (k.achieved_score * 100.0 / k.target_score) ELSE 0 END) as avg_percent
      FROM kpi k
      JOIN employees e ON k.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE k.month = ? AND k.year = ?
      GROUP BY d.id, d.name
      ORDER BY avg_percent DESC
    `, [targetMonth.padStart(2, '0'), targetYear]);

    // Top performers
    const topPerformers = await query.all(`
      SELECT e.fullname, e.code, k.achieved_score, k.target_score, k.criteria, d.name as department_name,
             CASE WHEN k.target_score > 0 THEN ROUND(k.achieved_score * 100.0 / k.target_score, 1) ELSE 0 END as percent
      FROM kpi k
      JOIN employees e ON k.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE k.month = ? AND k.year = ? AND k.status = 'Đã đánh giá'
      ORDER BY percent DESC
      LIMIT 5
    `, [targetMonth.padStart(2, '0'), targetYear]);

    return res.json({
      month: targetMonth,
      year: targetYear,
      kpiSummary,
      deptKpi,
      topPerformers
    });
  } catch (error) {
    console.error('Lỗi báo cáo KPI:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
