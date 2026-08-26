import { query } from '../config/database.js';

export const getPayroll = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    
    let sql = `
      SELECT p.*, e.fullname, e.code as employee_code, d.name as department_name, p.status as payment_status
      FROM payroll p
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
    
    return res.json(records);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu bảng lương:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};

export const createPayroll = async (req, res) => {
  const { employee_id, month, year, base_salary, allowance, bonus, deductions, status, notes } = req.body;
  
  if (!employee_id || !month || !year) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (Nhân viên, Tháng, Năm).' });
  }

  try {
    const exist = await query.get('SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?', [employee_id, month.padStart(2, '0'), year]);
    if (exist) return res.status(400).json({ message: 'Phiếu lương tháng này của nhân viên đã tồn tại.' });

    const total_salary = (parseFloat(base_salary) || 0) + (parseFloat(allowance) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);
    const now = new Date().toISOString();

    const result = await query.run(`
      INSERT INTO payroll (
        employee_id, month, year, base_salary, allowance, bonus, deductions, total_salary, status, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employee_id, month.padStart(2, '0'), year,
      base_salary || 0, allowance || 0, bonus || 0, deductions || 0,
      total_salary, status || 'Chưa thanh toán', notes || '', now, now
    ]);

    return res.status(201).json({ message: 'Tạo phiếu lương thành công.', id: result.lastID });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi tạo phiếu lương.' });
  }
};

export const updatePayroll = async (req, res) => {
  const { id } = req.params;
  const { base_salary, allowance, bonus, deductions, status, notes } = req.body;
  
  try {
    const payroll = await query.get('SELECT * FROM payroll WHERE id = ?', [id]);
    if (!payroll) return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });

    const total_salary = (parseFloat(base_salary) || 0) + (parseFloat(allowance) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);
    const now = new Date().toISOString();

    await query.run(`
      UPDATE payroll 
      SET base_salary = ?, allowance = ?, bonus = ?, deductions = ?, total_salary = ?, status = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      base_salary || 0, allowance || 0, bonus || 0, deductions || 0,
      total_salary, status || 'Chưa thanh toán', notes || '', now, id
    ]);

    return res.json({ message: 'Cập nhật phiếu lương thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi cập nhật phiếu lương.' });
  }
};

export const deletePayroll = async (req, res) => {
  const { id } = req.params;
  try {
    const payroll = await query.get('SELECT * FROM payroll WHERE id = ?', [id]);
    if (!payroll) return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });

    await query.run('DELETE FROM payroll WHERE id = ?', [id]);
    return res.json({ message: 'Đã xóa phiếu lương.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xóa phiếu lương.' });
  }
};
