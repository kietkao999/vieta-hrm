import { query } from '../config/database.js';

export const getPayroll = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    
    let sql = `
      SELECT p.*, e.fullname, e.code as employee_code, d.name as department_name
      FROM payrolls p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (month && year) {
      sql += ` AND p.month = ? AND p.year = ?`;
      params.push(month.padStart(2, '0'), year);
    }

    // Phân quyền
    if (req.user.roleName === 'EMPLOYEE') {
      sql += ` AND p.employee_id = ?`;
      params.push(req.user.employeeId);
    } else if (req.user.roleName === 'MANAGER') {
      sql += ` AND e.department_id = ?`;
      params.push(req.user.departmentId);
    } else if (employee_id) {
      sql += ` AND p.employee_id = ?`;
      params.push(employee_id);
    }

    sql += ` ORDER BY p.year DESC, p.month DESC, e.fullname ASC`;
    const records = await query.all(sql, params);
    
    // Luôn trả về mảng, nếu trống thì trả về [] thay vì throw lỗi
    return res.json(records || []);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu bảng lương:', error);
    // Vẫn trả về mảng rỗng nếu có lỗi nghiêm trọng để UI không bị văng
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

    // 2. Với mỗi nhân viên, tính lương
    for (const emp of employees) {
      // 2.1 Lấy KPI tháng của nhân viên
      const kpi = await query.get(`
        SELECT responsibility_bonus, responsibility_rate, performance_bonus, discipline_deduction
        FROM employee_monthly_kpis
        WHERE employee_id = ? AND month = ? AND year = ?
      `, [emp.id, padMonth, year]);

      // Các giá trị mặc định nếu chưa có KPI tháng này
      const respQuota = kpi ? parseFloat(kpi.responsibility_bonus || 0) : 0;
      const respRate = kpi ? parseFloat(kpi.responsibility_rate || 1.0) : 1.0;
      const perfBonus = kpi ? parseFloat(kpi.performance_bonus || 0) : 0;
      const discDeduct = kpi ? parseFloat(kpi.discipline_deduction || 0) : 0;

      // 2.2 Tính toán theo công thức
      const tierSalary = parseFloat(emp.tier_salary || 0);
      const gradeSalary = parseFloat(emp.grade_salary || 0);

      // Trách nhiệm: Tiền phạt = Định mức * (1 - Tỷ lệ đạt)
      // Tỷ lệ bị trừ
      const deductRate = 1.0 - respRate;
      const respNet = respQuota * respRate;

      // Hiệu quả: Max(0, Thưởng - Phạt)
      const perfNet = Math.max(0, perfBonus - discDeduct);

      // Tổng
      const netSalary = tierSalary + gradeSalary + respNet + perfNet;

      // 2.3 Lưu vào bảng payrolls (nếu có rồi thì cập nhật, chưa thì insert)
      const exist = await query.get(`
        SELECT id FROM payrolls WHERE employee_id = ? AND month = ? AND year = ?
      `, [emp.id, padMonth, year]);

      if (exist) {
        await query.run(`
          UPDATE payrolls 
          SET tier_salary=?, grade_salary=?, 
              responsibility_quota=?, responsibility_deduction_rate=?, responsibility_net=?,
              performance_bonus=?, discipline_deduction=?, performance_net=?,
              net_salary=?, updated_at=?
          WHERE id = ?
        `, [
          tierSalary, gradeSalary,
          respQuota, deductRate, respNet,
          perfBonus, discDeduct, perfNet,
          netSalary, now,
          exist.id
        ]);
      } else {
        await query.run(`
          INSERT INTO payrolls (
            employee_id, month, year, 
            tier_salary, grade_salary, 
            responsibility_quota, responsibility_deduction_rate, responsibility_net,
            performance_bonus, discipline_deduction, performance_net,
            net_salary, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dự thảo', ?, ?)
        `, [
          emp.id, padMonth, year,
          tierSalary, gradeSalary,
          respQuota, deductRate, respNet,
          perfBonus, discDeduct, perfNet,
          netSalary, now, now
        ]);
      }
      successCount++;
    }

    return res.json({ message: `Đã tính lương thành công cho ${successCount} nhân sự.` });
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
  const { status, tier_salary, grade_salary, responsibility_deduction_rate, performance_bonus, discipline_deduction, other_deductions } = req.body;
  
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

    // If updating salary details
    const tSalary = parseFloat(tier_salary || 0);
    const gSalary = parseFloat(grade_salary || 0);
    const respQuota = parseFloat(payroll.responsibility_quota || 0);
    const respDeductRate = parseFloat(responsibility_deduction_rate !== undefined ? responsibility_deduction_rate : payroll.responsibility_deduction_rate);
    const perfBonus = parseFloat(performance_bonus || 0);
    const discDeduct = parseFloat(discipline_deduction || 0);
    const otherDeduct = parseFloat(other_deductions || 0);

    const respNet = respQuota * (1 - respDeductRate);
    const perfNet = Math.max(0, perfBonus - discDeduct);
    const netSalary = tSalary + gSalary + respNet + perfNet - otherDeduct;

    await query.run(`
      UPDATE payrolls 
      SET tier_salary = ?, grade_salary = ?, 
          responsibility_deduction_rate = ?, responsibility_net = ?,
          performance_bonus = ?, discipline_deduction = ?, performance_net = ?,
          other_deductions = ?, net_salary = ?, updated_at = ?
      WHERE id = ?
    `, [
      tSalary, gSalary, 
      respDeductRate, respNet,
      perfBonus, discDeduct, perfNet,
      otherDeduct, netSalary, now, id
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
