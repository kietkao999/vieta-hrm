import { query } from '../config/database.js';
import XLSX from 'xlsx';

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
    const { year, months, fromMonth, toMonth } = req.query;
    const now = new Date();
    const targetYear = parseInt(year || now.getFullYear().toString(), 10);

    let selectedMonths = [];
    if (months) {
      selectedMonths = months.split(',').map(m => m.trim().padStart(2, '0'));
    } else if (fromMonth && toMonth) {
      const startM = Math.min(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      const endM = Math.max(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      for (let i = startM; i <= endM; i++) selectedMonths.push(i.toString().padStart(2, '0'));
    } else {
      // Mặc định cả 12 tháng
      for (let i = 1; i <= 12; i++) selectedMonths.push(i.toString().padStart(2, '0'));
    }

    const monthRawList = selectedMonths.map(m => parseInt(m, 10).toString());
    const allMatches = Array.from(new Set([...selectedMonths, ...monthRawList]));
    const placeholders = allMatches.map(() => '?').join(',');

    // Tổng quỹ lương theo từng tháng được chọn
    const monthlyPayroll = await query.all(`
      SELECT p.month, 
             SUM(p.net_salary) as total_net_salary,
             SUM(p.tier_salary + p.grade_salary) as total_base_salary,
             SUM(p.responsibility_net) as total_responsibility_kpi,
             SUM(p.performance_bonus) as total_performance_bonus,
             SUM(p.discipline_deduction + p.other_deductions) as total_deductions,
             COUNT(DISTINCT p.employee_id) as employee_count
      FROM payrolls p
      WHERE p.year = ? AND p.month IN (${placeholders})
      GROUP BY p.month
      ORDER BY p.month ASC
    `, [targetYear, ...allMatches]);

    // Tổng quỹ lương toàn bộ giai đoạn được chọn
    const periodTotal = await query.get(`
      SELECT SUM(p.net_salary) as total_net, 
             SUM(p.tier_salary + p.grade_salary) as total_base,
             SUM(p.responsibility_net) as total_responsibility,
             SUM(p.performance_bonus) as total_performance,
             SUM(p.discipline_deduction + p.other_deductions) as total_deductions,
             COUNT(p.id) as total_records
      FROM payrolls p
      WHERE p.year = ? AND p.month IN (${placeholders})
    `, [targetYear, ...allMatches]);

    // Top nhân viên có tổng thu nhập cao nhất trong các tháng đã chọn
    const topSalaries = await query.all(`
      SELECT e.fullname, e.code, 
             SUM(p.net_salary) as net_salary,
             d.name as department_name,
             COUNT(p.id) as months_counted
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.year = ? AND p.month IN (${placeholders})
      GROUP BY p.employee_id
      ORDER BY net_salary DESC
      LIMIT 5
    `, [targetYear, ...allMatches]);

    return res.json({
      year: targetYear,
      months: selectedMonths,
      monthlyPayroll,
      yearTotal: periodTotal || {},
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
    const { month, months, fromMonth, toMonth, year } = req.query;
    const now = new Date();
    const targetYear = (year || now.getFullYear().toString()).toString();

    let selectedMonths = [];
    if (months) {
      selectedMonths = months.split(',').map(m => m.trim().padStart(2, '0'));
    } else if (fromMonth && toMonth) {
      const startM = Math.min(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      const endM = Math.max(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      for (let i = startM; i <= endM; i++) selectedMonths.push(i.toString().padStart(2, '0'));
    } else if (month) {
      selectedMonths = [month.toString().padStart(2, '0')];
    } else {
      selectedMonths = [(now.getMonth() + 1).toString().padStart(2, '0')];
    }

    const monthClauses = selectedMonths.map(m => `date LIKE '${targetYear}-${m}%'`).join(' OR ') || '1=0';

    // Tổng quan chấm công theo trạng thái
    const statusSummary = await query.all(`
      SELECT status, COUNT(*) as count
      FROM attendance
      WHERE ${monthClauses}
      GROUP BY status
    `);

    // Thống kê đi trễ gom theo nhân viên
    const lateStats = await query.all(`
      SELECT e.fullname, e.code, COUNT(*) as late_count, SUM(a.late_minutes) as total_late_minutes
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE (${monthClauses}) AND a.late_minutes > 0
      GROUP BY a.employee_id
      ORDER BY late_count DESC
    `);

    // Tổng giờ OT
    const otSummary = await query.get(`
      SELECT SUM(ot_hours) as total_ot, COUNT(DISTINCT employee_id) as ot_employees
      FROM attendance WHERE (${monthClauses}) AND ot_hours > 0
    `);

    // Tổng ngày công
    const totalWorkDays = await query.get(`
      SELECT COUNT(*) as total_days, COUNT(DISTINCT employee_id) as total_employees
      FROM attendance WHERE (${monthClauses}) AND (status = 'Đúng giờ' OR status = 'Đi trễ')
    `);

    return res.json({
      months: selectedMonths,
      monthCount: selectedMonths.length,
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
    const { month, months, fromMonth, toMonth, year } = req.query;
    const now = new Date();
    const targetYear = parseInt(year || now.getFullYear().toString(), 10);

    let selectedMonths = [];
    if (months) {
      selectedMonths = months.split(',').map(m => m.trim().padStart(2, '0'));
    } else if (fromMonth && toMonth) {
      const startM = Math.min(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      const endM = Math.max(parseInt(fromMonth, 10), parseInt(toMonth, 10));
      for (let i = startM; i <= endM; i++) selectedMonths.push(i.toString().padStart(2, '0'));
    } else if (month) {
      selectedMonths = [month.toString().padStart(2, '0')];
    } else {
      selectedMonths = [(now.getMonth() + 1).toString().padStart(2, '0')];
    }

    const monthRawList = selectedMonths.map(m => parseInt(m, 10).toString());
    const allMatches = Array.from(new Set([...selectedMonths, ...monthRawList]));
    const placeholders = allMatches.map(() => '?').join(',');

    // Thống kê tổng hợp KPI
    const totalActive = await query.get(
      `SELECT COUNT(*) as count FROM employees WHERE status != 'Đã nghỉ việc'`
    );

    const savedKpis = await query.all(
      `SELECT k.*, e.fullname, e.code, d.name as department_name,
              (MAX(0, k.responsibility_amount) + MAX(0, k.performance_bonus) - MAX(0, k.discipline_deduction)) as total_payout
       FROM employee_monthly_kpis k
       JOIN employees e ON k.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE k.year = ? AND k.month IN (${placeholders})
       ORDER BY total_payout DESC`,
      [targetYear, ...allMatches]
    );

    const recordedCount = savedKpis.length;
    const totalPayout = savedKpis.reduce((acc, k) => acc + (k.total_payout || 0), 0);
    const avgPayout = recordedCount > 0 ? Math.round(totalPayout / recordedCount) : 0;

    const kpiSummary = [
      { status: 'Đã thiết lập', count: recordedCount, avg_score: avgPayout, avg_percent: recordedCount > 0 ? 100 : 0 },
      { status: 'Chưa có dữ liệu', count: Math.max(0, (totalActive?.count || 0) * selectedMonths.length - recordedCount), avg_score: 0, avg_percent: 0 }
    ];

    // KPI theo phòng ban (tổng hợp qua tất cả các tháng đã chọn)
    const deptKpi = await query.all(`
      SELECT COALESCE(d.name, 'Chưa phân bổ') as department_name,
             COUNT(k.id) as kpi_count,
             SUM(MAX(0, k.responsibility_amount) + MAX(0, k.performance_bonus) - MAX(0, k.discipline_deduction)) as total_dept_payout,
             AVG(MAX(0, k.responsibility_amount) + MAX(0, k.performance_bonus) - MAX(0, k.discipline_deduction)) as avg_score,
             100 as avg_percent
      FROM employee_monthly_kpis k
      JOIN employees e ON k.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE k.year = ? AND k.month IN (${placeholders})
      GROUP BY d.id, d.name
      ORDER BY total_dept_payout DESC
    `, [targetYear, ...allMatches]);

    // Top performers (tổng thu nhập KPI và hiệu quả qua các tháng đã chọn)
    const empKpiMap = new Map();
    for (const k of savedKpis) {
      if (!empKpiMap.has(k.employee_id)) {
        empKpiMap.set(k.employee_id, {
          fullname: k.fullname,
          code: k.code,
          department_name: k.department_name,
          total_payout: 0,
          target_score: 0
        });
      }
      const item = empKpiMap.get(k.employee_id);
      item.total_payout += (k.total_payout || 0);
      item.target_score += ((k.responsibility_bonus || 0) + (k.performance_bonus || 0));
    }

    const topPerformers = Array.from(empKpiMap.values())
      .sort((a, b) => b.total_payout - a.total_payout)
      .slice(0, 5)
      .map(p => ({
        fullname: p.fullname,
        code: p.code,
        achieved_score: p.total_payout,
        target_score: p.target_score,
        criteria: 'Tổng KPI & Hiệu quả',
        department_name: p.department_name,
        percent: p.target_score > 0 ? Math.round((p.total_payout / p.target_score) * 100) : 100
      }));

    return res.json({
      months: selectedMonths,
      monthCount: selectedMonths.length,
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

// Xuất báo cáo Excel theo tháng hoặc khoảng tháng
export const exportReportExcel = async (req, res) => {
  try {
    const { fromMonth, toMonth, months, year, reportType = 'all' } = req.query;
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(year || currentYear.toString(), 10);

    let monthList = [];
    if (months) {
      monthList = months.split(',').map(m => m.trim().padStart(2, '0'));
    } else {
      const startM = Math.min(Math.max(1, parseInt(fromMonth || 1, 10)), 12);
      const endM = Math.min(Math.max(startM, parseInt(toMonth || startM, 10)), 12);
      for (let i = startM; i <= endM; i++) {
        monthList.push(i.toString().padStart(2, '0'));
      }
    }
    const monthListRaw = monthList.map(m => parseInt(m, 10).toString());
    const allMonthMatches = Array.from(new Set([...monthList, ...monthListRaw]));
    const placeholders = allMonthMatches.map(() => '?').join(',');

    const wb = XLSX.utils.book_new();

    // 1. BẢNG LƯƠNG
    if (reportType === 'all' || reportType === 'payroll') {
      const payrollSql = `
        SELECT p.*, e.code as employee_code, e.fullname, e.gender,
               d.name as department_name, pos.name as position_name, b.name as branch_name
        FROM payrolls p
        JOIN employees e ON p.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        LEFT JOIN branches b ON e.branch_id = b.id
        WHERE p.year = ? AND p.month IN (${placeholders})
        ORDER BY p.month ASC, d.name ASC, e.code ASC
      `;
      const payrolls = await query.all(payrollSql, [targetYear, ...allMonthMatches]);

      const payrollFormatted = payrolls.map((p, idx) => ({
        'STT': idx + 1,
        'Mã NV': p.employee_code,
        'Họ và Tên': p.fullname,
        'Phòng Ban': p.department_name || 'Khác',
        'Chức Vụ': p.position_name || '',
        'Chi Nhánh': p.branch_name || 'Việt Á',
        'Kỳ Lương': `Tháng ${p.month.toString().padStart(2, '0')}/${p.year}`,
        'Lương Tầng (đ)': p.tier_salary || 0,
        'Lương Bậc (đ)': p.grade_salary || 0,
        'Định Mức KPI (đ)': p.responsibility_quota || 0,
        'Tỷ Lệ Đạt KPI': `${Math.round((1 - (p.responsibility_deduction_rate || 0)) * 100)}%`,
        'KPI Trách Nhiệm Thực Nhận (đ)': p.responsibility_net || 0,
        'Thưởng Hiệu Quả (đ)': p.performance_bonus || 0,
        'Khấu Trừ Khác (đ)': (p.discipline_deduction || 0) + (p.other_deductions || 0),
        'Thực Lĩnh (đ)': p.net_salary || 0,
        'Trạng Thái': p.status || 'Đã chốt'
      }));

      const wsPayroll = XLSX.utils.json_to_sheet(payrollFormatted);
      wsPayroll['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 22 }, { wch: 20 },
        { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 16 },
        { wch: 14 }, { wch: 26 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, wsPayroll, 'Bảng Lương Chi Tiết');
    }

    // 2. KPI & HIỆU QUẢ
    if (reportType === 'all' || reportType === 'kpi') {
      const kpiSql = `
        SELECT k.*, e.code as employee_code, e.fullname,
               d.name as department_name, pos.name as position_name
        FROM employee_monthly_kpis k
        JOIN employees e ON k.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        WHERE k.year = ? AND k.month IN (${placeholders})
        ORDER BY k.month ASC, d.name ASC, e.code ASC
      `;
      const kpis = await query.all(kpiSql, [targetYear, ...allMonthMatches]);

      const kpiFormatted = kpis.map((k, idx) => {
        const totalKpiPayout = (k.responsibility_amount || 0) + (k.performance_bonus || 0) - (k.discipline_deduction || 0);
        return {
          'STT': idx + 1,
          'Mã NV': k.employee_code,
          'Họ và Tên': k.fullname,
          'Phòng Ban': k.department_name || 'Khác',
          'Chức Vụ': k.position_name || '',
          'Kỳ Đánh Giá': `Tháng ${k.month.toString().padStart(2, '0')}/${k.year}`,
          'Định Mức KPI Trách Nhiệm (đ)': k.responsibility_bonus || 0,
          'Tỷ Lệ Đạt (% Trách Nhiệm)': `${Math.round((k.responsibility_rate || 1) * 100)}%`,
          'KPI Trách Nhiệm Thực Nhận (đ)': k.responsibility_amount || 0,
          'Thưởng Hiệu Quả Phát Sinh (đ)': k.performance_bonus || 0,
          'Khấu Trừ Phạt (đ)': (k.responsibility_penalty || 0) + (k.discipline_deduction || 0),
          'Tổng KPI & Hiệu Quả Thực Nhận (đ)': Math.max(0, totalKpiPayout),
          'Ghi Chú': k.note || ''
        };
      });

      const wsKpi = XLSX.utils.json_to_sheet(kpiFormatted);
      wsKpi['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 22 }, { wch: 20 },
        { wch: 15 }, { wch: 26 }, { wch: 22 }, { wch: 26 }, { wch: 24 },
        { wch: 16 }, { wch: 30 }, { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(wb, wsKpi, 'Báo Cáo KPI & Hiệu Quả');
    }

    // 3. CHẤM CÔNG
    if (reportType === 'all' || reportType === 'attendance') {
      const attendanceSql = `
        SELECT a.employee_id, strftime('%m', a.date) as month_val,
               e.code as employee_code, e.fullname, d.name as department_name, pos.name as position_name,
               COUNT(CASE WHEN a.status = 'Đúng giờ' THEN 1 END) as on_time_days,
               COUNT(CASE WHEN a.status = 'Đi trễ' THEN 1 END) as late_days,
               SUM(COALESCE(a.late_minutes, 0)) as total_late_minutes,
               SUM(COALESCE(a.ot_hours, 0)) as total_ot_hours,
               COUNT(CASE WHEN a.status = 'Nghỉ phép' THEN 1 END) as leave_days,
               COUNT(a.id) as total_attendance_logs
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        WHERE strftime('%Y', a.date) = ? AND strftime('%m', a.date) IN (${monthList.map(() => '?').join(',')})
        GROUP BY a.employee_id, strftime('%m', a.date)
        ORDER BY month_val ASC, d.name ASC, e.code ASC
      `;
      const attendances = await query.all(attendanceSql, [targetYear.toString(), ...monthList]);

      const attFormatted = attendances.map((a, idx) => ({
        'STT': idx + 1,
        'Mã NV': a.employee_code,
        'Họ và Tên': a.fullname,
        'Phòng Ban': a.department_name || 'Khác',
        'Chức Vụ': a.position_name || '',
        'Kỳ Chấm Công': `Tháng ${a.month_val}/${targetYear}`,
        'Số Ngày Đúng Giờ': a.on_time_days || 0,
        'Số Ngày Đi Trễ': a.late_days || 0,
        'Tổng Phút Trễ (phút)': a.total_late_minutes || 0,
        'Tổng Giờ OT (giờ)': a.total_ot_hours || 0,
        'Số Ngày Nghỉ Phép': a.leave_days || 0,
        'Tổng Lượt Ghi Nhận': a.total_attendance_logs || 0
      }));

      const wsAtt = XLSX.utils.json_to_sheet(attFormatted.length > 0 ? attFormatted : [{ 'Thông báo': `Chưa có dữ liệu chấm công từ Tháng ${startM} đến Tháng ${endM} năm ${targetYear}` }]);
      wsAtt['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 22 }, { wch: 20 },
        { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 18 },
        { wch: 18 }, { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(wb, wsAtt, 'Thống Kê Chấm Công');
    }

    // 4. DANH SÁCH NHÂN SỰ
    if (reportType === 'all' || reportType === 'summary') {
      const empSql = `
        SELECT e.*, d.name as department_name, pos.name as position_name, b.name as branch_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN positions pos ON e.position_id = pos.id
        LEFT JOIN branches b ON e.branch_id = b.id
        WHERE e.status != 'Đã nghỉ việc'
        ORDER BY d.name ASC, e.code ASC
      `;
      const employees = await query.all(empSql);

      const empFormatted = employees.map((e, idx) => ({
        'STT': idx + 1,
        'Mã NV': e.code,
        'Họ và Tên': e.fullname,
        'Giới Tính': e.gender || '',
        'Ngày Sinh': e.dob || '',
        'Số Điện Thoại': e.phone || '',
        'Phòng Ban': e.department_name || 'Khác',
        'Chức Vụ': e.position_name || '',
        'Chi Nhánh': e.branch_name || 'Việt Á',
        'Ngày Vào Làm': e.join_date || '',
        'Trạng Thái': e.status || 'Đang làm việc',
        'Tầng Lương': e.tier || '',
        'Bậc Lương': e.grade || '',
        'Lương Tầng (đ)': e.tier_salary || 0,
        'Lương Bậc (đ)': e.grade_salary || 0,
        'Định Mức KPI (đ)': e.kpi_bonus || 0
      }));

      const wsEmp = XLSX.utils.json_to_sheet(empFormatted);
      wsEmp['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 14 },
        { wch: 15 }, { wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 14 },
        { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 16 }
      ];
      XLSX.utils.book_append_sheet(wb, wsEmp, 'Danh Sách Nhân Sự');
    }

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    let filePrefix = 'Bao_Cao_Tong_Hop_Viet_A';
    if (reportType === 'payroll') filePrefix = 'Bang_Luong_Viet_A';
    else if (reportType === 'kpi') filePrefix = 'Bao_Cao_KPI_Viet_A';
    else if (reportType === 'attendance') filePrefix = 'Bao_Cao_Cham_Cong_Viet_A';
    else if (reportType === 'summary') filePrefix = 'Danh_Sach_Nhan_Su_Viet_A';

    let timeRangeStr = `Thang${startM.toString().padStart(2, '0')}_${targetYear}`;
    if (startM !== endM) {
      timeRangeStr = `Thang${startM.toString().padStart(2, '0')}_den_Thang${endM.toString().padStart(2, '0')}_${targetYear}`;
    }

    const fileName = `${filePrefix}_${timeRangeStr}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    console.error('Lỗi xuất báo cáo Excel:', error);
    return res.status(500).json({ message: 'Không thể xuất báo cáo Excel: ' + error.message });
  }
};

